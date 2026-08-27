import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/tickets');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Accede a tu cuenta para gestionar tickets.</p>
        {error && <p className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-900"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">
          ¿No tienes cuenta? <Link to="/register" className="font-medium text-slate-900 dark:text-slate-100 hover:underline">Regístrate</Link>
        </p>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium mb-1">Credenciales demo:</p>
          <p>agente1@demo.local / demo123</p>
          <p>agente2@demo.local / demo123</p>
          <p>usuariodemo@demo.local / demo123</p>
        </div>
      </div>
    </div>
  );
}