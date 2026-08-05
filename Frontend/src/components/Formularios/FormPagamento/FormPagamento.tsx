import { type JSX, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { AlunoDTO } from '../../../dto/AlunoDTO';
import AlunoRequests from '../../../fetch/AlunoRequests';
import PagamentoRequests from '../../../fetch/PagamentoRequests';
import { MESES } from '../../../utils/Utilitario';

export default function FormPagamento(): JSX.Element {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoDTO[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const hoje = new Date();
  const [dados, setDados] = useState({
    alunoId: '',
    valor: 150,
    dataVencimento: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-05`,
    mes: MESES[hoje.getMonth()],
    ano: hoje.getFullYear(),
    observacao: '',
  });

  useEffect(() => {
    AlunoRequests.obterListaDeAlunos().then(setAlunos);
  }, []);

  const set = (campo: string, valor: string | number) =>
    setDados(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dados.alunoId) { setErro('Selecione um aluno'); return; }
    setErro('');
    setCarregando(true);
    try {
      const aluno = alunos.find(a => a.id === dados.alunoId);
      await PagamentoRequests.enviarFormularioPagamento({ ...dados, alunoNome: aluno?.nome ?? '' });
      navigate('/pagamentos');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar pagamento');
    } finally {
      setCarregando(false);
    }
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";
  const labelClass = "block text-foreground mb-1.5";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/pagamentos')} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-foreground">Novo Pagamento</h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Registrar cobrança de mensalidade</p>
        </div>
      </div>

      {erro && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-red-400 text-sm">{erro}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-xl p-6 mb-4 space-y-4">
          <div>
            <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Aluno *</label>
            <select className={fieldClass} value={dados.alunoId} onChange={e => { set('alunoId', e.target.value); const a = alunos.find(al => al.id === e.target.value); if (a?.categoria === 'KIDS') set('valor', 100); else set('valor', 150); }} required>
              <option value="">Selecione um aluno...</option>
              {alunos.map(a => (
                <option key={a.id} value={a.id}>{a.nome} ({a.categoria})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Mês de referência *</label>
              <select className={fieldClass} value={dados.mes} onChange={e => set('mes', e.target.value)} required>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ano *</label>
              <input type="number" className={fieldClass} value={dados.ano} onChange={e => set('ano', Number(e.target.value))} min={2020} max={2030} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Valor (R$) *</label>
              <input type="number" className={fieldClass} value={dados.valor} onChange={e => set('valor', Number(e.target.value))} min={1} step={0.01} required />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Data de vencimento *</label>
              <input type="date" className={fieldClass} value={dados.dataVencimento} onChange={e => set('dataVencimento', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Observação</label>
            <textarea className={fieldClass} rows={3} value={dados.observacao} onChange={e => set('observacao', e.target.value)} placeholder="Desconto, parcela, etc." style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/pagamentos')} className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all" style={{ fontSize: '0.875rem' }}>
            Cancelar
          </button>
          <button type="submit" disabled={carregando} className="px-6 py-2.5 rounded-lg text-white font-semibold disabled:opacity-60 flex items-center gap-2 transition-all" style={{ background: 'var(--primary)', fontSize: '0.875rem' }}>
            {carregando ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : 'Registrar Pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
