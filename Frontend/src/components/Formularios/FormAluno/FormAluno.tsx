import { type JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { CategoriaAluno, GraduacaoNivel } from '../../../dto/AlunoDTO';
import AlunoRequests from '../../../fetch/AlunoRequests';
import { GRADUACAO_ORDEM_ADULTO, GRADUACAO_ORDEM_KIDS } from '../../../utils/Utilitario';

const getGraduacoesPorCategoria = (categoria: CategoriaAluno) =>
  categoria === 'KIDS' ? GRADUACAO_ORDEM_KIDS : GRADUACAO_ORDEM_ADULTO;

type FormAlunoState = {
  nome: string;
  cpf: string;
  dataNascimento: string;
  categoria: CategoriaAluno;
  email: string;
  telefone: string;
  endereco: string;
  graduacaoAtual: string;
  observacoes: string;
  responsavel?: string;
  telefoneResponsavel?: string;
};

export default function FormAluno(): JSX.Element {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dados, setDados] = useState<FormAlunoState>({
    nome: '', cpf: '', dataNascimento: '', categoria: 'ADULTO',
    email: '', telefone: '', endereco: '', graduacaoAtual: getGraduacoesPorCategoria('ADULTO')[0], observacoes: '',
  });

  const set = (campo: keyof FormAlunoState, valor: string | number) =>
    setDados(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (dados.categoria === 'KIDS' && (!dados.telefoneResponsavel || !dados.telefoneResponsavel.trim())) {
      setErro('Para alunos da categoria Kids, o contato do responsável é obrigatório.');
      return;
    }

    setCarregando(true);
    try {
      await AlunoRequests.enviarFormularioAluno(dados);
      navigate('/alunos');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar aluno');
    } finally {
      setCarregando(false);
    }
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";
  const labelClass = "block text-foreground mb-1.5";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/alunos')} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-foreground">Novo Aluno</h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Preencha os dados para cadastrar um novo aluno</p>
        </div>
      </div>

      {erro && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-red-400 text-sm">{erro}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="text-foreground mb-4 pb-3 border-b border-border">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome completo *</label>
              <input className={fieldClass} value={dados.nome} onChange={e => set('nome', e.target.value)} required placeholder="Nome completo do aluno" />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>CPF *</label>
              <input className={fieldClass} value={dados.cpf} onChange={e => set('cpf', e.target.value)} required placeholder="000.000.000-00" />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Data de Nascimento *</label>
              <input type="date" className={fieldClass} value={dados.dataNascimento} onChange={e => set('dataNascimento', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Categoria *</label>
              <select
                className={fieldClass}
                value={dados.categoria}
                onChange={e => {
                  const categoria = e.target.value as CategoriaAluno;
                  const proximaGraduacao = getGraduacoesPorCategoria(categoria)[0];
                  setDados(prev => ({ ...prev, categoria, graduacaoAtual: proximaGraduacao }));
                }}
                required
              >
                <option value="ADULTO">Adulto</option>
                <option value="KIDS">Kids (até 15 anos)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Graduação inicial *</label>
              <select className={fieldClass} value={dados.graduacaoAtual} onChange={e => set('graduacaoAtual', e.target.value as GraduacaoNivel)} required>
                {getGraduacoesPorCategoria(dados.categoria).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {dados.categoria !== 'KIDS' && (
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <h3 className="text-foreground mb-4 pb-3 border-b border-border">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email *</label>
                <input type="email" className={fieldClass} value={dados.email} onChange={e => set('email', e.target.value)} required placeholder="aluno@email.com" />
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Telefone *</label>
                <input className={fieldClass} value={dados.telefone} onChange={e => set('telefone', e.target.value)} required placeholder="(11) 99999-9999" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Endereço *</label>
                <input className={fieldClass} value={dados.endereco} onChange={e => set('endereco', e.target.value)} required placeholder="Rua, número - Bairro, Cidade/UF" />
              </div>
            </div>
          </div>
        )}

        {dados.categoria === 'KIDS' && (
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <h3 className="text-foreground mb-4 pb-3 border-b border-border">Responsável</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome do responsável</label>
                <input className={fieldClass} value={dados.responsavel ?? ''} onChange={e => set('responsavel', e.target.value)} placeholder="Nome completo (opcional)" />
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Contato do responsável *</label>
                <input className={fieldClass} value={dados.telefoneResponsavel ?? ''} onChange={e => set('telefoneResponsavel', e.target.value)} required placeholder="(11) 99999-9999" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/alunos')} className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all" style={{ fontSize: '0.875rem' }}>
            Cancelar
          </button>
          <button type="submit" disabled={carregando} className="px-6 py-2.5 rounded-lg text-white font-semibold disabled:opacity-60 flex items-center gap-2 transition-all" style={{ background: 'var(--primary)', fontSize: '0.875rem' }}>
            {carregando ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : 'Cadastrar Aluno'}
          </button>
        </div>
      </form>
    </div>
  );
}
