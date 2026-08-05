import type { AdultoCreateDTO, AdultoDTO } from '../dto/AdultoDTO';
import type { KidsCreateDTO, KidsDTO } from '../dto/KidsDTO';

type AlunoDTO = AdultoDTO | KidsDTO;
type AlunoCreateDTO = AdultoCreateDTO | KidsCreateDTO;

class AlunoRequests {
    private serverURL;

    constructor() {
        this.serverURL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3333';
    }

    private getToken(): string {
        const usuario = JSON.parse(localStorage.getItem('usuario') ?? '{}');
        return usuario?.token ?? '';
    }

    private getEndpoint(categoria?: string): string {
        return categoria === 'KIDS' ? '/api/kids' : '/api/adultos';
    }

    async obterListaDeAlunos() {
        try {
            const [adultos, kids] = await Promise.all([
                fetch(`${this.serverURL}/api/adultos`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getToken()}`
                    }
                }),
                fetch(`${this.serverURL}/api/kids`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getToken()}`
                    }
                })
            ]);

            const adultosData = adultos.ok && adultos.status !== 204 ? await adultos.json() : [];
            const kidsData = kids.ok && kids.status !== 204 ? await kids.json() : [];

            const adultosComCategoria = adultosData.map((a: any) => ({ ...a, categoria: 'ADULTO' }));
            const kidsComCategoria = kidsData.map((k: any) => ({ ...k, categoria: 'KIDS' }));

            return [...adultosComCategoria, ...kidsComCategoria];
        } catch (error) {
            console.error(`Erro ao fazer a consulta de alunos. ${error}`);
            return [];
        }
    }

    async enviarFormularioAluno(formAluno: AlunoCreateDTO & { categoria?: string; responsavel?: string; telefoneResponsavel?: string }): Promise<boolean> {
        try {
            const categoria = formAluno.categoria ?? 'ADULTO';
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
            const respostaAPI = await fetch(`${this.serverURL}/api/adultos/${id_aluno}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (respostaAPI.ok) {
                return await respostaAPI.json();
            } else {
                throw new Error("Não foi possível buscar o aluno.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de aluno por ID. ${error}`);
            return;
        }
    }

    async excluirAluno(id_aluno: string): Promise<boolean> {
        try {
            const endpoints = ['/api/adultos', '/api/kids'];
            
            for (const endpoint of endpoints) {
                const respostaAPI = await fetch(`${this.serverURL}${endpoint}/${id_aluno}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getToken()}`
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