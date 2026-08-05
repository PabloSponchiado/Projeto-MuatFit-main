import { type JSX } from 'react';

export default function Rodape(): JSX.Element {
  return (
    <footer className="border-t border-border px-6 py-4 flex items-center justify-between">
      <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
        © {new Date().getFullYear()} Muay Fit — Sistema de Gestão
      </span>
      <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
        v1.0.0
      </span>
    </footer>
  );
}
