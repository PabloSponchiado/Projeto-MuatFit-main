import { type JSX } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Award, LogOut, Dumbbell } from 'lucide-react';
import AuthRequests from '../../fetch/AuthRequests';
import { appConfig } from '../../appConfig';

const navItems = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { to: '/alunos',      label: 'Alunos',      icon: Users },
  { to: '/pagamentos',  label: 'Pagamentos',  icon: CreditCard },
  { to: '/graduacoes',  label: 'Graduações',  icon: Award },
];

export default function Navegacao(): JSX.Element {
  const navigate = useNavigate();
  const usuario = AuthRequests.getUsuarioLogado();
  const imagemPerfil = usuario?.imagemPerfil ? `${appConfig.uploads_url}/${usuario.imagemPerfil}` : '';

  const handleLogout = () => {
    AuthRequests.logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Dumbbell size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold tracking-widest text-foreground" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
              MUAY FIT
            </p>
            <p className="text-muted-foreground" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
              Sistema de Gestão
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-3 pb-4 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {imagemPerfil ? <img src={imagemPerfil} alt="Foto do professor" className="w-full h-full object-cover" /> : <span className="text-primary font-bold" style={{ fontSize: '0.8rem' }}>{usuario?.nome.charAt(0) ?? 'A'}</span>}
          </div>
        <button onClick={() => navigate('/perfil')} className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-muted rounded-lg mb-2">Editar perfil</button>
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{usuario?.nome ?? 'Admin'}</p>
            <p className="text-muted-foreground truncate" style={{ fontSize: '0.7rem' }}>{usuario?.academia ?? 'Academia'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-red-400 transition-all duration-150"
          style={{ fontSize: '0.875rem' }}
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
