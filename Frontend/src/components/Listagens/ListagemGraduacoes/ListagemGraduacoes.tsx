import { type JSX, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Award, Eye, Trash2, Loader2 } from 'lucide-react';
import type { GraduacaoDTO } from '../../../dto/GraduacaoDTO';
import GraduacaoRequests from '../../../fetch/GraduacaoRequests';
import { GRADUACAO_CORES, formatarData } from '../../../utils/Utilitario';

export default function ListagemGraduacoes(): JSX.Element {
  const navigate = useNavigate();
  const [graduacoes, setGraduacoes] = useState<GraduacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [excluindo, setExcluindo] = useState<string | null>(null);

  const carregar = () => {
    setCarregando(true);
    GraduacaoRequests.obterListaDeGraduacoes().then(data => { setGraduacoes(data); setCarregando(false); });
  };

  useEffect(() => { carregar(); }, []);

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este registro de graduação?')) return;
    setExcluindo(id);
    await GraduacaoRequests.excluirGraduacao(id);
    carregar();
    setExcluindo(null);
  };

  const filtrados = graduacoes.filter(g =>
    g.alunoNome.toLowerCase().includes(busca.toLowerCase()) ||
    g.nivelAtual.toLowerCase().includes(busca.toLowerCase()) ||
    g.examinador.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground">Graduações</h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Histórico de promoções de faixa/prajioud</p>
        </div>
        <button
          onClick={() => navigate('/graduacoes/nova')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--primary)', fontSize: '0.875rem' }}
        >
          <Plus size={16} /> Nova Graduação
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          placeholder="Buscar por aluno, graduação ou examinador..."
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
            <Award size={40} className="opacity-30" />
            <p>Nenhuma graduação encontrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Aluno', 'Anterior', '→', 'Nova Graduação', 'Data', 'Examinador', 'Ações'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((g, i) => (
                <tr key={g.id} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${i === filtrados.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3 text-foreground font-medium" style={{ fontSize: '0.875rem' }}>{g.alunoNome}</td>
                  <td className="px-4 py-3">
                    {g.nivelAnterior ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${GRADUACAO_CORES[g.nivelAnterior].bg} ${GRADUACAO_CORES[g.nivelAnterior].text} ${GRADUACAO_CORES[g.nivelAnterior].border}`}>
                        {g.nivelAnterior}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>→</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${GRADUACAO_CORES[g.nivelAtual].bg} ${GRADUACAO_CORES[g.nivelAtual].text} ${GRADUACAO_CORES[g.nivelAtual].border}`}>
                      {g.nivelAtual}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{formatarData(g.dataGraduacao)}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>{g.examinador}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => navigate(`/graduacoes/${g.id}`)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Ver detalhes">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleExcluir(g.id)} disabled={excluindo === g.id} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50" title="Excluir">
                        {excluindo === g.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-muted-foreground mt-3" style={{ fontSize: '0.75rem' }}>{filtrados.length} registro(s)</p>
    </div>
  );
}
