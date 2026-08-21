import type { GraduacaoAdultoNivel } from './AdultoDTO.js';
import type { GraduacaoKidsNivel } from './KidsDTO.js';

export type GraduacaoNivel = GraduacaoAdultoNivel | GraduacaoKidsNivel;

export interface GraduacaoDTO {
  id: string;
  alunoId: string;
  alunoNome: string;
  nivelAnterior: GraduacaoNivel | null;
  nivelAtual: GraduacaoNivel;
  dataGraduacao: string;
  observacao?: string;
  examinador: string;
}

export interface GraduacaoCreateDTO {
  alunoId: string;
  nivelAtual: GraduacaoNivel;
  dataGraduacao: string;
  observacao?: string;
  examinador: string;
}
