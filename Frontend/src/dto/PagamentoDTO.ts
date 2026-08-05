export type StatusPagamento = 'PAGO' | 'PENDENTE' | 'VENCIDO';

export interface PagamentoDTO {
  id: string;
  alunoId: string;
  alunoNome: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusPagamento;
  mes: string;
  ano: number;
  observacao?: string;
}

export interface PagamentoCreateDTO {
  alunoId: string;
  valor: number;
  dataVencimento: string;
  mes: string;
  ano: number;
  observacao?: string;
}
