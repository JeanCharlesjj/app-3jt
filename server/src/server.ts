import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

app.use(express.json());
app.use('/auth', authRoutes);

if (!mongoUri) {
  console.error('Erro: MONGO_URI não definida no arquivo .env');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas!');

    app.listen(port, () => {
      console.log(`Servidor ouvindo na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

app.get('/', (req, res) => {
  res.send('Backend 3JT está rodando e conectado ao banco!');
});