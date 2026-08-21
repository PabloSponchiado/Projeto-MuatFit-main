import { type JSX, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CreditCard, CheckCircle, Eye, Trash2, Loader2 } from 'lucide-react';
import type { PagamentoDTO, StatusPagamento } from '../../../dto/PagamentoDTO';
import PagamentoRequests from '../../../fetch/PagamentoRequests';
import { STATUS_PAGAMENTO_CONFIG, formatarMoeda, formatarData } from '../../../utils/Utilitario';

export default function ListagemPagamentos(): JSX.Element {
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState<PagamentoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | StatusPagamento>('TODOS');
  const [processando, setProcessando] = useState<string | null>(null);

  const carregar = () => {
    setCarregando(true);
    PagamentoRequests.obterListaDePagamentos().then(data => { setPagamentos(data); setCarregando(false); });
  };

  useEffect(() => { carregar(); }, []);

  const handleConfirmar = async (id: string) => {
    setProcessando(id);
    await PagamentoRequests.confirmarPagamento(id);
    carregar();
    setProcessando(null);
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este pagamento?')) return;
    setProcessando(id);
    await PagamentoRequests.excluirPagamento(id);
    carregar();
    setProcessando(null);
  };

  const filtrados = pagamentos.filter(p => {
    const matchBusca = p.alunoNome.toLowerCase().includes(busca.toLowerCase()) || p.mes.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalPago = pagamentos.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = pagamentos.filter(p => p.status === 'PENDENTE').length;
  const totalVencido = pagamentos.filter(p => p.status === 'VENCIDO').length;
  const totalPagos = pagamentos.filter(p => p.status === 'PAGO').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground">Pagamentos</h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Controle de mensalidades</p>
        </div>
        <button
          onClick={() => navigate('/pagamentos/novo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--primary)', fontSize: '0.875rem' }}
        >
          <Plus size={16} /> Novo Pagamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Lucro recebido', value: formatarMoeda(totalPago), status: 'TODOS' as const, color: 'text-green-400' },
          { label: 'Pendentes', value: String(totalPendente), status: 'PENDENTE' as const, color: 'text-yellow-400' },
          { label: 'Vencidos', value: String(totalVencido), status: 'VENCIDO' as const, color: 'text-red-400' },
          { label: 'Pagos', value: String(totalPagos), status: 'PAGO' as const, color: 'text-emerald-400' },
        ].map(({ label, value, status, color }) => (
          <button key={label} onClick={() => setFiltroStatus(filtroStatus === status ? 'TODOS' : status)}
            className={`p-4 rounded-xl border text-left transition-all ${filtroStatus === status ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-border/80'}`}
          >
            <p className="text-muted-foreground mb-1" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p className={`font-bold ${color}`} style={{ fontSize: '1.5rem', fontFamily: 'Oswald, sans-serif' }}>{value}</p>
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          placeholder="Buscar por aluno ou mês..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ fontSize: '0.875rem' }}
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 size={20} className="animate-spin" /> Carregando...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <CreditCard size={40} className="opacity-30" />
            <p>Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Aluno', 'Referência', 'Valor', 'Vencimento', 'Pagamento', 'Status', 'Ações'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => (
                <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${i === filtrados.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.alunoNome}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{p.mes}/{p.ano}</td>
                  <td className="px-4 py-3 text-foreground font-medium" style={{ fontSize: '0.875rem' }}>{formatarMoeda(p.valor)}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{formatarData(p.dataVencimento)}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{p.dataPagamento ? formatarData(p.dataPagamento) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_PAGAMENTO_CONFIG[p.status].bg} ${STATUS_PAGAMENTO_CONFIG[p.status].text}`}>
                      {STATUS_PAGAMENTO_CONFIG[p.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      {p.status !== 'PAGO' && (
                        <button onClick={() => handleConfirmar(p.id)} disabled={processando === p.id} className="p-1.5 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors disabled:opacity-50" title="Confirmar pagamento">
                          {processando === p.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                        </button>
                      )}
                      <button onClick={() => navigate(`/pagamentos/${p.id}`)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Ver detalhes">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleExcluir(p.id)} disabled={processando === p.id} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50" title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
