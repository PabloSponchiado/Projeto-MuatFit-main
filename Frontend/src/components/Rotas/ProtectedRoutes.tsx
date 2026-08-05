import { type JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthRequests from '../../fetch/AuthRequests';
import Navegacao from '../Navegacao/Navegacao';
import Rodape from '../Rodape/Rodape';

export default function ProtectedRoutes(): JSX.Element {
  if (!AuthRequests.isAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navegacao />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <Rodape />
      </div>
    </div>
  );
}
