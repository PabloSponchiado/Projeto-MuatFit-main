export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'PROFESSOR';
  academia: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}
