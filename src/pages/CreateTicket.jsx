import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createTicketApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CreateTicket() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const isAgent = user?.role === 'agente';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createTicketApi(title, description, category, priority);
      navigate(`/tickets/${res.ticket.id}`);
    } catch (err) {
      setError(err.message || 'Error al crear ticket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Nuevo ticket</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Describe tu problema o solicitud.</p>
      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="textarea mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select mt-1"
            required
          >
            <option value="">Seleccionar categoría</option>
            <option value="bug">Bug</option>
            <option value="consulta">Consulta</option>
            <option value="mejora">Mejora</option>
            <option value="otro">Otro</option>
          </select>
         </div>
         {isAgent && (
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridad</label>
             <select
               value={priority}
               onChange={(e) => setPriority(e.target.value)}
               className="select mt-1"
             >
               <option value="">Seleccionar prioridad</option>
               <option value="baja">Baja</option>
               <option value="media">Media</option>
               <option value="alta">Alta</option>
             </select>
           </div>
         )}
         <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Crear ticket
          </button>
        </div>
      </form>
    </motion.div>
  );
}