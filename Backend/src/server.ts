import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import { uploadsDirectory } from './Config/multerConfig.js';
import multer from 'multer';

const server = express();
server.use(cors());
server.use('/uploads', express.static(uploadsDirectory));  // Serve os arquivos da pasta uploads
server.use(express.json());
server.use(router);
// Error handler to log unexpected errors and return 500
server.use((err: any, req: any, res: any, _next: any) => {
	console.error('Unhandled error:', err);
	if (!res.headersSent) {
		if (err instanceof multer.MulterError) {
			const mensagem = err.code === 'LIMIT_FILE_SIZE'
				? 'A imagem deve ter no máximo 5 MB.'
				: 'Não foi possível processar a imagem enviada.';
			return res.status(400).json({ error: mensagem });
		}
		if (err?.message === 'A imagem de perfil deve ser um arquivo de imagem.') {
			return res.status(400).json({ error: err.message });
		}
		res.status(500).json({ error: 'Erro interno do servidor.' });
	}
});
export { server };