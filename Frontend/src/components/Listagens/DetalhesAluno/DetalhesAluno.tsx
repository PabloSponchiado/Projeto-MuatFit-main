import { type JSX, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Award, CreditCard, Loader2, Pencil, Save, Image, Upload, X } from 'lucide-react';
import type { AlunoDTO } from '../../../dto/AlunoDTO';
import type { PagamentoDTO } from '../../../dto/PagamentoDTO';
import type { GraduacaoDTO } from '../../../dto/GraduacaoDTO';
import AlunoRequests from '../../../fetch/AlunoRequests';
import PagamentoRequests from '../../../fetch/PagamentoRequests';
import GraduacaoRequests from '../../../fetch/GraduacaoRequests';
import { GRADUACAO_CORES, STATUS_PAGAMENTO_CONFIG, calcularIdade, formatarData, formatarMoeda } from '../../../utils/Utilitario';
import { appConfig } from '../../../appConfig';

export default function DetalhesAluno(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [aluno, setAluno] = useState<AlunoDTO | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoDTO[]>([]);
  const [graduacoes, setGraduacoes] = useState<GraduacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [erro, setErro] = useState('');
  const [menuFoto, setMenuFoto] = useState(false);
  const [imagemVisualizada, setImagemVisualizada] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      AlunoRequests.obterAlunoPorId(id),
      PagamentoRequests.obterPagamentosPorAluno(id),
      GraduacaoRequests.obterGraduacoesPorAluno(id),
    ]).then(([a, p, g]) => {
      setAluno(a ?? null);
      setPagamentos(p ?? []);
      setGraduacoes((g ?? []).sort((x, y) => y.dataGraduacao.localeCompare(x.dataGraduacao)));
      setCarregando(false);
    });
  }, [id]);

  const iniciarEdicao = () => {
    if (!aluno) return;
    const dadosKids = 'responsavel' in aluno ? aluno : null;
    setForm({ nome: aluno.nome, cpf: aluno.cpf, dataNascimento: String(aluno.dataNascimento).slice(0, 10), email: aluno.email, telefone: aluno.telefone, endereco: aluno.endereco, graduacaoAtual: aluno.graduacaoAtual, responsavel: dadosKids?.responsavel ?? '', telefoneResponsavel: dadosKids?.telefoneResponsavel ?? '', observacoes: aluno.observacoes ?? '' });
    setEditando(true);
  };

  const atualizarFoto = async (imagem: File) => {
    if (!aluno || !id) return;
    setSalvando(true);
    try {
      const atualizado = await AlunoRequests.atualizarAluno(id, { ...form, nome: aluno.nome, cpf: aluno.cpf, dataNascimento: aluno.dataNascimento, email: aluno.email, telefone: aluno.telefone, endereco: aluno.endereco, graduacaoAtual: aluno.graduacaoAtual }, aluno.categoria, imagem);
      setAluno(atualizado);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar a foto');
    } finally { setSalvando(false); }
  };

  const salvarEdicao = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!aluno || !id) return;
    setSalvando(true);
    try {
      const atualizado = await AlunoRequests.atualizarAluno(id, form, aluno.categoria);
      setAluno(atualizado);
      setEditando(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar o aluno');
    } finally { setSalvando(false); }
  };

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
        {erro && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-red-400 text-sm">{erro}</div>}
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <button type="button" onClick={() => setMenuFoto(prev => !prev)} className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer" title="Opções da foto">
              {aluno.imagemPerfil ? <img src={`${appConfig.uploads_url}/${aluno.imagemPerfil}`} alt={`Foto de ${aluno.nome}`} className="w-full h-full object-cover" /> : <span className="text-primary font-bold" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem' }}>{aluno.nome.charAt(0)}</span>}
            </button>
            {menuFoto && <div className="absolute left-0 top-20 z-40 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
              <button type="button" disabled={!aluno.imagemPerfil} onClick={() => { setImagemVisualizada(true); setMenuFoto(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted rounded-md disabled:opacity-40"><Image size={15} /> Ver imagem</button>
              <button type="button" onClick={() => { setMenuFoto(false); inputFotoRef.current?.click(); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted rounded-md"><Upload size={15} /> Trocar de imagem</button>
            </div>}
            <input ref={inputFotoRef} type="file" accept="image/*" className="hidden" onChange={event => { const arquivo = event.target.files?.[0]; if (arquivo) void atualizarFoto(arquivo); event.target.value = ''; }} />
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
              <button onClick={iniciarEdicao} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground"><Pencil size={13} /> Editar</button>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${aluno.ativo ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {aluno.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span style={{ fontSize: '0.8rem' }}>{calcularIdade(String(aluno.dataNascimento))} anos</span>
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

        {'responsavel' in aluno && aluno.responsavel && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground mb-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Responsável</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground"><User size={14} /><span style={{ fontSize: '0.875rem' }}>{aluno.responsavel}</span></div>
              {aluno.telefoneResponsavel && <div className="flex items-center gap-2 text-muted-foreground"><Phone size={14} /><span style={{ fontSize: '0.875rem' }}>{aluno.telefoneResponsavel}</span></div>}
            </div>
          </div>
        )}
      </div>

      {editando && <form onSubmit={salvarEdicao} className="bg-card border border-border rounded-xl p-5 mb-4 space-y-3">
        <h3 className="text-foreground">Editar dados do aluno</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['nome', 'cpf', 'dataNascimento', 'email', 'telefone', 'endereco'] as const).map(campo => <label key={campo} className="text-sm text-muted-foreground">{campo === 'dataNascimento' ? 'Data de nascimento' : campo[0].toUpperCase() + campo.slice(1)}<input type={campo === 'dataNascimento' ? 'date' : 'text'} className="w-full mt-1 px-3 py-2 rounded-lg bg-input-background border border-border text-foreground" value={form[campo] ?? ''} onChange={event => setForm(prev => ({ ...prev, [campo]: event.target.value }))} required={campo !== 'email'} /></label>)}
        </div>
        <div className="flex gap-2"><button type="submit" disabled={salvando} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white"><Save size={15} /> Salvar</button><button type="button" onClick={() => setEditando(false)} className="px-4 py-2 rounded-lg border border-border text-muted-foreground">Cancelar</button></div>
      </form>}

      {imagemVisualizada && aluno.imagemPerfil && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setImagemVisualizada(false)}>
        <div className="relative max-w-2xl max-h-[85vh]" onClick={event => event.stopPropagation()}>
          <button type="button" onClick={() => setImagemVisualizada(false)} className="absolute -right-3 -top-3 rounded-full bg-card p-2 text-foreground shadow-lg" title="Fechar"><X size={18} /></button>
          <img src={`${appConfig.uploads_url}/${aluno.imagemPerfil}`} alt={`Foto de ${aluno.nome}`} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      </div>}

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
