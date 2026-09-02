import type { LoginDTO, UsuarioDTO } from '../dto/UsuarioDTO';
import { appConfig } from '@/appConfig';

// Classe responsável por fazer requisições à API - autenticação
class AuthRequests {
    private serverURL;
    private endpointLogin;

    constructor() {
        this.serverURL = appConfig.render_url;
        this.endpointLogin = '/api/login';
    }

    async login(dados: LoginDTO): Promise<boolean> {
        const respostaAPI = await fetch(`${this.serverURL}${this.endpointLogin}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!respostaAPI.ok) {
            const data = await respostaAPI.json().catch(() => ({}));
            throw new Error(data.message ?? data.error ?? 'Falha ao efetuar login');
        }

        const usuario: UsuarioDTO & { token?: string } = await respostaAPI.json();
        if (!usuario || typeof usuario !== 'object') {
            throw new Error('Resposta inválida do servidor ao efetuar login.');
        }

        localStorage.setItem('usuario', JSON.stringify(usuario));
        if (usuario.token) {
            localStorage.setItem('token', usuario.token);
        }
        console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
        return true;
    }

    async register(dados: { nome: string; email: string; senha: string; academia?: string; imagemPerfil?: File }): Promise<boolean> {
        const formulario = new FormData();
        formulario.append('nome', dados.nome);
        formulario.append('email', dados.email);
        formulario.append('senha', dados.senha);
        formulario.append('academia', dados.academia ?? 'Minha Academia');
        if (dados.imagemPerfil) formulario.append('imagemPerfil', dados.imagemPerfil);

        const respostaAPI = await fetch(`${this.serverURL}/api/register`, {
            method: 'POST',
            body: formulario
        });

        if (!respostaAPI.ok) {
            const data = await respostaAPI.json().catch(() => ({}));
            throw new Error(data.message ?? data.error ?? 'Falha ao criar conta');
        }

        const usuario: UsuarioDTO & { token?: string } = await respostaAPI.json();
        if (!usuario || typeof usuario !== 'object') {
            throw new Error('Resposta inválida do servidor ao criar conta.');
        }

        localStorage.setItem('usuario', JSON.stringify(usuario));
        if (usuario.token) {
            localStorage.setItem('token', usuario.token);
        }
        console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
        return true;
    }

    async updateProfile(dados: { nome: string; email: string; academia: string; senha?: string; imagemPerfil?: File }): Promise<UsuarioDTO> {
        const formulario = new FormData();
        formulario.append('nome', dados.nome);
        formulario.append('email', dados.email);
        formulario.append('academia', dados.academia);
        if (dados.senha) formulario.append('senha', dados.senha);
        if (dados.imagemPerfil) formulario.append('imagemPerfil', dados.imagemPerfil);
        const resposta = await fetch(`${this.serverURL}/api/usuarios/perfil`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${this.getToken()}` },
            body: formulario
        });
        const data = await resposta.json().catch(() => ({}));
        if (!resposta.ok) throw new Error(data.error ?? 'Falha ao atualizar perfil');
        localStorage.setItem('usuario', JSON.stringify(data));
        return data as UsuarioDTO;
    }

    logout(): void {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
    }

    isAutenticado(): boolean {
        return Boolean(localStorage.getItem('usuario') || localStorage.getItem('token'));
    }

    getUsuarioLogado(): UsuarioDTO | null {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) as UsuarioDTO : null;
    }

    getToken(): string {
        const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null');
        return localStorage.getItem('token') ?? usuario?.token ?? '';
    }
}

export default new AuthRequests;
