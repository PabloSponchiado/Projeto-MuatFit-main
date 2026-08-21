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
  dataNascimento: string | Date;
  email: string;
  telefone: string;
  endereco: string;
  dataMatricula: string | Date;
  ativo: boolean;
  graduacaoAtual: GraduacaoAdultoNivel;
  observacoes?: string;
  categoria: 'ADULTO' | 'KIDS';
}

export interface AdultoDTO extends AdultoBaseDTO {}

export interface AdultoCreateDTO {
  nome: string;
  cpf: string;
  dataNascimento: string | Date;
  email: string;
  telefone: string;
  endereco: string;
  graduacaoAtual: GraduacaoAdultoNivel;
  observacoes?: string;
}
