import { type JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthRequests from '../../../fetch/AuthRequests';

export default function FormLogin(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@muayfit.com');
  const [senha, setSenha] = useState('123456');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const sucesso = await AuthRequests.login({ email, senha });
      if (!sucesso) {
        throw new Error('Falha ao efetuar login. Verifique suas credenciais e se o backend está rodando.');
      }
      navigate('/');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border border-primary/30" style={{ background: 'linear-gradient(135deg, var(--primary), #c53030)' }}>
            <Dumbbell size={28} className="text-white" />
          </div>
          <h1 className="text-foreground mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', letterSpacing: '0.1em' }}>
            MUAY FIT
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Sistema de Gestão de Muay Thai</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-foreground mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Entrar na conta
          </h2>

          {erro && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-red-400" style={{ fontSize: '0.875rem' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', fontSize: '0.9rem' }}
            >
              {carregando ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 text-center text-muted-foreground" style={{ fontSize: '0.78rem' }}>
            Login demo: <span className="text-foreground">admin@muayfit.com</span> / <span className="text-foreground">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
