import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/authMiddleware'; // Nosso "segurança"
import User from '../models/User'; // Model de User

const router = express.Router();

router.use(authMiddleware);

// Rota: GET /users/employees (READ - Listar Funcionários)
// Regra: Somente 'manager' pode ver a lista.
router.get('/employees', async (req, res) => {
  // 1. Verifica a permissão
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado.' });
  }

  try {
    // 2. Busca todos os utilizadores que são 'employee' E estão ativos
    const employees = await User.find({
      role: 'employee',
      isActive: true,
    }).sort('name'); // Ordena por nome

    return res.send(employees);
  } catch (err) {
    return res.status(500).send({ error: 'Falha ao buscar funcionários.' });
  }
});

// ---
// Rota: GET /users/:id (READ - Buscar Um)
// Regra: Somente 'manager' pode ver os detalhes.
// ---
router.get('/:id', async (req, res) => {
  // 1. Verifica a permissão
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado.' });
  }

  // 2. Valida o ID
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID do usuário é inválido.' });
  }

  try {
    // 3. Busca o utilizador no banco
    const user = await User.findById(id);
    if (!user || user.isActive === false) {
      return res.status(404).send({ error: 'Funcionário não encontrado.' });
    }
    return res.send(user); // Sucesso

  } catch (err) {
    return res.status(500).send({ error: 'Falha ao buscar funcionário.' });
  }
});

// ---
// Rota: PUT /users/:id (UPDATE - Editar Funcionário)
// Regra: Somente 'manager' pode editar.
// ---
router.put('/:id', async (req, res) => {
  // 1. Verifica a permissão
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado.' });
  }

  // 2. Valida o ID
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID do usuário é inválido.' });
  }

  // 3. Pega os dados (só permitimos mudar nome, email e role)
  const { name, email, role } = req.body;
  if (!name || !email || (role !== 'employee' && role !== 'manager')) {
     return res.status(400).send({ error: 'Dados inválidos.' });
  }
  
  try {
    // 4. Acha e atualiza
    const userAtualizado = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    );

    if (!userAtualizado) {
      return res.status(404).send({ error: 'Funcionário não encontrado.' });
    }
    return res.send(userAtualizado);

  } catch (err: any) {
    // Erro se o email (unique) já existir
    if (err.code === 11000) { 
      return res.status(400).send({ error: 'Este email já está em uso.' });
    }
    return res.status(400).send({ error: 'Falha ao atualizar funcionário.' });
  }
});

// ---
// Rota: DELETE /users/:id (DISABLE - Desabilitar Funcionário)
// Regra: Somente 'manager' pode desabilitar.
// ---
router.delete('/:id', async (req, res) => {
  // 1. Verifica a permissão
  if (req.user?.role !== 'manager') {
    return res.status(403).send({ error: 'Acesso negado.' });
  }
  
  // 2. Valida o ID
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'ID do usuário é inválido.' });
  }

  try {
    // 3. Acha e desabilita (Soft Delete)
    const userDesabilitado = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!userDesabilitado) {
      return res.status(404).send({ error: 'Funcionário não encontrado.' });
    }
    return res.send({ message: 'Funcionário desabilitado com sucesso.' });

  } catch (err) {
    return res.status(500).send({ error: 'Falha ao desabilitar funcionário.' });
  }
});

export default router;