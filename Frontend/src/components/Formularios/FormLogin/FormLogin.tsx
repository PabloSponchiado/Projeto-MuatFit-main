import { type JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import AuthRequests from '../../../fetch/AuthRequests';

type FormLoginProps = {
  initialMode?: 'login' | 'register';
};

export default function FormLogin({ initialMode = 'login' }: FormLoginProps): JSX.Element {
  const navigate = useNavigate();
  const [modoCadastro, setModoCadastro] = useState(initialMode === 'register');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [academia, setAcademia] = useState('Minha Academia');
  const [imagemPerfil, setImagemPerfil] = useState<File | undefined>();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (imagemPerfil && imagemPerfil.size > 5 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 5 MB.');
      return;
    }
    setCarregando(true);
    try {
      const sucesso = modoCadastro
        ? await AuthRequests.register({ nome, email, senha, academia, imagemPerfil })
        : await AuthRequests.login({ email, senha });

      if (!sucesso) {
        throw new Error(modoCadastro ? 'Falha ao criar conta.' : 'Falha ao efetuar login. Verifique suas credenciais e se o backend está rodando.');
      }
      navigate('/');
    } catch (err) {
      setErro(err instanceof Error ? err.message : modoCadastro ? 'Erro ao criar conta' : 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border border-primary/30" style={{ background: 'linear-gradient(135deg, var(--primary), #c53030)' }}>
            <Dumbbell size={28} className="text-white" />
          </div>
          <h1 className="text-foreground mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', letterSpacing: '0.1em' }}>
            MUAY FIT
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Sistema de Gestão de Muay Thai</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 className="text-foreground" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {modoCadastro ? 'Criar conta' : 'Entrar na conta'}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (modoCadastro) {
                  navigate('/login');
                  return;
                }
                navigate('/register');
              }}
              className="text-sm text-primary hover:opacity-90 transition-opacity"
            >
              {modoCadastro ? 'Voltar ao login' : 'Criar conta'}
            </button>
          </div>

          {erro && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-red-400" style={{ fontSize: '0.875rem' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {modoCadastro && (
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required={modoCadastro}
                  className="w-full px-4 py-2.5 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="Seu nome"
                />
              </div>
            )}

            {modoCadastro && (
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Foto de perfil
                </label>
                <input type="file" accept="image/*" onChange={e => setImagemPerfil(e.target.files?.[0])} className="w-full text-sm text-muted-foreground" />
              </div>
            )}

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

            {modoCadastro && (
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Nome da academia
                </label>
                <input
                  type="text"
                  value={academia}
                  onChange={e => setAcademia(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="Minha Academia"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', fontSize: '0.9rem' }}
            >
              {carregando ? <><Loader2 size={16} className="animate-spin" /> {modoCadastro ? 'Criando...' : 'Entrando...'}</> : (modoCadastro ? 'Criar conta' : 'Entrar')}
            </button>
          </form>

          {modoCadastro ? (
            <p className="mt-5 text-center text-muted-foreground" style={{ fontSize: '0.78rem' }}>
              Já tem conta?{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-primary font-medium hover:opacity-90 transition-opacity">
                Entrar
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
