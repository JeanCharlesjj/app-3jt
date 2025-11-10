import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import Compra from '../models/Compra';
import Trator from '../models/Trator';
import mongoose from 'mongoose';

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { description, value, purchaseDate, category, paymentMethod, tratorId } = req.body;
  const userId = req.user?.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(tratorId)) {
      return res.status(400).send({ error: 'ID do trator é inválido.' });
    }

    const tratorExists = await Trator.findById(tratorId);

    if (!tratorExists) {
      return res.status(404).send({ error: 'Máquina (trator) não encontrada.' });
    }

    const compra = await Compra.create({
      description,
      value,
      purchaseDate,
      category,
      paymentMethod,
      trator: tratorId,
      user: userId,
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