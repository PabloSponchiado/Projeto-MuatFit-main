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
    <aside className="relative w-full md:w-64 min-h-0 md:min-h-screen flex flex-col border-b md:border-b-0 md:border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="px-4 md:px-6 py-4 md:py-6 border-b border-border">
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
      <nav className="flex-1 flex md:block overflow-x-auto px-2 md:px-3 py-2 md:py-4 space-x-1 md:space-x-0 md:space-y-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg transition-all duration-150 group ${
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
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 md:static md:block md:px-3 md:pb-4 md:border-t md:border-border md:pt-4">
          <div className="flex items-center gap-3 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-muted md:mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {imagemPerfil ? <img src={imagemPerfil} alt="Foto do professor" className="w-full h-full object-cover" /> : <span className="text-primary font-bold" style={{ fontSize: '0.8rem' }}>{usuario?.nome.charAt(0) ?? 'A'}</span>}
          </div>
        <button onClick={() => navigate('/perfil')} className="w-auto md:w-full text-left px-2.5 md:px-3 py-2 text-sm text-primary hover:bg-muted rounded-lg mb-0 md:mb-2">Editar perfil</button>
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{usuario?.nome ?? 'Admin'}</p>
            <p className="text-muted-foreground truncate" style={{ fontSize: '0.7rem' }}>{usuario?.academia ?? 'Academia'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2.5 py-2 md:w-full md:gap-3 md:px-3 md:py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-red-400 transition-all duration-150"
          style={{ fontSize: '0.875rem' }}
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
