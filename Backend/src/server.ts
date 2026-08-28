import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import path from 'path';

const server = express();
server.use(cors());
server.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));  // Serve os arquivos da pasta uploads
server.use(express.json());
server.use(router);
// Error handler to log unexpected errors and return 500
server.use((err: any, req: any, res: any, _next: any) => {
	console.error('Unhandled error:', err);
	if (!res.headersSent) {
		res.status(500).json({ error: 'Internal server error' });
	}
});
export { server };