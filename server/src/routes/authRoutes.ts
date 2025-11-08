import express from 'express';
import User from '../models/User'; // Importa nosso Model

const router = express.Router();

// Rota: POST /auth/register
router.post('/register', async (req, res) => {
  // 'req.body' são os dados que o app mobile vai enviar (JSON)
  const { email, password, name, role } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Email já cadastrado.' });
    }

    const user = await User.create({
      email,
      password,
      name,
      role,
    });

    // Responde com sucesso (sem mostrar a senha)
    user.password = undefined as any;
    return res.status(201).send({ user });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Falha no registro.' });
  }
});

export default router;