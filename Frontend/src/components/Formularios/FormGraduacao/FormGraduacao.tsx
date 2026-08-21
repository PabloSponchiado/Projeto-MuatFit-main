import { type JSX, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { AlunoDTO, CategoriaAluno, GraduacaoNivel } from '../../../dto/AlunoDTO';
import AlunoRequests from '../../../fetch/AlunoRequests';
import GraduacaoRequests from '../../../fetch/GraduacaoRequests';
import { GRADUACAO_ORDEM_ADULTO, GRADUACAO_ORDEM_KIDS, GRADUACAO_CORES } from '../../../utils/Utilitario';

const getGraduacoesPorCategoria = (categoria: CategoriaAluno) =>
  categoria === 'KIDS' ? GRADUACAO_ORDEM_KIDS : GRADUACAO_ORDEM_ADULTO;

export default function FormGraduacao(): JSX.Element {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoDTO[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoDTO | null>(null);
  const hoje = new Date().toISOString().split('T')[0];
  const [dados, setDados] = useState({
    alunoId: '',
    alunoNome: '',
    nivelAnterior: '' as GraduacaoNivel | '',
    nivelAtual: '' as GraduacaoNivel | '',
    dataGraduacao: hoje,
    examinador: 'Rafael Moraes',
    observacao: '',
  });

  useEffect(() => {
    AlunoRequests.obterListaDeAlunos().then(setAlunos);
  }, []);

  const handleAlunoChange = (id: string) => {
    const aluno = alunos.find(a => a.id === id) ?? null;
    setAlunoSelecionado(aluno);
    const ordem = aluno ? getGraduacoesPorCategoria(aluno.categoria) : [];
    const idxAtual = aluno ? ordem.indexOf(aluno.graduacaoAtual) : -1;
    const proximo = idxAtual < ordem.length - 1 ? ordem[idxAtual + 1] : (aluno?.graduacaoAtual ?? '');
    setDados(prev => ({
      ...prev,
      alunoId: id,
      alunoNome: aluno?.nome ?? '',
      nivelAnterior: aluno?.graduacaoAtual ?? '',
      nivelAtual: proximo as GraduacaoNivel,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dados.alunoId || !dados.nivelAtual) { setErro('Preencha todos os campos obrigatórios'); return; }
    setErro('');
    setCarregando(true);
    try {
      await GraduacaoRequests.enviarFormularioGraduacao({
        alunoId: dados.alunoId,
        alunoNome: alunoSelecionado?.nome ?? dados.alunoNome,
        nivelAnterior: alunoSelecionado?.graduacaoAtual ?? dados.nivelAnterior,
        nivelAtual: dados.nivelAtual as GraduacaoNivel,
        dataGraduacao: dados.dataGraduacao,
        examinador: dados.examinador,
        observacao: dados.observacao,
      });
      navigate('/graduacoes');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao registrar graduação');
    } finally {
      setCarregando(false);
    }
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";
  const labelClass = "block text-foreground mb-1.5";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/graduacoes')} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-foreground">Nova Graduação</h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Registrar promoção de faixa/prajioud</p>
        </div>
      </div>

      {erro && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-red-400 text-sm">{erro}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-xl p-6 mb-4 space-y-4">
          <div>
            <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Aluno *</label>
            <select className={fieldClass} value={dados.alunoId} onChange={e => handleAlunoChange(e.target.value)} required>
              <option value="">Selecione um aluno...</option>
              {alunos.map(a => (
                <option key={a.id} value={a.id}>{a.nome} — {a.graduacaoAtual}</option>
              ))}
            </select>
          </div>

          {alunoSelecionado && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <div>
                <p className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>Graduação atual</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${GRADUACAO_CORES[alunoSelecionado.graduacaoAtual].bg} ${GRADUACAO_CORES[alunoSelecionado.graduacaoAtual].text} ${GRADUACAO_CORES[alunoSelecionado.graduacaoAtual].border}`}>
                  {alunoSelecionado.graduacaoAtual}
                </span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>Nova graduação</p>
                {dados.nivelAtual && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${GRADUACAO_CORES[dados.nivelAtual as GraduacaoNivel].bg} ${GRADUACAO_CORES[dados.nivelAtual as GraduacaoNivel].text} ${GRADUACAO_CORES[dados.nivelAtual as GraduacaoNivel].border}`}>
                    {dados.nivelAtual}
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nova graduação *</label>
            <select className={fieldClass} value={dados.nivelAtual} onChange={e => setDados(prev => ({ ...prev, nivelAtual: e.target.value as GraduacaoNivel }))} required>
              <option value="">Selecione...</option>
              {getGraduacoesPorCategoria(alunoSelecionado?.categoria ?? 'ADULTO').map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Data da graduação *</label>
              <input type="date" className={fieldClass} value={dados.dataGraduacao} onChange={e => setDados(prev => ({ ...prev, dataGraduacao: e.target.value }))} required />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Examinador *</label>
              <input className={fieldClass} value={dados.examinador} onChange={e => setDados(prev => ({ ...prev, examinador: e.target.value }))} required placeholder="Nome do examinador" />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Observações</label>
            <textarea className={fieldClass} rows={3} value={dados.observacao} onChange={e => setDados(prev => ({ ...prev, observacao: e.target.value }))} placeholder="Notas sobre a graduação..." style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/graduacoes')} className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all" style={{ fontSize: '0.875rem' }}>
            Cancelar
          </button>
          <button type="submit" disabled={carregando} className="px-6 py-2.5 rounded-lg text-white font-semibold disabled:opacity-60 flex items-center gap-2 transition-all" style={{ background: 'var(--primary)', fontSize: '0.875rem' }}>
            {carregando ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : 'Registrar Graduação'}
          </button>
        </div>
      </form>
    </div>
  );
}
