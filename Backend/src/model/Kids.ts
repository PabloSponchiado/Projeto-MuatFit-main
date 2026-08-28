import type { KidsCreateDTO, KidsDTO } from "../dto/KidsDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Kids {
	private static toDTO(kid: Record<string, unknown>): KidsDTO {
		return {
			id: Number(kid.id),
			nome: String(kid.nome ?? ""),
			cpf: String(kid.cpf ?? ""),
			dataNascimento: kid.data_nascimento as Date,
			email: String(kid.email ?? ""),
			telefone: String(kid.telefone ?? ""),
			endereco: String(kid.endereco ?? ""),
			dataMatricula: kid.data_matricula as Date,
			ativo: Boolean(kid.ativo),
			graduacaoAtual: kid.graduacao_atual as KidsDTO["graduacaoAtual"],
			responsavel: String(kid.responsavel ?? ""),
			telefoneResponsavel: String(kid.telefone_responsavel ?? ""),
			observacoes: String(kid.observacoes ?? ""),
			categoria: "KIDS"
		};
	}

	static async listarKids(usuarioId: number): Promise<KidsDTO[]> {
		const resultado = await database.query(
			"SELECT * FROM kids WHERE usuario_id = $1 ORDER BY id",
			[usuarioId]
		);
		return resultado.rows.map(Kids.toDTO);
	}

	static async listarKid(id: string, usuarioId: number): Promise<KidsDTO | null> {
		const resultado = await database.query(
			"SELECT * FROM kids WHERE id = $1 AND usuario_id = $2",
			[id, usuarioId]
		);
		return resultado.rows.length > 0 ? Kids.toDTO(resultado.rows[0]) : null;
	}

	static async cadastrarKid(dados: KidsCreateDTO, usuarioId: number): Promise<KidsDTO> {
		const resultado = await database.query(
			`INSERT INTO kids
				(nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, responsavel, telefone_responsavel, observacoes, usuario_id)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
			[
				dados.nome,
				dados.cpf,
				dados.dataNascimento,
				dados.email,
				dados.telefone,
				dados.endereco,
				dados.graduacaoAtual,
				dados.responsavel,
				dados.telefoneResponsavel,
				dados.observacoes,
				usuarioId
			]
		);
		return Kids.toDTO(resultado.rows[0]);
	}

	static async removerKid(id: string, usuarioId: number): Promise<boolean> {
		const resultado = await database.query(
			"DELETE FROM kids WHERE id = $1 AND usuario_id = $2 RETURNING id",
			[id, usuarioId]
		);
		return (resultado.rowCount ?? 0) > 0;
	}
}

export default Kids;
