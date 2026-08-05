import { type JSX, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { GraduacaoDTO } from '../../../dto/GraduacaoDTO';
import GraduacaoRequests from '../../../fetch/GraduacaoRequests';
import { GRADUACAO_CORES, formatarData } from '../../../utils/Utilitario';

export default function DetalhesGraduacao(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [graduacao, setGraduacao] = useState<GraduacaoDTO | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;
    GraduacaoRequests.obterGraduacaoPorId(id).then(g => { setGraduacao(g); setCarregando(false); });
  }, [id]);

  if (carregando) return (
    <div className="flex items-center justify-center min-h-96 text-muted-foreground gap-2">
      <Loader2 size={20} className="animate-spin" /> Carregando...
    </div>
  );

  if (!graduacao) return <div className="p-6"><p className="text-muted-foreground">Graduação não encontrada.</p></div>;

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/graduacoes')} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-foreground">Detalhes da Graduação</h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <p className="text-muted-foreground mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aluno</p>
          <p className="text-foreground font-semibold" style={{ fontSize: '1.1rem' }}>{graduacao.alunoNome}</p>
        </div>

        {/* Progression */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="text-center">
            <p className="text-muted-foreground mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antes</p>
            {graduacao.nivelAnterior ? (
              <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${GRADUACAO_CORES[graduacao.nivelAnterior].bg} ${GRADUACAO_CORES[graduacao.nivelAnterior].text} ${GRADUACAO_CORES[graduacao.nivelAnterior].border}`}>
                {graduacao.nivelAnterior}
              </span>
            ) : <span className="text-muted-foreground text-sm">Inicial</span>}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-muted-foreground text-xl">→</span>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promovido para</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${GRADUACAO_CORES[graduacao.nivelAtual].bg} ${GRADUACAO_CORES[graduacao.nivelAtual].text} ${GRADUACAO_CORES[graduacao.nivelAtual].border}`}>
              {graduacao.nivelAtual}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          {[
            { label: 'Data', value: formatarData(graduacao.dataGraduacao) },
            { label: 'Examinador', value: graduacao.examinador },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-muted-foreground mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p className="text-foreground font-medium" style={{ fontSize: '0.95rem' }}>{value}</p>
            </div>
          ))}
        </div>

        {graduacao.observacao && (
          <div className="pt-4 border-t border-border">
            <p className="text-muted-foreground mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Observações</p>
            <p className="text-foreground" style={{ fontSize: '0.875rem' }}>{graduacao.observacao}</p>
          </div>
        )}
      </div>
    </div>
  );
}
