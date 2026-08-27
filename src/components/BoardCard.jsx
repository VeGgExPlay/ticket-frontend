import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_MAP = {
  abierto: { label: 'Abierto', color: 'bg-yellow-200/70 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  en_progreso: { label: 'En progreso', color: 'bg-blue-200/70 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  resuelto: { label: 'Resuelto', color: 'bg-green-200/70 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  cerrado: { label: 'Cerrado', color: 'bg-red-200/70 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

const CATEGORY_MAP = {
  bug: { label: 'Bug', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  consulta: { label: 'Consulta', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  mejora: { label: 'Mejora', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  otro: { label: 'Otro', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
};

const PRIORITY_MAP = {
  baja: { label: 'Baja', color: 'bg-sky-200/70 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  media: { label: 'Media', color: 'bg-violet-200/70 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
  alta: { label: 'Alta', color: 'bg-orange-200/70 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
};

export default function BoardCard({ ticket, agentName }) {
  const { user } = useAuth();
  const isAgent = user?.role === 'agente';
  const navigate = useNavigate();
  const wasDraggingRef = useRef(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `ticket-${ticket.id}`,
    data: { ticket },
    disabled: !isAgent,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const status = STATUS_MAP[ticket.status] || { label: ticket.status, color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' };
  const cat = CATEGORY_MAP[ticket.category];
  const pri = PRIORITY_MAP[ticket.priority];

  const handleCardClick = () => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    navigate(`/tickets/${ticket.id}`);
  };

  useEffect(() => {
    const node = setNodeRef.current;
    if (!node || !isAgent) return;
    const handler = () => {
      wasDraggingRef.current = true;
    };
    node.addEventListener('dragend', handler);
    return () => node.removeEventListener('dragend', handler);
  }, [isAgent, setNodeRef]);

  const content = (
    <div
      ref={setNodeRef}
      style={style}
      {...(isAgent ? { ...listeners, ...attributes } : {})}
      onClick={isAgent ? handleCardClick : undefined}
      className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 cursor-default ${isAgent ? 'cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow' : 'opacity-90'}`}
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{ticket.title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ticket.description}</p>
      <div className="mt-3 flex items-center flex-wrap gap-1.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
        {cat && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>{cat.label}</span>}
        {pri && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pri.color}`}>{pri.label}</span>}
      </div>
      {ticket.agent_id && (
        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">Agente: {agentName || ticket.agent_id}</div>
      )}
    </div>
  );

  return content;
}
