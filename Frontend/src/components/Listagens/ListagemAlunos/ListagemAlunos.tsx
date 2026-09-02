import { type JSX, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Eye, Trash2, Loader2, Image, Upload, X } from 'lucide-react';
import type { AlunoDTO } from '../../../dto/AlunoDTO';
import AlunoRequests from '../../../fetch/AlunoRequests';
import { GRADUACAO_CORES, calcularIdade } from '../../../utils/Utilitario';
import { appConfig } from '../../../appConfig';

export default function ListagemAlunos(): JSX.Element {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'TODOS' | 'ADULTO' | 'KIDS'>('TODOS');
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [menuFoto, setMenuFoto] = useState<string | null>(null);
  const [imagemVisualizada, setImagemVisualizada] = useState<string | null>(null);
  const [alunoParaTrocar, setAlunoParaTrocar] = useState<AlunoDTO | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const carregar = () => {
    setCarregando(true);
    AlunoRequests.obterListaDeAlunos().then(data => { setAlunos(data); setCarregando(false); });
  };

  useEffect(() => { carregar(); }, []);

  const escolherFoto = (aluno: AlunoDTO) => {
    setAlunoParaTrocar(aluno);
    setMenuFoto(null);
    inputFotoRef.current?.click();
  };

  const trocarFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo || !alunoParaTrocar) return;
    const dados: Record<string, unknown> = {
      nome: alunoParaTrocar.nome,
      cpf: alunoParaTrocar.cpf,
      dataNascimento: alunoParaTrocar.dataNascimento,
      email: alunoParaTrocar.email,
      telefone: alunoParaTrocar.telefone,
      endereco: alunoParaTrocar.endereco,
      graduacaoAtual: alunoParaTrocar.graduacaoAtual,
      observacoes: alunoParaTrocar.observacoes ?? ''
    };
    if ('responsavel' in alunoParaTrocar) {
      dados.responsavel = alunoParaTrocar.responsavel;
      dados.telefoneResponsavel = alunoParaTrocar.telefoneResponsavel;
    }
    try {
      const atualizado = await AlunoRequests.atualizarAluno(alunoParaTrocar.id.toString(), dados, alunoParaTrocar.categoria, arquivo);
      setAlunos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
    } finally {
      setAlunoParaTrocar(null);
      event.target.value = '';
    }
  };

  const handleExcluir = async (id: number, nome: string) => {
    if (!confirm(`Excluir o aluno "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(id);
    await AlunoRequests.excluirAluno(id.toString());
    carregar();
    setExcluindo(null);
  };

  const filtrados = alunos.filter(a => {
    const matchBusca = a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.email.toLowerCase().includes(busca.toLowerCase()) ||
      a.cpf.includes(busca);
    const matchCategoria = filtroCategoria === 'TODOS' || a.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const totalAdultos = alunos.filter(a => a.categoria === 'ADULTO').length;
  const totalKids = alunos.filter(a => a.categoria === 'KIDS').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground">Alunos</h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Gerencie os alunos da academia</p>
        </div>
        <button
          onClick={() => navigate('/alunos/novo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--primary)', fontSize: '0.875rem' }}
        >
          <Plus size={16} /> Novo Aluno
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: alunos.length, icon: Users, active: filtroCategoria === 'TODOS', onClick: () => setFiltroCategoria('TODOS') },
          { label: 'Adultos', value: totalAdultos, active: filtroCategoria === 'ADULTO', onClick: () => setFiltroCategoria('ADULTO') },
          { label: 'Kids', value: totalKids, active: filtroCategoria === 'KIDS', onClick: () => setFiltroCategoria('KIDS') },
        ].map(({ label, value, active, onClick }) => (
          <button key={label} onClick={onClick}
            className={`p-4 rounded-xl border text-left transition-all ${active ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-border/80'}`}
          >
            <p className="text-muted-foreground mb-1" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p className={`font-bold ${active ? 'text-primary' : 'text-foreground'}`} style={{ fontSize: '1.75rem', fontFamily: 'Oswald, sans-serif' }}>{value}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          placeholder="Buscar por nome, email ou CPF..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ fontSize: '0.875rem' }}
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-visible">
        {carregando ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 size={20} className="animate-spin" /> Carregando alunos...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Users size={40} className="opacity-30" />
            <p>Nenhum aluno encontrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Aluno</th>
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Categoria</th>
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Graduação</th>
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Idade</th>
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Contato</th>
                <th className="px-4 py-3 text-right text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((aluno, i) => (
                <tr key={aluno.id} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${i === filtrados.length - 1 ? 'border-b-0' : ''}`}>
                  <td className={`px-4 py-3 ${menuFoto === aluno.id.toString() ? 'relative z-30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <button type="button" onClick={() => setMenuFoto(menuFoto === aluno.id.toString() ? null : aluno.id.toString())} className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center overflow-hidden" title="Opções da foto">
                          {aluno.imagemPerfil ? <img src={`${appConfig.uploads_url}/${aluno.imagemPerfil}`} alt={`Foto de ${aluno.nome}`} className="w-full h-full object-cover" /> : <span className="text-primary font-bold" style={{ fontSize: '0.75rem' }}>{aluno.nome.charAt(0)}</span>}
                        </button>
                        {menuFoto === aluno.id.toString() && <div className="absolute left-0 top-10 z-20 w-44 rounded-lg border border-border bg-card p-1 shadow-xl">
                          <button type="button" disabled={!aluno.imagemPerfil} onClick={() => { if (aluno.imagemPerfil) setImagemVisualizada(`${appConfig.uploads_url}/${aluno.imagemPerfil}`); setMenuFoto(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted rounded-md disabled:opacity-40"><Image size={15} /> Ver imagem</button>
                          <button type="button" onClick={() => escolherFoto(aluno)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted rounded-md"><Upload size={15} /> Trocar de imagem</button>
                        </div>}
                      </div>
                      <div>
                        <p className="text-foreground font-medium" style={{ fontSize: '0.875rem' }}>{aluno.nome}</p>
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{aluno.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${aluno.categoria === 'KIDS' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'}`}>
                      {aluno.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${GRADUACAO_CORES[aluno.graduacaoAtual].bg} ${GRADUACAO_CORES[aluno.graduacaoAtual].text} ${GRADUACAO_CORES[aluno.graduacaoAtual].border}`}>
                      {aluno.graduacaoAtual}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{calcularIdade(String(aluno.dataNascimento))} anos</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{aluno.telefone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => navigate(`/alunos/${aluno.id}`)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Ver detalhes">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleExcluir(aluno.id, aluno.nome)} disabled={excluindo === aluno.id} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50" title="Excluir">
                        {excluindo === aluno.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <input ref={inputFotoRef} type="file" accept="image/*" className="hidden" onChange={trocarFoto} />
      {imagemVisualizada && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setImagemVisualizada(null)}>
        <div className="relative max-w-2xl max-h-[85vh]" onClick={event => event.stopPropagation()}>
          <button type="button" onClick={() => setImagemVisualizada(null)} className="absolute -right-3 -top-3 rounded-full bg-card p-2 text-foreground shadow-lg" title="Fechar"><X size={18} /></button>
          <img src={imagemVisualizada} alt="Imagem do aluno" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      </div>}
      <p className="text-muted-foreground mt-3" style={{ fontSize: '0.75rem' }}>{filtrados.length} aluno(s) encontrado(s)</p>
    </div>
  );
}
