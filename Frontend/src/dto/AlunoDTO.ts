import type { AdultoDTO, AdultoCreateDTO, GraduacaoAdultoNivel } from './AdultoDTO.js';
import type { KidsDTO, KidsCreateDTO, GraduacaoKidsNivel } from './KidsDTO.js';
import type { GraduacaoNivel } from './GraduacaoDTO.js';

export type CategoriaAluno = 'ADULTO' | 'KIDS';
export type AlunoDTO = AdultoDTO | KidsDTO;
export type AlunoCreateDTO = AdultoCreateDTO | KidsCreateDTO;
export type { GraduacaoAdultoNivel, GraduacaoKidsNivel, GraduacaoNivel };
