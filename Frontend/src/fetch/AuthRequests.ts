import type { LoginDTO, UsuarioDTO } from '../dto/UsuarioDTO';

// Classe responsável por fazer requisições à API - autenticação
class AuthRequests {
    private serverURL;
    private endpointLogin;

    constructor() {
        this.serverURL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3333';
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
            throw new Error(data.message ?? 'Falha ao efetuar login');
        }

        const usuario: UsuarioDTO = await respostaAPI.json();
        if (!usuario || typeof usuario !== 'object') {
            throw new Error('Resposta inválida do servidor ao efetuar login.');
        }

        localStorage.setItem('usuario', JSON.stringify(usuario));
        console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
        return true;
    }

    logout(): void {
        localStorage.removeItem('usuario');
    }

    isAutenticado(): boolean {
        return localStorage.getItem('usuario') !== null;
    }

    getUsuarioLogado(): UsuarioDTO | null {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) as UsuarioDTO : null;
    }
}

export default new AuthRequests;
