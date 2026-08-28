import type { AdultoCreateDTO, AdultoDTO } from '../dto/AdultoDTO';
import type { KidsCreateDTO, KidsDTO } from '../dto/KidsDTO';
import { appConfig } from '@/appConfig';

type AlunoDTO = AdultoDTO | KidsDTO;
type AlunoCreateDTO = AdultoCreateDTO | KidsCreateDTO;

class AlunoRequests {
    private serverURL = '';

    constructor() {
        this.serverURL = appConfig.render_url;
    }

    private getToken(): string {
        const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null');
        return localStorage.getItem('token') ?? usuario?.token ?? '';
    }

    private getEndpoint(categoria?: string): string {
        return categoria === 'KIDS' ? '/api/kids' : '/api/adultos';
    }

    private normalizarAluno(aluno: any, categoria: 'ADULTO' | 'KIDS') {
        const graduacaoAtual = aluno.graduacaoAtual ?? aluno.graduacao_atual ?? 'Branca';

        return {
            ...aluno,
            id: String(aluno.id ?? aluno.id_aluno ?? ''),
            nome: aluno.nome ?? '',
            email: aluno.email ?? '',
            cpf: aluno.cpf ?? '',
            telefone: aluno.telefone ?? '',
            endereco: aluno.endereco ?? '',
            dataNascimento: aluno.dataNascimento ?? aluno.data_nascimento ?? '',
            graduacaoAtual,
            categoria,
            responsavel: aluno.responsavel ?? '',
            telefoneResponsavel: aluno.telefoneResponsavel ?? aluno.telefone_responsavel ?? '',
            observacoes: aluno.observacoes ?? ''
        };
    }

    async obterListaDeAlunos() {
        try {
            const token = this.getToken();
            const [adultos, kids] = await Promise.all([
                fetch(`${this.serverURL}/api/adultos`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                }),
                fetch(`${this.serverURL}/api/kids`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                })
            ]);

            const adultosData = adultos.ok && adultos.status !== 204 ? await adultos.json() : [];
            const kidsData = kids.ok && kids.status !== 204 ? await kids.json() : [];

            const adultosComCategoria = adultosData.map((a: any) => this.normalizarAluno(a, 'ADULTO'));
            const kidsComCategoria = kidsData.map((k: any) => this.normalizarAluno(k, 'KIDS'));

            return [...adultosComCategoria, ...kidsComCategoria];
        } catch (error) {
            console.error(`Erro ao fazer a consulta de alunos. ${error}`);
            return [];
        }
    }

    async enviarFormularioAluno(formAluno: Partial<Record<string, unknown>> & {
        categoria?: string;
        responsavel?: string;
        telefoneResponsavel?: string;
        graduacaoAtual?: string;
        dataNascimento?: string | Date;
    }): Promise<boolean> {
        try {
            const categoria = String(formAluno.categoria ?? 'ADULTO') as 'ADULTO' | 'KIDS';
            const endpoint = this.getEndpoint(categoria);
            const payload = { ...formAluno } as Record<string, unknown>;

            if (categoria === 'ADULTO') {
                delete payload.responsavel;
                delete payload.telefoneResponsavel;
            }
            delete payload.categoria;

            const respostaAPI = await fetch(`${this.serverURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(payload)
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
            return true;
        } catch (error) {
            console.error(`Erro ao fazer consulta à API. ${error}`);
            return false;
        }
    }

    async obterAlunoPorId(id_aluno: string) {
        try {
            const token = this.getToken();
            const endpoints = [
                { url: `${this.serverURL}/api/adultos/${id_aluno}`, categoria: 'ADULTO' as const },
                { url: `${this.serverURL}/api/kids/${id_aluno}`, categoria: 'KIDS' as const }
            ];

            for (const endpoint of endpoints) {
                const respostaAPI = await fetch(endpoint.url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                });

                if (respostaAPI.ok) {
                    const aluno = await respostaAPI.json();
                    return this.normalizarAluno(aluno, endpoint.categoria);
                }
            }

            throw new Error("Não foi possível buscar o aluno.");
        } catch (error) {
            console.error(`Erro ao fazer a consulta de aluno por ID. ${error}`);
            return;
        }
    }

    async excluirAluno(id_aluno: string): Promise<boolean> {
        try {
            const endpoints = ['/api/adultos', '/api/kids'];
            
            const token = this.getToken();
            for (const endpoint of endpoints) {
                const respostaAPI = await fetch(`${this.serverURL}${endpoint}/${id_aluno}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                });

                if (respostaAPI.ok) {
                    console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
                    return true;
                }
            }
            
            throw new Error("Aluno não encontrado em nenhum endpoint");
        } catch (error) {
            console.error(`Erro ao excluir aluno. ${error}`);
            return false;
        }
    }
}

export default new AlunoRequests;