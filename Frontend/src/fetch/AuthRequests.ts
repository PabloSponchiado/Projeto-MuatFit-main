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

    async register(dados: { nome: string; email: string; senha: string; academia?: string }): Promise<boolean> {
        const respostaAPI = await fetch(`${this.serverURL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
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
