import mongoose, { Schema, Document } from 'mongoose';

// Interface para o TypeScript saber o formato do documento
export interface ITrator extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  modelName?: string;
  plate?: string;
  createdAt: Date;
}

const TratorSchema = new Schema({
  name: {
    type: String,
    required: [true, 'O nome da máquina é obrigatório.'], // Mensagem de erro customizada
  },
  modelName: {
    type: String,
    required: false,
  },
  plate: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Permite 'null' ou valores únicos
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Exporta o modelo
const Trator = mongoose.model<ITrator>('Trator', TratorSchema);

export default Trator;