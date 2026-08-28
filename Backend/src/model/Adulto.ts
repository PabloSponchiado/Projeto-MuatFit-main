import type { AdultoCreateDTO, AdultoDTO } from "../dto/AdultoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Adulto {
	private static toDTO(adulto: Record<string, unknown>): AdultoDTO {
		return {
			id: Number(adulto.id),
			nome: String(adulto.nome ?? ""),
			cpf: String(adulto.cpf ?? ""),
			dataNascimento: adulto.data_nascimento as Date,
			email: String(adulto.email ?? ""),
			telefone: String(adulto.telefone ?? ""),
			endereco: String(adulto.endereco ?? ""),
			dataMatricula: adulto.data_matricula as Date,
			ativo: Boolean(adulto.ativo),
			graduacaoAtual: adulto.graduacao_atual as AdultoDTO["graduacaoAtual"],
			observacoes: String(adulto.observacoes ?? ""),
			categoria: "ADULTO"
		};
	}

	static async listarAdultos(usuarioId: number): Promise<AdultoDTO[]> {
		const resultado = await database.query(
			"SELECT * FROM adultos WHERE usuario_id = $1 ORDER BY id",
			[usuarioId]
		);
		return resultado.rows.map(Adulto.toDTO);
	}

	static async listarAdulto(id: string, usuarioId: number): Promise<AdultoDTO | null> {
		const resultado = await database.query(
			"SELECT * FROM adultos WHERE id = $1 AND usuario_id = $2",
			[id, usuarioId]
		);
		return resultado.rows.length > 0 ? Adulto.toDTO(resultado.rows[0]) : null;
	}

	static async cadastrarAdulto(dados: AdultoCreateDTO, usuarioId: number): Promise<AdultoDTO> {
		const resultado = await database.query(
			`INSERT INTO adultos
				(nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, observacoes, usuario_id)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
			[
				dados.nome,
				dados.cpf,
				dados.dataNascimento,
				dados.email,
				dados.telefone,
				dados.endereco,
				dados.graduacaoAtual,
				dados.observacoes ?? "",
				usuarioId
			]
		);
		return Adulto.toDTO(resultado.rows[0]);
	}

	static async removerAdulto(id: string, usuarioId: number): Promise<boolean> {
		const resultado = await database.query(
			"DELETE FROM adultos WHERE id = $1 AND usuario_id = $2 RETURNING id",
			[id, usuarioId]
		);
		return (resultado.rowCount ?? 0) > 0;
	}
}

export default Adulto;
