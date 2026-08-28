import type { PagamentoCreateDTO, PagamentoDTO, StatusPagamento } from "../dto/PagamentoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

type PagamentoInput = PagamentoCreateDTO & {
	alunoNome?: string;
	dataPagamento?: string;
	status?: StatusPagamento;
};

const database = new DatabaseModel().pool;

class Pagamento {
	private static toDTO(pagamento: Record<string, unknown>): PagamentoDTO {
		return {
			id: String(pagamento.id ?? ""),
			alunoId: String(pagamento.aluno_id ?? ""),
			alunoNome: String(pagamento.aluno_nome ?? ""),
			valor: Number(pagamento.valor ?? 0),
			dataVencimento: String(pagamento.data_vencimento ?? ""),
			...(pagamento.data_pagamento ? { dataPagamento: String(pagamento.data_pagamento) } : {}),
			status: pagamento.status as StatusPagamento,
			mes: String(pagamento.mes ?? ""),
			ano: Number(pagamento.ano ?? 0),
			...(pagamento.observacao ? { observacao: String(pagamento.observacao) } : {})
		};
	}

	private static async alunoPertenceAoUsuario(alunoId: string, usuarioId: number): Promise<boolean> {
		const [adulto, kid] = await Promise.all([
			database.query("SELECT id FROM adultos WHERE id = $1 AND usuario_id = $2 LIMIT 1", [alunoId, usuarioId]),
			database.query("SELECT id FROM kids WHERE id = $1 AND usuario_id = $2 LIMIT 1", [alunoId, usuarioId])
		]);

		return (adulto.rowCount ?? 0) > 0 || (kid.rowCount ?? 0) > 0;
	}

	static async listarPagamentos(usuarioId: number): Promise<PagamentoDTO[]> {
		const resultado = await database.query(
			"SELECT * FROM pagamentos WHERE usuario_id = $1 ORDER BY id",
			[usuarioId]
		);
		return resultado.rows.map(Pagamento.toDTO);
	}

	static async listarPagamento(id: string, usuarioId: number): Promise<PagamentoDTO | null> {
		const resultado = await database.query(
			"SELECT * FROM pagamentos WHERE id = $1 AND usuario_id = $2",
			[id, usuarioId]
		);
		return resultado.rows.length > 0 ? Pagamento.toDTO(resultado.rows[0]) : null;
	}

	static async cadastrarPagamento(dados: PagamentoInput, usuarioId: number): Promise<PagamentoDTO> {
		const alunoValido = await Pagamento.alunoPertenceAoUsuario(dados.alunoId, usuarioId);
		if (!alunoValido) {
			throw new Error("ALUNO_FORA_DO_USUARIO");
		}

		const resultado = await database.query(
			`INSERT INTO pagamentos
				(aluno_id, aluno_nome, valor, data_vencimento, data_pagamento, status, mes, ano, observacao, usuario_id)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
			 RETURNING *`,
			[
				dados.alunoId,
				dados.alunoNome ?? "",
				dados.valor,
				dados.dataVencimento,
				dados.dataPagamento ?? null,
				dados.status ?? "PENDENTE",
				dados.mes,
				dados.ano,
				dados.observacao ?? "",
				usuarioId
			]
		);

		return Pagamento.toDTO(resultado.rows[0]);
	}

	static async confirmarPagamento(id: string, usuarioId: number): Promise<PagamentoDTO | null> {
		const resultado = await database.query(
			"UPDATE pagamentos SET status = 'PAGO', data_pagamento = CURRENT_DATE WHERE id = $1 AND usuario_id = $2 RETURNING *",
			[id, usuarioId]
		);
		return resultado.rows.length > 0 ? Pagamento.toDTO(resultado.rows[0]) : null;
	}

	static async removerPagamento(id: string, usuarioId: number): Promise<boolean> {
		const resultado = await database.query(
			"DELETE FROM pagamentos WHERE id = $1 AND usuario_id = $2 RETURNING id",
			[id, usuarioId]
		);
		return (resultado.rowCount ?? 0) > 0;
	}

	static async listarPagamentosPorAluno(alunoId: string, usuarioId: number): Promise<PagamentoDTO[]> {
		const resultado = await database.query(
			"SELECT * FROM pagamentos WHERE aluno_id = $1 AND usuario_id = $2 ORDER BY id",
			[alunoId, usuarioId]
		);
		return resultado.rows.map(Pagamento.toDTO);
	}
}

export default Pagamento;
