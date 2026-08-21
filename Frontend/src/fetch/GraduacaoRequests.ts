import type { GraduacaoCreateDTO, GraduacaoDTO } from '../dto/GraduacaoDTO';

// Classe responsável por fazer requisições à API - graduação
class GraduacaoRequests {
    private serverURL;
    private endpointGraduacao;
    private endpointAluno;

    constructor() {
        this.serverURL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3333';
        this.endpointGraduacao = '/api/graduacoes';
        this.endpointAluno = '/api/alunos';
    }

    private getToken(): string {
        const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null');
        return localStorage.getItem('token') ?? usuario?.token ?? '';
    }

    private normalizarGraduacao(grad: any): GraduacaoDTO {
        return {
            id: String(grad.id ?? ''),
            alunoId: String(grad.alunoId ?? grad.aluno_id ?? ''),
            alunoNome: grad.alunoNome ?? grad.aluno_nome ?? '',
            nivelAnterior: grad.nivelAnterior ?? grad.nivel_anterior ?? null,
            nivelAtual: grad.nivelAtual ?? grad.nivel_atual ?? '',
            dataGraduacao: grad.dataGraduacao ?? grad.data_graduacao ?? '',
            observacao: grad.observacao ?? '',
            examinador: grad.examinador ?? ''
        };
    }

    private normalizarListaGraduacoes(data: any): GraduacaoDTO[] {
        if (Array.isArray(data)) return data.map(item => this.normalizarGraduacao(item));
        if (data && Array.isArray(data.value)) return data.value.map((item: any) => this.normalizarGraduacao(item));
        return [];
    }

    async obterListaDeGraduacoes() {
        try {
            const token = this.getToken();

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointGraduacao}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (respostaAPI.ok) {
                if (respostaAPI.status === 204) {
                    return [];
                }
                const data = await respostaAPI.json();
                return this.normalizarListaGraduacoes(data);
            } else {
                throw new Error(`Não foi possível listar as graduações.`);
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de graduações. ${error}`);
            return [];
        }
    }

    async enviarFormularioGraduacao(formGraduacao: GraduacaoCreateDTO): Promise<boolean> {
        try {
            const token = localStorage.getItem('token');
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointGraduacao}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `${token}`
                },
                body: JSON.stringify(formGraduacao)
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao fazer consulta à API. ${error}`);
            return false;
        }
    }

    async obterGraduacaoPorId(id_graduacao: string) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token de autenticação não encontrado. Faça login novamente.");
            }

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointGraduacao}/${id_graduacao}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `${token}`
                }
            });

            if (respostaAPI.ok) {
                const graduacao = await respostaAPI.json();
                return this.normalizarGraduacao(graduacao);
            } else {
                throw new Error("Não foi possível buscar a graduação.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de graduação por ID. ${error}`);
            return;
        }
    }

    async obterGraduacoesPorAluno(id_aluno: string) {
        try {
            const token = localStorage.getItem('token');

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointAluno}/${id_aluno}/graduacoes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `${token}`
                }
            });

            if (respostaAPI.ok) {
                const graduacoes = await respostaAPI.json();
                return this.normalizarListaGraduacoes(graduacoes);
            } else {
                throw new Error(`Não foi possível buscar as graduações do aluno.`);
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de graduações por aluno. ${error}`);
            return;
        }
    }

    async excluirGraduacao(id_graduacao: string): Promise<boolean> {
        try {
            const token = localStorage.getItem('token');
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointGraduacao}/${id_graduacao}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `${token}`
                }
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao excluir graduação. ${error}`);
            return false;
        }
    }
}

export default new GraduacaoRequests;
