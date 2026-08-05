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
        const usuario = JSON.parse(localStorage.getItem('usuario') ?? '{}');
        return usuario?.token ?? '';
    }

    async obterListaDeGraduacoes() {
        try {
            const token = this.getToken();

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointGraduacao}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (respostaAPI.ok) {
                if (respostaAPI.status === 204) {
                    return [];
                }
                return await respostaAPI.json();
            } else {
                throw new Error(`Não foi possível listar as graduações.`);
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de graduações. ${error}`);
            return [];
            return;
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
                return graduacao;
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
                return graduacoes;
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
