import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Garante que não haja dois emails iguais
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Não mostra a senha em buscas (ex: get users)
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['funcionario', 'gerente'], // Só aceita esses dois valores
    default: 'funcionario',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const User = mongoose.model('User', UserSchema);

export default User;