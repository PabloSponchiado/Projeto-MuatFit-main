export type GraduacaoKidsNivel =
  | 'Laranja'
  | 'Laranja e cinza'
  | 'Cinza'
  | 'Cinza e branca'
  | 'Branca';

export interface KidsBaseDTO {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  email: string;
  telefone: string;
  endereco: string;
  dataMatricula: Date;
  ativo: boolean;
  graduacaoAtual: GraduacaoKidsNivel;
  responsavel: string;
  telefoneResponsavel: string;
  observacoes: string;
  imagemPerfil?: string;
  categoria: 'ADULTO' | 'KIDS';
}

export interface KidsDTO extends KidsBaseDTO {}

export interface KidsCreateDTO {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  email: string;
  telefone: string;
  endereco: string;
  graduacaoAtual: GraduacaoKidsNivel;
  responsavel: string;
  telefoneResponsavel: string;
  observacoes: string;
  imagemPerfil?: string;
}
