export default function ActionsTab({
  ticket,
  status,
  setStatus,
  category,
  setCategory,
  priority,
  setPriority,
  selectedAgentId,
  setSelectedAgentId,
  agents,
  submitting,
  disabled = false,
  onStatusChange,
  onAssignmentChange,
  onCategoryChange,
  onPriorityChange,
  onArchiveToggle,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[max-content_1fr_max-content] items-center gap-3">
        <form onSubmit={onStatusChange} className="contents">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Cambiar estado:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={disabled}
            className="select min-w-0"
          >
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <button
            type="submit"
            disabled={submitting || disabled}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 whitespace-nowrap"
          >
            Actualizar estado
          </button>
        </form>
        <form onSubmit={onAssignmentChange} className="contents">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Asignar agente:
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            disabled={disabled}
            className="select min-w-0"
          >
            <option value="">Sin asignar</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting || disabled}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 whitespace-nowrap"
          >
            Guardar asignación
          </button>
        </form>
        <form onSubmit={onCategoryChange} className="contents">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Categoría:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled}
            className="select min-w-0"
          >
            <option value="bug">Bug</option>
            <option value="consulta">Consulta</option>
            <option value="mejora">Mejora</option>
            <option value="otro">Otro</option>
          </select>
          <button
            type="submit"
            disabled={submitting || disabled}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 whitespace-nowrap"
          >
            Guardar categoría
          </button>
        </form>
        <form onSubmit={onPriorityChange} className="contents">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Prioridad:
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={disabled}
            className="select min-w-0"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
          <button
            type="submit"
            disabled={submitting || disabled}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 whitespace-nowrap"
          >
            Guardar prioridad
          </button>
        </form>
      </div>
      <div className="flex items-center space-x-2 pt-1">
        <button
          type="button"
          onClick={onArchiveToggle}
          disabled={submitting}
          className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 whitespace-nowrap ${
            ticket.archived
              ? "bg-slate-500 dark:bg-slate-600 text-white hover:bg-slate-400 dark:hover:bg-slate-500"
              : "bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-500 dark:hover:bg-amber-400"
          }`}
        >
          {ticket.archived ? "Desarchivar" : "Archivar"}
        </button>
      </div>
    </div>
  );
}
