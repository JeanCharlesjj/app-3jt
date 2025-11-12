import express from 'express';
import Trator from '../models/Trator';
import { authMiddleware } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { name, modelName, plate } = req.body;
    const trator = await Trator.create({ name, modelName, plate });
    return res.status(201).send(trator);

  } catch (err: any) {
    if (err.code === 11000) { 
      return res.status(400).send({ error: 'Placa ou identificador já cadastrado.' });
    }
    return res.status(400).send({ error: 'Falha ao cadastrar máquina.', details: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tratores = await Trator.find().sort('-createdAt');
    return res.send(tratores);
  } catch (err) {
    return res.status(500).send({ error: 'Falha ao buscar máquinas.' });
  }
});

// ---
// Rota: GET /tratores/:id (READ - Buscar Um)
// Regra: Qualquer um logado pode buscar um trator (útil para detalhes)
// ---
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // 1. Valida o formato do ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID do trator é inválido.' });
  }

  try {
    // 2. Busca o trator no banco
    const trator = await Trator.findById(id);
    if (!trator) {
      return res.status(404).send({ error: 'Máquina (trator) não encontrada.' });
    }
    return res.send(trator); // Sucesso

  } catch (err) {
    return res.status(500).send({ error: 'Falha ao buscar máquina.' });
  }
});

// ---
// Rota: PUT /tratores/:id (UPDATE - Editar)
// Regra: Somente 'manager' pode editar.
// ---
router.put('/:id', async (req, res) => {
  // 1. VERIFICA A PERMISSÃO
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado. Somente gerentes podem editar máquinas.' });
  }

  // 2. Valida o ID
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID do trator é inválido.' });
  }

  // 3. Pega os dados para atualizar
  const { name, modelName, plate } = req.body;
  if (!name) {
    return res.status(400).send({ error: 'O nome da máquina é obrigatório.' });
  }

  try {
    // 4. Acha e atualiza
    const tratorAtualizado = await Trator.findByIdAndUpdate(
      id,
      { name, modelName, plate },
      { new: true, runValidators: true } // 'new: true' retorna o doc atualizado
    );

    if (!tratorAtualizado) {
      return res.status(404).send({ error: 'Máquina (trator) não encontrada.' });
    }
    return res.send(tratorAtualizado); // Sucesso

  } catch (err: any) {
     // Erro comum se a placa (unique) já existir em *outro* documento
    if (err.code === 11000) { 
      return res.status(400).send({ error: 'Placa ou identificador já cadastrado.' });
    }
    return res.status(400).send({ error: 'Falha ao atualizar máquina.', details: err.message });
  }
});

// ---
// Rota: DELETE /tratores/:id (DELETE - Excluir)
// Regra: Somente 'manager' pode excluir.
// ---
router.delete('/:id', async (req, res) => {
  // 1. VERIFICA A PERMISSÃO
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado. Somente gerentes podem excluir máquinas.' });
  }

  // 2. Valida o ID
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID do trator é inválido.' });
  }

  try {
    // 3. Acha e deleta
    const tratorDeletado = await Trator.findByIdAndDelete(id);

    if (!tratorDeletado) {
      return res.status(404).send({ error: 'Máquina (trator) não encontrada.' });
    }
    return res.send({ message: 'Máquina excluída com sucesso.' }); // Sucesso

  } catch (err) {
    return res.status(500).send({ error: 'Falha ao excluir máquina.' });
  }
});

export default router;