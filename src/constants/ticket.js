export const STATUS_MAP = {
  abierto: { label: "Abierto", color: "bg-yellow-200/70 text-yellow-800" },
  en_progreso: { label: "En progreso", color: "bg-blue-200/70 text-blue-800" },
  resuelto: { label: "Resuelto", color: "bg-green-200/70 text-green-800" },
  cerrado: { label: "Cerrado", color: "bg-red-200/70 text-red-800" },
};

export const CATEGORY_MAP = {
  bug: { label: "Bug", color: "bg-red-100 text-red-800" },
  consulta: { label: "Consulta", color: "bg-blue-100 text-blue-800" },
  mejora: { label: "Mejora", color: "bg-purple-100 text-purple-800" },
  otro: { label: "Otro", color: "bg-slate-100 text-slate-800" },
};

export const PRIORITY_MAP = {
  baja: { label: "Baja", color: "bg-sky-200/70 text-sky-800" },
  media: { label: "Media", color: "bg-violet-200/70 text-violet-800" },
  alta: { label: "Alta", color: "bg-orange-200/70 text-orange-800" },
};

export const SLA_TARGETS_HOURS = { alta: 8, media: 24, baja: 72 };

export const FIELD_LABELS = {
  status: "estado",
  agent_id: "agente",
  category: "categoría",
  priority: "prioridad",
  archived: "archivado",
};

export const TAG_CHIP_CLASS = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
