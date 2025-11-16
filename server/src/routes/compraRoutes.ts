import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import Compra from '../models/Compra';
import Trator from '../models/Trator';
import mongoose from 'mongoose';

import multer from 'multer';
import uploadConfig from '../config/upload';

const router = express.Router();

const upload = multer(uploadConfig);

router.use(authMiddleware);

// ---
// Rota: POST /compras (CREATE)
// AGORA COM UPLOAD DE IMAGEM
// ---
// 1. O middleware 'upload.single' corre PRIMEIRO
router.post('/', upload.single('receiptImage'), async (req, res) => {
  // 2. Os dados de texto estão em 'req.body'
  const { description, value, purchaseDate, category, paymentMethod, tratorId } = req.body;
  const userId = req.user?.id;

  // 3. Os dados do ficheiro (se existir) estão em 'req.file'
  // Vamos guardar apenas o nome do ficheiro (filename)
  const receiptImageUrl = req.file ? req.file.filename : undefined;

  try {
    // ... (A tua validação do tratorId continua igual)
    if (!mongoose.Types.ObjectId.isValid(tratorId)) {
      return res.status(400).send({ error: 'ID do trator é inválido.' });
    }
    const tratorExists = await Trator.findById(tratorId);
    if (!tratorExists) {
      return res.status(404).send({ error: 'Máquina (trator) não encontrada.' });
    }

    // 4. Converte o 'value' (que vem como string do FormData)
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
       return res.status(400).send({ error: 'Valor inválido.' });
    }

    const compra = await Compra.create({
      description,
      value: numericValue, // Usa o valor numérico
      purchaseDate: new Date(purchaseDate), // Converte a data
      category,
      paymentMethod,
      trator: tratorId,
      user: userId,
      receiptImageUrl: receiptImageUrl, // 5. SALVA O NOME DO FICHEIRO
    });

    return res.status(201).send(compra);

  } catch (err: any) {
    return res.status(400).send({ error: 'Falha ao registrar compra.', details: err.message });
  }
});

router.get('/', async (req, res) => {
  const { role, id: userId } = req.user!; 

  try {
    let query: any = { isActive: true }; 

    if (role === 'employee') {
      query.user = userId; 
    }
    
    const compras = await Compra.find(query)
      .sort('-purchaseDate') 
      .populate('user', 'name') 
      .populate('trator', 'name plate'); 

    return res.send(compras);

  } catch (err) {
    return res.status(500).send({ error: 'Falha ao buscar compras.' });
  }
});

// ---
// Rota: GET /compras/dashboard (READ - Totais)
// Regra: Manager vê o total de TODOS. Employee vê o total SÓ DELE.
// ---
router.get('/dashboard', async (req, res) => {
  const { role, id: userId } = req.user!; // Sabemos que req.user existe

  try {
    // 1. Define o período: Mês atual
    const hoje = new Date();
    const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59); // Último dia, último segundo

    // 2. Define o filtro (Match) base
    const filtroMatch: any = {
      isActive: true, // Só compras ativas
      purchaseDate: {
        $gte: inicioDoMes,
        $lte: fimDoMes,
      },
    };

    // 3. Adiciona filtro por função (Role)
    if (role === 'employee') {
      // Se for funcionário, o filtro SÓ inclui as compras dele
      filtroMatch.user = new mongoose.Types.ObjectId(userId);
    }

    // 4. Corre a "Agregação" (Magia do MongoDB)
    // Isto é muito mais rápido do que puxar todos e somar no código
    const resultado = await Compra.aggregate([
      {
        $match: filtroMatch, // Filtra os documentos
      },
      {
        $group: {
          _id: null, // Agrupa TUDO num só
          totalGastoMes: { $sum: '$value' }, // Soma o campo 'value'
        },
      },
    ]);

    // 5. Prepara a resposta
    let totalGastoMes = 0;
    if (resultado.length > 0) {
      totalGastoMes = resultado[0].totalGastoMes;
    }

    return res.send({ totalGastoMes });

  } catch (err) {
    console.error('Erro ao gerar dashboard:', err);
    return res.status(500).send({ error: 'Falha ao buscar dados do dashboard.' });
  }
});

// ---
// Rota: GET /compras/:id (READ - Detalhes de Uma Compra)
// Regra: Manager vê qualquer uma. Employee vê SÓ AS DELE.
// ---
router.get('/:id', async (req, res) => {
  const { id: purchaseId } = req.params; // ID da compra
  const { role, id: userId } = req.user!; // ID do utilizador logado

  // 1. Valida o ID da compra
  if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
    return res.status(400).send({ error: 'ID da compra é inválido.' });
  }

  try {
    // 2. Busca a compra no banco e "popula" os dados do trator e utilizador
    const compra = await Compra.findById(purchaseId)
      .populate('user', 'name')
      .populate('trator', 'name plate modelName');

    if (!compra || compra.isActive === false) {
      return res.status(404).send({ error: 'Compra não encontrada.' });
    }

    // 3. REGRA DE PERMISSÃO
    if (typeof compra.user === 'object' && compra.user !== null && '_id' in compra.user) {
      // É um objeto IUser, podemos aceder a ._id
      if (role === 'employee' && compra.user._id.toString() !== userId) {
        return res.status(403).send({ error: 'Acesso negado.' });
      }
    } else {
      // É apenas um ObjectId (não foi populado)
      // (Isto não deve acontecer por causa do .populate(), mas é uma segurança)
      if (role === 'employee' && compra.user.toString() !== userId) {
        return res.status(403).send({ error: 'Acesso negado (ref).' });
      }
    }

    // 4. Se for gerente ou se for o dono da compra, sucesso!
    return res.send(compra);

  } catch (err) {
    console.error('Erro ao buscar detalhes da compra:', err);
    return res.status(500).send({ error: 'Falha ao buscar detalhes.' });
  }
});

router.delete('/:id', async (req, res) => {
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado. Somente gerentes podem desabilitar compras.' });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID da compra é inválido.' });
  }

  try {
    const compraDesabilitada = await Compra.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!compraDesabilitada) {
      return res.status(404).send({ error: 'Compra não encontrada.' });
    }

    return res.send({ message: 'Compra desabilitada com sucesso.' });

  } catch (err) {
    return res.status(500).send({ error: 'Falha ao desabilitar compra.' });
  }
});

export default router;