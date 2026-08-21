import { type JSX, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Award, CreditCard, Loader2 } from 'lucide-react';
import type { AlunoDTO } from '../../../dto/AlunoDTO';
import type { PagamentoDTO } from '../../../dto/PagamentoDTO';
import type { GraduacaoDTO } from '../../../dto/GraduacaoDTO';
import AlunoRequests from '../../../fetch/AlunoRequests';
import PagamentoRequests from '../../../fetch/PagamentoRequests';
import GraduacaoRequests from '../../../fetch/GraduacaoRequests';
import { GRADUACAO_CORES, STATUS_PAGAMENTO_CONFIG, calcularIdade, formatarData, formatarMoeda } from '../../../utils/Utilitario';

export default function DetalhesAluno(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [aluno, setAluno] = useState<AlunoDTO | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoDTO[]>([]);
  const [graduacoes, setGraduacoes] = useState<GraduacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      AlunoRequests.obterAlunoPorId(id),
      PagamentoRequests.obterPagamentosPorAluno(id),
      GraduacaoRequests.obterGraduacoesPorAluno(id),
    ]).then(([a, p, g]) => {
      setAluno(a);
      setPagamentos(p);
      setGraduacoes(g.sort((x, y) => y.dataGraduacao.localeCompare(x.dataGraduacao)));
      setCarregando(false);
    });
  }, [id]);

  if (carregando) return (
    <div className="flex items-center justify-center min-h-96 text-muted-foreground gap-2">
      <Loader2 size={20} className="animate-spin" /> Carregando...
    </div>
  );

  if (!aluno) return (
    <div className="p-6">
      <p className="text-muted-foreground">Aluno não encontrado.</p>
    </div>
  );

  const cores = GRADUACAO_CORES[aluno.graduacaoAtual];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/alunos')} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-foreground">Detalhes do Aluno</h1>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem' }}>{aluno.nome.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-foreground">{aluno.nome}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${aluno.categoria === 'KIDS' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'}`}>
                {aluno.categoria}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${cores.bg} ${cores.text} ${cores.border}`}>
                {aluno.graduacaoAtual}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${aluno.ativo ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {aluno.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span style={{ fontSize: '0.8rem' }}>{calcularIdade(aluno.dataNascimento)} anos</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} />
                <span style={{ fontSize: '0.8rem' }} className="truncate">{aluno.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} />
                <span style={{ fontSize: '0.8rem' }}>{aluno.telefone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} />
                <span style={{ fontSize: '0.8rem' }} className="truncate">{aluno.endereco}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>MATRÍCULA</p>
            <p className="text-foreground font-medium" style={{ fontSize: '0.9rem' }}>{aluno.id ? `#${String(aluno.id).padStart(4, '0')}` : '—'}</p>
          </div>
        </div>

        {aluno.categoria === 'KIDS' && aluno.responsavel && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground mb-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Responsável</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground"><User size={14} /><span style={{ fontSize: '0.875rem' }}>{aluno.responsavel}</span></div>
              {aluno.telefoneResponsavel && <div className="flex items-center gap-2 text-muted-foreground"><Phone size={14} /><span style={{ fontSize: '0.875rem' }}>{aluno.telefoneResponsavel}</span></div>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Graduações */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-primary" />
            <h3 className="text-foreground">Histórico de Graduações</h3>
          </div>
          {graduacoes.length === 0 ? (
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Nenhuma graduação registrada</p>
          ) : (
            <div className="space-y-3">
              {graduacoes.map(g => (
                <div key={g.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${GRADUACAO_CORES[g.nivelAtual].bg} ${GRADUACAO_CORES[g.nivelAtual].text} ${GRADUACAO_CORES[g.nivelAtual].border}`}>
                      {g.nivelAtual}
                    </span>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: '0.75rem' }}>{g.examinador}</p>
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>{formatarData(g.dataGraduacao)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagamentos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-primary" />
            <h3 className="text-foreground">Pagamentos Recentes</h3>
          </div>
          {pagamentos.length === 0 ? (
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Nenhum pagamento registrado</p>
          ) : (
            <div className="space-y-3">
              {pagamentos.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                  <div>
                    <p className="text-foreground" style={{ fontSize: '0.875rem' }}>{p.mes}/{p.ano}</p>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Venc. {formatarData(p.dataVencimento)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-medium" style={{ fontSize: '0.875rem' }}>{formatarMoeda(p.valor)}</p>
                    <span className={`text-xs font-medium ${STATUS_PAGAMENTO_CONFIG[p.status].text}`}>
                      {STATUS_PAGAMENTO_CONFIG[p.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
