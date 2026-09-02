import type { GraduacaoCreateDTO, GraduacaoDTO } from "../dto/GraduacaoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;
type GraduacaoInput = GraduacaoCreateDTO & {
	alunoNome?: string;
	nivelAnterior?: GraduacaoDTO["nivelAnterior"];
};

class Graduacao {
	private static toDTO(graduacao: Record<string, unknown>): GraduacaoDTO {
		return {
			id: String(graduacao.id ?? ""),
			alunoId: String(graduacao.aluno_id ?? ""),
			alunoNome: String(graduacao.aluno_nome ?? ""),
			nivelAnterior: (graduacao.nivel_anterior as GraduacaoDTO["nivelAnterior"]) ?? null,
			nivelAtual: graduacao.nivel_atual as GraduacaoDTO["nivelAtual"],
			dataGraduacao: String(graduacao.data_graduacao ?? ""),
			observacao: String(graduacao.observacao ?? ""),
			examinador: String(graduacao.examinador ?? "")
		};
	}

	static async listarGraduacoes(usuarioId: number): Promise<GraduacaoDTO[]> {
		const resultado = await database.query(
			"SELECT * FROM graduacoes WHERE usuario_id = $1 ORDER BY id",
			[usuarioId]
		);
		return resultado.rows.map(Graduacao.toDTO);
	}

	static async listarGraduacao(id: string, usuarioId: number): Promise<GraduacaoDTO | null> {
		const resultado = await database.query(
			"SELECT * FROM graduacoes WHERE id = $1 AND usuario_id = $2",
			[id, usuarioId]
		);
		return resultado.rows.length > 0 ? Graduacao.toDTO(resultado.rows[0]) : null;
	}

	static async cadastrarGraduacao(dados: GraduacaoInput, usuarioId: number): Promise<GraduacaoDTO> {
		const aluno = await database.query(
			`SELECT nome FROM adultos WHERE id = $1 AND usuario_id = $2
			 UNION ALL
			 SELECT nome FROM kids WHERE id = $1 AND usuario_id = $2
			 LIMIT 1`,
			[dados.alunoId, usuarioId]
		);
		if (aluno.rowCount === 0) throw new Error("ALUNO_FORA_DO_USUARIO");

		const resultado = await database.query(
			`INSERT INTO graduacoes
				(aluno_id, aluno_nome, nivel_anterior, nivel_atual, data_graduacao, observacao, examinador, usuario_id)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
			[
				dados.alunoId,
				dados.alunoNome ?? aluno.rows[0].nome,
				dados.nivelAnterior ?? null,
				dados.nivelAtual,
				dados.dataGraduacao,
				dados.observacao ?? "",
				dados.examinador,
				usuarioId
			]
		);

		const adultoAtualizado = await database.query(
			"UPDATE adultos SET graduacao_atual = $1 WHERE id = $2 AND usuario_id = $3",
			[dados.nivelAtual, dados.alunoId, usuarioId]
		);
		if (adultoAtualizado.rowCount === 0) {
			await database.query(
				"UPDATE kids SET graduacao_atual = $1 WHERE id = $2 AND usuario_id = $3",
				[dados.nivelAtual, dados.alunoId, usuarioId]
			);
		}

		return Graduacao.toDTO(resultado.rows[0]);
	}

	static async removerGraduacao(id: string, usuarioId: number): Promise<boolean> {
		const resultado = await database.query(
			"DELETE FROM graduacoes WHERE id = $1 AND usuario_id = $2 RETURNING id",
			[id, usuarioId]
		);
		return (resultado.rowCount ?? 0) > 0;
	}

	static async listarGraduacoesPorAluno(alunoId: string, usuarioId: number): Promise<GraduacaoDTO[]> {
		const resultado = await database.query(
			"SELECT * FROM graduacoes WHERE aluno_id = $1 AND usuario_id = $2 ORDER BY id",
			[alunoId, usuarioId]
		);
		return resultado.rows.map(Graduacao.toDTO);
	}
}

export default Graduacao;
