import multer from 'multer';
import path from 'path'; // Módulo 'path' do Node.js
import crypto from 'crypto'; // Módulo 'crypto' do Node.js

// Define o caminho para onde os ficheiros vão
const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

export default {
  // Onde os ficheiros são guardados
  directory: uploadFolder,

  // Como os ficheiros são guardados
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(request, file, callback) {
      // Gera um nome de ficheiro único (para evitar nomes iguais)
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};