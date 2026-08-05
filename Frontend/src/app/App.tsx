import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// {/* MARKER-MAKE-KIT-INVOKED */}
export default function App() {
  return <RouterProvider router={router} />;
}
