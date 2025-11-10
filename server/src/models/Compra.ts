import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User'; // Importamos a interface do User
import { ITrator } from './Trator'; // Importamos a interface do Trator

// Interface para o TypeScript
export interface ICompra extends Document {
  description: string;
  value: number;
  purchaseDate: Date;
  category: 'combustivel' | 'pecas' | 'manutencao' | 'outros';
  paymentMethod: 'pix' | 'boleto' | 'cartao_debito' | 'cartao_credito';
  receiptImageUrl?: string;
  // --- Relacionamentos ---
  user: IUser['_id']; // Referência ao ID do Usuário
  trator: ITrator['_id']; // Referência ao ID do Trator
  createdAt: Date;
  isActive: boolean;
}

const CompraSchema = new Schema({
  description: {
    type: String,
    required: [true, 'A descrição da compra é obrigatória.'],
  },
  value: {
    type: Number,
    required: [true, 'O valor é obrigatório.'],
  },
  purchaseDate: {
    type: Date,
    required: [true, 'A data da compra é obrigatória.'],
  },
  category: {
    type: String,
    enum: ['combustivel', 'pecas', 'manutencao', 'outros'],
    required: [true, 'A categoria é obrigatória.'],
  },
  paymentMethod: {
    type: String,
    enum: ['pix', 'boleto', 'cartao_debito', 'cartao_credito'],
    required: [true, 'A forma de pagamento é obrigatória.'],
  },
  receiptImageUrl: {
    type: String,
    required: false, // Opcional, mas recomendado
  },

  // 'ref' diz ao Mongoose qual "Model" este ID representa
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Deve ser o mesmo nome que passamos em mongoose.model('User', ...)
    required: true,
  },
  trator: {
    type: Schema.Types.ObjectId,
    ref: 'Trator', // Deve ser o mesmo nome que passamos em mongoose.model('Trator', ...)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Compra = mongoose.model<ICompra>('Compra', CompraSchema);

export default Compra;