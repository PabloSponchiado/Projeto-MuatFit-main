export type GraduacaoAdultoNivel =
  | 'Branca'
  | 'Amarela'
  | 'Amarela e branca'
  | 'Verde'
  | 'Verde e branca'
  | 'Azul'
  | 'Azul e branca'
  | 'Marrom'
  | 'Marrom e branca'
  | 'Vermelha'
  | 'Vermelha e branca'
  | 'Preta';

export interface AdultoBaseDTO {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  email: string;
  telefone: string;
  endereco: string;
  dataMatricula: Date;
  ativo: boolean;
  graduacaoAtual: GraduacaoAdultoNivel;
  observacoes?: string;
  imagemPerfil?: string;
  categoria: 'ADULTO' | 'KIDS';
}

export interface AdultoDTO extends AdultoBaseDTO {}

export interface AdultoCreateDTO {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  email: string;
  telefone: string;
  endereco: string;
  graduacaoAtual: GraduacaoAdultoNivel;
  observacoes?: string;
  imagemPerfil?: string;
}
