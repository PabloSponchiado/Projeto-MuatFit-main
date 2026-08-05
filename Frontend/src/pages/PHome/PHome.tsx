import { type JSX, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Award, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import AlunoRequests from '../../fetch/AlunoRequests';
import PagamentoRequests from '../../fetch/PagamentoRequests';
import GraduacaoRequests from '../../fetch/GraduacaoRequests';
import type { AlunoDTO } from '../../dto/AlunoDTO';
import { GRADUACAO_CORES, STATUS_PAGAMENTO_CONFIG, formatarMoeda, formatarData } from '../../utils/Utilitario';
import type { PagamentoDTO } from '../../dto/PagamentoDTO';
import type { GraduacaoDTO } from '../../dto/GraduacaoDTO';

export default function PHome(): JSX.Element {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoDTO[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoDTO[]>([]);
  const [graduacoes, setGraduacoes] = useState<GraduacaoDTO[]>([]);

  useEffect(() => {
    Promise.all([AlunoRequests.obterListaDeAlunos(), PagamentoRequests.obterListaDePagamentos(), GraduacaoRequests.obterListaDeGraduacoes()]).then(([a, p, g]) => {
      setAlunos(a);
      setPagamentos(p);
      setGraduacoes(g);
    });
  }, []);

  const totalAdultos = alunos.filter(a => a.categoria === 'ADULTO').length;
  const totalKids = alunos.filter(a => a.categoria === 'KIDS').length;
  const pagosMes = pagamentos.filter(p => p.status === 'PAGO');
  const receitaMes = pagosMes.reduce((acc, p) => acc + p.valor, 0);
  const pendentes = pagamentos.filter(p => p.status === 'PENDENTE' || p.status === 'VENCIDO');
  const vencidos = pagamentos.filter(p => p.status === 'VENCIDO');

  const stats = [
    { label: 'Total de Alunos', value: alunos.length, sub: `${totalAdultos} adultos · ${totalKids} kids`, icon: Users, color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', href: '/alunos' },
    { label: 'Receita do Mês', value: formatarMoeda(receitaMes), sub: `${pagosMes.length} pagamentos confirmados`, icon: TrendingUp, color: 'bg-green-500/15 text-green-400 border-green-500/20', href: '/pagamentos' },
    { label: 'Cobranças Pendentes', value: pendentes.length, sub: `${vencidos.length} vencido(s)`, icon: CreditCard, color: vencidos.length > 0 ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', href: '/pagamentos' },
    { label: 'Graduações (total)', value: graduacoes.length, sub: 'Promoções registradas', icon: Award, color: 'bg-purple-500/15 text-purple-400 border-purple-500/20', href: '/graduacoes' },
  ];

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground" style={{ fontSize: '0.9rem' }}>
          Bem-vindo de volta. Aqui está o resumo da sua academia.
        </p>
      </div>

      {/* Alerta vencidos */}
      {vencidos.length > 0 && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/15 transition-colors" onClick={() => navigate('/pagamentos')}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <p style={{ fontSize: '0.875rem' }}>
            <strong>{vencidos.length} pagamento(s) vencido(s)</strong> — clique para visualizar
          </p>
          <ChevronRight size={16} className="ml-auto" />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, href }) => (
          <button key={label} onClick={() => navigate(href)}
            className="bg-card border border-border rounded-xl p-5 text-left hover:border-border/80 hover:bg-muted/30 transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-muted-foreground mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p className="text-foreground font-bold mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem' }}>{value}</p>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alunos recentes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Alunos Recentes</h3>
            <button onClick={() => navigate('/alunos')} className="text-primary hover:underline" style={{ fontSize: '0.8rem' }}>
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {alunos.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors" onClick={() => navigate(`/alunos/${a.id}`)}>
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold" style={{ fontSize: '0.75rem' }}>{a.nome.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{a.nome}</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{a.categoria}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${GRADUACAO_CORES[a.graduacaoAtual].bg} ${GRADUACAO_CORES[a.graduacaoAtual].text} ${GRADUACAO_CORES[a.graduacaoAtual].border}`}>
                  {a.graduacaoAtual}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagamentos recentes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Pagamentos Recentes</h3>
            <button onClick={() => navigate('/pagamentos')} className="text-primary hover:underline" style={{ fontSize: '0.8rem' }}>
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {pagamentos.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors" onClick={() => navigate(`/pagamentos/${p.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.alunoNome}</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{p.mes}/{p.ano}</p>
                </div>
                <div className="text-right">
                  <p className="text-foreground" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{formatarMoeda(p.valor)}</p>
                  <span className={`text-xs font-medium ${STATUS_PAGAMENTO_CONFIG[p.status].text}`}>
                    {STATUS_PAGAMENTO_CONFIG[p.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas graduações */}
      {graduacoes.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Últimas Graduações</h3>
            <button onClick={() => navigate('/graduacoes')} className="text-primary hover:underline" style={{ fontSize: '0.8rem' }}>Ver todas</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {graduacoes.slice(0, 5).map(g => (
              <div key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border cursor-pointer hover:border-border/80 transition-colors" onClick={() => navigate(`/graduacoes/${g.id}`)}>
                <div>
                  <p className="text-foreground" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{g.alunoNome}</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.7rem' }}>{formatarData(g.dataGraduacao)}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${GRADUACAO_CORES[g.nivelAtual].bg} ${GRADUACAO_CORES[g.nivelAtual].text} ${GRADUACAO_CORES[g.nivelAtual].border}`}>
                  {g.nivelAtual}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
