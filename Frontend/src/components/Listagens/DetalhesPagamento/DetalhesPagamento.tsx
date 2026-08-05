import { type JSX, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import type { PagamentoDTO } from '../../../dto/PagamentoDTO';
import PagamentoRequests from '../../../fetch/PagamentoRequests';
import { STATUS_PAGAMENTO_CONFIG, formatarData, formatarMoeda } from '../../../utils/Utilitario';

export default function DetalhesPagamento(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pagamento, setPagamento] = useState<PagamentoDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!id) return;
    PagamentoRequests.obterPagamentoPorId(id).then(p => { setPagamento(p); setCarregando(false); });
  }, [id]);

  const handleConfirmar = async () => {
    if (!pagamento) return;
    setProcessando(true);
    const atualizado = await PagamentoRequests.confirmarPagamento(pagamento.id);
    setPagamento(atualizado);
    setProcessando(false);
  };

  if (carregando) return (
    <div className="flex items-center justify-center min-h-96 text-muted-foreground gap-2">
      <Loader2 size={20} className="animate-spin" /> Carregando...
    </div>
  );

  if (!pagamento) return <div className="p-6"><p className="text-muted-foreground">Pagamento não encontrado.</p></div>;

  const cfg = STATUS_PAGAMENTO_CONFIG[pagamento.status];

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/pagamentos')} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-foreground">Detalhes do Pagamento</h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aluno</p>
            <p className="text-foreground font-semibold" style={{ fontSize: '1.1rem' }}>{pagamento.alunoNome}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          {[
            { label: 'Valor', value: formatarMoeda(pagamento.valor) },
            { label: 'Referência', value: `${pagamento.mes}/${pagamento.ano}` },
            { label: 'Vencimento', value: formatarData(pagamento.dataVencimento) },
            { label: 'Pagamento', value: pagamento.dataPagamento ? formatarData(pagamento.dataPagamento) : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-muted-foreground mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p className="text-foreground font-medium" style={{ fontSize: '0.95rem' }}>{value}</p>
            </div>
          ))}
        </div>

        {pagamento.observacao && (
          <div className="pt-4 border-t border-border">
            <p className="text-muted-foreground mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Observação</p>
            <p className="text-foreground" style={{ fontSize: '0.875rem' }}>{pagamento.observacao}</p>
          </div>
        )}

        {pagamento.status !== 'PAGO' && (
          <div className="pt-4 border-t border-border">
            <button
              onClick={handleConfirmar}
              disabled={processando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold disabled:opacity-60 transition-all"
              style={{ background: '#38A169', fontSize: '0.875rem' }}
            >
              {processando ? <><Loader2 size={15} className="animate-spin" /> Processando...</> : <><CheckCircle size={15} /> Confirmar Pagamento</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
