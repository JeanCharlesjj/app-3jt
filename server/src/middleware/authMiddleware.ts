import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedPayload extends JwtPayload {
  id: string;
  role: 'manager' | 'employee';
}

const secret = process.env.JWT_SECRET;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!secret) {
    console.error('ERRO GRAVE: JWT_SECRET não definido no .env');
    return res.status(500).send({ error: 'Erro interno do servidor.' });
  }
  
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: 'Nenhum token fornecido.' });
  }

  const parts = authorization.split(' ');

  if (parts.length !== 2) {
    return res.status(401).send({ error: 'Token com formato inválido.' });
  }
  
  const [scheme, token] = parts;

  if (!scheme || !token) {
     return res.status(401).send({ error: 'Token com formato inválido.' });
  }

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token mal formatado (sem "Bearer").' });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'role' in decoded) {
      const payload = decoded as DecodedPayload; 
      
      req.user = { id: payload.id, role: payload.role };
      return next();
    }
    
    return res.status(401).send({ error: 'Token inválido ou mal formatado.' });

  } catch (err) {
    return res.status(401).send({ error: 'Token inválido ou expirado.' });
  }
};