import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoutes from '../components/Rotas/ProtectedRoutes';
import PLogin from '../pages/PLogin/PLogin';
import PHome from '../pages/PHome/PHome';
import PListagemAluno from '../pages/PListagem/PListagemAluno/PListagemAluno';
import PListagemPagamento from '../pages/PListagem/PListagemPagamento/PListagemPagamento';
import PListagemGraduacao from '../pages/PListagem/PListagemGraduacao/PListagemGraduacao';
import PDetalhesAluno from '../pages/PDetalhes/PDetalhesAluno/PDetalhesAluno';
import PDetalhesPagamento from '../pages/PDetalhes/PDetalhesPagamento/PDetalhesPagamento';
import PDetalhesGraduacao from '../pages/PDetalhes/PDetalhesGraduacao/PDetalhesGraduacao';
import PCadastroAluno from '../pages/PCadastro/PCadastroAluno/PCadastroAluno';
import PCadastroPagamento from '../pages/PCadastro/PCadastroPagamento/PCadastroPagamento';
import PCadastroGraduacao from '../pages/PCadastro/PCadastroGraduacao/PCadastroGraduacao';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: PLogin,
  },
  {
    path: '/',
    Component: ProtectedRoutes,
    children: [
      { index: true,                Component: PHome },
      { path: 'alunos',             Component: PListagemAluno },
      { path: 'alunos/novo',        Component: PCadastroAluno },
      { path: 'alunos/:id',         Component: PDetalhesAluno },
      { path: 'pagamentos',         Component: PListagemPagamento },
      { path: 'pagamentos/novo',    Component: PCadastroPagamento },
      { path: 'pagamentos/:id',     Component: PDetalhesPagamento },
      { path: 'graduacoes',         Component: PListagemGraduacao },
      { path: 'graduacoes/nova',    Component: PCadastroGraduacao },
      { path: 'graduacoes/:id',     Component: PDetalhesGraduacao },
    ],
  },
]);
