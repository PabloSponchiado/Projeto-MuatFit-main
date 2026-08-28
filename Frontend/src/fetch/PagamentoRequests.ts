import type { PagamentoCreateDTO, PagamentoDTO } from '../dto/PagamentoDTO';
import { appConfig } from '@/appConfig';

// Classe responsável por fazer requisições à API - pagamento
class PagamentoRequests {
    private serverURL;
    private endpointPagamento;
    private endpointAluno;

    constructor() {
        this.serverURL = appConfig.render_url;
        this.endpointPagamento = '/api/pagamentos';
        this.endpointAluno = '/api/alunos';
    }

    private getToken(): string {
        const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null');
        return localStorage.getItem('token') ?? usuario?.token ?? '';
    }

    private normalizarPagamento(pagamento: any): PagamentoDTO {
        const dataVencimento = pagamento.dataVencimento ?? pagamento.data_vencimento ?? '';
        const dataPagamento = pagamento.dataPagamento ?? pagamento.data_pagamento ?? undefined;
        const status = pagamento.status ?? (
            dataPagamento ? 'PAGO' : new Date(dataVencimento) < new Date() ? 'VENCIDO' : 'PENDENTE'
        );

        return {
            id: String(pagamento.id ?? ''),
            alunoId: String(pagamento.alunoId ?? pagamento.aluno_id ?? ''),
            alunoNome: pagamento.alunoNome ?? pagamento.aluno_nome ?? '',
            valor: Number(pagamento.valor ?? 0),
            dataVencimento,
            dataPagamento: dataPagamento ?? undefined,
            status,
            mes: pagamento.mes ?? '',
            ano: Number(pagamento.ano ?? new Date().getFullYear()),
            observacao: pagamento.observacao ?? ''
        };
    }

    private normalizarListaPagamentos(pagamentos: any[]): PagamentoDTO[] {
        return (Array.isArray(pagamentos) ? pagamentos : []).map((p) => this.normalizarPagamento(p));
    }

    async obterListaDePagamentos() {
        try {
            const token = this.getToken();

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPagamento}`, {
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
                return this.normalizarListaPagamentos(await respostaAPI.json());
            } else {
                throw new Error(`Não foi possível listar os pagamentos.`);
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de pagamentos. ${error}`);
            return [];
        }
    }

    async enviarFormularioPagamento(formPagamento: PagamentoCreateDTO & { alunoNome: string }): Promise<boolean> {
        try {
            const token = this.getToken();
            const payload = {
                ...formPagamento,
                status: 'PENDENTE',
                dataPagamento: null,
            };

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPagamento}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
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

    async obterPagamentoPorId(id_pagamento: string) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error("Token de autenticação não encontrado. Faça login novamente.");
            }

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPagamento}/${id_pagamento}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (respostaAPI.ok) {
                const pagamento = await respostaAPI.json();
                return this.normalizarPagamento(pagamento);
            } else {
                throw new Error("Não foi possível buscar o pagamento.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de pagamento por ID. ${error}`);
            return;
        }
    }

    async obterPagamentosPorAluno(id_aluno: string) {
        try {
            const token = this.getToken();

            const respostaAPI = await fetch(`${this.serverURL}${this.endpointAluno}/${id_aluno}/pagamentos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (respostaAPI.ok) {
                const pagamentos = await respostaAPI.json();
                return this.normalizarListaPagamentos(pagamentos);
            } else {
                throw new Error(`Não foi possível buscar os pagamentos do aluno.`);
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de pagamentos por aluno. ${error}`);
            return [];
        }
    }

    async confirmarPagamento(id_pagamento: string): Promise<PagamentoDTO | false> {
        try {
            const token = this.getToken();
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPagamento}/${id_pagamento}/confirmar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            const pagamento = await respostaAPI.json();
            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
            return this.normalizarPagamento(pagamento);
        } catch (error) {
            console.error(`Erro ao confirmar pagamento. ${error}`);
            return false;
        }
    }

    async excluirPagamento(id_pagamento: string): Promise<boolean> {
        try {
            const token = localStorage.getItem('token');
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPagamento}/${id_pagamento}`, {
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
            console.error(`Erro ao excluir pagamento. ${error}`);
            return false;
        }
    }
}

export default new PagamentoRequests;
