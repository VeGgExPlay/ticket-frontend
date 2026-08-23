import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cliente');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, role);
      navigate('/tickets');
    } catch (err) {
      setError(err.message || 'Error en el registro');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Crear cuenta</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Únete para empezar a gestionar tickets.</p>
        {error && <p className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select mt-1"
            >
              <option value="cliente">Cliente</option>
              <option value="agente">Agente</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-900"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta? <Link to="/login" className="font-medium text-slate-900 dark:text-slate-100 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}