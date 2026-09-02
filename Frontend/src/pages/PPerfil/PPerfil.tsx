import { type JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import AuthRequests from '../../fetch/AuthRequests';
import { appConfig } from '../../appConfig';

export default function PPerfil(): JSX.Element {
  const navigate = useNavigate();
  const usuario = AuthRequests.getUsuarioLogado();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [academia, setAcademia] = useState(usuario?.academia ?? '');
  const [senha, setSenha] = useState('');
  const [imagem, setImagem] = useState<File>();
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await AuthRequests.updateProfile({ nome, email, academia, senha, imagemPerfil: imagem });
      navigate('/');
      window.location.reload();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar o perfil');
    } finally {
      setSalvando(false);
    }
  };

  const foto = usuario?.imagemPerfil ? `${appConfig.uploads_url}/${usuario.imagemPerfil}` : '';
  const campo = 'w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-foreground';
  return <div className="p-6 max-w-2xl mx-auto">
    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-6"><ArrowLeft size={18} /> Voltar</button>
    <h1 className="text-foreground mb-1">Editar perfil</h1>
    <p className="text-muted-foreground mb-6">Atualize seus dados e sua foto de perfil.</p>
    {erro && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-red-400 text-sm">{erro}</div>}
    <form onSubmit={salvar} className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/15 flex items-center justify-center text-primary text-2xl font-bold">
          {imagem ? <img src={URL.createObjectURL(imagem)} alt="Pré-visualização" className="w-full h-full object-cover" /> : foto ? <img src={foto} alt="Foto do perfil" className="w-full h-full object-cover" /> : nome.charAt(0)}
        </div>
        <label className="text-primary cursor-pointer">Escolher foto<input type="file" accept="image/*" className="hidden" onChange={event => setImagem(event.target.files?.[0])} /></label>
      </div>
      <label className="block text-sm text-muted-foreground">Nome<input className={campo} value={nome} onChange={event => setNome(event.target.value)} required /></label>
      <label className="block text-sm text-muted-foreground">E-mail<input type="email" className={campo} value={email} onChange={event => setEmail(event.target.value)} required /></label>
      <label className="block text-sm text-muted-foreground">Academia<input className={campo} value={academia} onChange={event => setAcademia(event.target.value)} /></label>
      <label className="block text-sm text-muted-foreground">Nova senha (opcional)<input type="password" className={campo} value={senha} onChange={event => setSenha(event.target.value)} /></label>
      <button disabled={salvando} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white disabled:opacity-60"><Save size={16} />{salvando ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : 'Salvar alterações'}</button>
    </form>
  </div>;
}
