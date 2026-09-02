import multer from 'multer'; // Importa o Multer, responsável por lidar com uploads
import path from 'path'; // Módulo para trabalhar com caminhos de arquivos
import crypto from 'crypto'; // Módulo para gerar valores aleatórios
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = path.resolve(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });

// Define a configuração de armazenamento dos arquivos
const storage = multer.diskStorage({
  // Define o diretório onde os arquivos enviados serão salvos
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory); // Caminho absoluto até a pasta "uploads"
  },

  // Define o nome do arquivo que será salvo
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(6).toString('hex'); // Gera um hash aleatório de 6 bytes
    const ext = path.extname(file.originalname); // Extrai a extensão original do arquivo

    // Tenta obter o UUID do usuário da requisição
    const uuid = (req.body?.uuid || req.params?.uuid || req.query?.uuid || 'sem-uuid');

    // Usa apenas um nome gerado para não confiar no nome enviado pelo cliente.
    const filename = `${uuid}-${hash}${ext}`;

    cb(null, filename); // Retorna o nome para o multer salvar
  }
});

// Aceita somente imagens e evita uploads excessivamente grandes.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('A imagem de perfil deve ser um arquivo de imagem.'));
  }
});

export default upload; // Exporta o middleware para ser usado nas rotas