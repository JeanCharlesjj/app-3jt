import express from 'express';
import Trator from '../models/Trator';
import { authMiddleware } from '../middleware/authMiddleware';

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

export default router;