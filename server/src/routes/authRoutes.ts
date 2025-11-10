import express from 'express';
import User from '../models/User'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Função para gerar o token
function generateToken(userId: string, userRole: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido no .env');
  }

  return jwt.sign(
    { id: userId, role: userRole },
    secret,
    { expiresIn: '1d' }
  );
}

// Rota: POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Email já cadastrado.' });
    }

    const user = await User.create({email, password, name, role, });

    user.password = undefined as any;
    return res.status(201).send({ user });

    const token = generateToken(user.id, user.role);
    return res.status(201).send({ user, token });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Falha no registro.' });
  }
});

// Rota: POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).send({ error: 'Usuário não encontrado.' });
    }

    if (!user.password) {
      return res.status(500).send({ error: 'Erro interno ao buscar senha.' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Senha inválida.' });
    }

    const token = generateToken(user.id, user.role);

    user.password = undefined as any;
    res.send({ user, token });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Falha no login.' });
  }
});

export default router;