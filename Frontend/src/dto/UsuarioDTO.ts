export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'PROFESSOR';
  academia: string;
  imagemPerfil?: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}
