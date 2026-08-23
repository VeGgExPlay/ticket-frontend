import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import TicketCard from "../components/TicketCard.jsx";
import BoardView from "../components/BoardView.jsx";
import IosCheckbox from "../components/IosCheckbox.jsx";
import {
  searchTickets,
  fetchAgents,
  exportTicketsCsv,
  bulkTicketsAction,
  fetchSavedViews,
  createSavedView,
  deleteSavedView,
  currentFilters,
} from "../services/api.js";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_OPTIONS = [
  { key: "", label: "Todos" },
  { key: "abierto", label: "Abiertos" },
  { key: "en_progreso", label: "En progreso" },
  { key: "resuelto", label: "Resueltos" },
  { key: "cerrado", label: "Cerrados" },
];

const CATEGORY_OPTIONS = [
  { key: "", label: "Todas" },
  { key: "bug", label: "Bug" },
  { key: "consulta", label: "Consulta" },
  { key: "mejora", label: "Mejora" },
  { key: "otro", label: "Otro" },
];

const PRIORITY_OPTIONS = [
  { key: "", label: "Todas" },
  { key: "baja", label: "Baja" },
  { key: "media", label: "Media" },
  { key: "alta", label: "Alta" },
];

export default function TicketList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [agentId, setAgentId] = useState("");
  const [tag, setTag] = useState(() => searchParams.get("tag") || "");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total_count, setTotal_count] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentMap, setAgentMap] = useState({});
  const [agents, setAgents] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkAgentId, setBulkAgentId] = useState("");
  const [bulkArchived, setBulkArchived] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const isAgent = user?.role === "agente";

  const [views, setViews] = useState([]);
  const [showSaveView, setShowSaveView] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  useEffect(() => {
    if (user?.role === "agente") {
      fetchAgents()
        .then((res) => {
          const list = res.agents || [];
          const map = {};
          list.forEach((a) => {
            map[a.id] = a.name;
          });
          setAgentMap(map);
          setAgents(list);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchSavedViews()
        .then((res) => setViews(res.views || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tag) {
        next.set("tag", tag);
      } else {
        next.delete("tag");
      }
      return next;
    });
  }, [tag, setSearchParams]);

  useEffect(() => {
    loadTickets();
  }, [
    page,
    limit,
    status,
    category,
    priority,
    agentId,
    tag,
    showArchived,
    viewMode,
  ]);

  async function loadTickets() {
    setLoading(true);
    setError("");
    try {
      const result = await searchTickets({
        q: q || undefined,
        status: status || undefined,
        category: category || undefined,
        priority: priority || undefined,
        agent_id: agentId || undefined,
        tag: tag || undefined,
        archived: showArchived ? "1" : undefined,
        page,
        limit,
        userRole: user?.role,
        userId: user?.id,
      });
      setTickets(result.tickets || []);
      setTotal_count(result.total_count || 0);
    } catch (err) {
      setError(err.message || "Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    loadTickets();
  }

  function clearFilters() {
    setQ("");
    setStatus("");
    setCategory("");
    setPriority("");
    setAgentId("");
    setTag("");
    setShowArchived(false);
    setPage(1);
  }

  function applyView(filters) {
    setQ(filters.q || "");
    setStatus(filters.status || "");
    setCategory(filters.category || "");
    setPriority(filters.priority || "");
    setAgentId(filters.agent_id || "");
    setTag(filters.tag || "");
    setShowArchived(filters.archived === "1");
    setPage(1);
  }

  async function handleDeleteView(id) {
    if (!window.confirm("¿Eliminar esta vista guardada?")) return;
    try {
      await deleteSavedView(id);
      setViews((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      toast.error(err.message || "Error al eliminar vista");
    }
  }

  async function handleSaveView() {
    if (!newViewName.trim()) return;
    try {
      await createSavedView(newViewName.trim(), currentFilters({ q, status, category, priority, agentId: agentId, showArchived, tag }));
      setNewViewName("");
      setShowSaveView(false);
      const res = await fetchSavedViews();
      setViews(res.views || []);
      toast.success("Vista guardada");
    } catch (err) {
      toast.error(err.message || "Error al guardar vista");
    }
  }

  function handleExport() {
    exportTicketsCsv({
      q: q || undefined,
      status: status || undefined,
      category: category || undefined,
      priority: priority || undefined,
      agent_id: agentId || undefined,
      tag: tag || undefined,
      archived: showArchived ? "1" : undefined,
    });
  }

  function toggleSelect(e, id) {
    e.preventDefault();

    console.log(id);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleBulkAction() {
    if (selectedIds.size === 0) return;
    if (bulkStatus === "" && bulkAgentId === "" && bulkArchived === "") {
      setBulkError("Selecciona al menos una acción en lote");
      return;
    }
    setBulkSubmitting(true);
    setBulkError("");
    try {
      const payload = {};
      if (bulkStatus !== "") payload.status = bulkStatus;
      if (bulkAgentId !== "") payload.agent_id = Number(bulkAgentId);
      if (bulkArchived !== "") payload.archived = bulkArchived === "1";
      await bulkTicketsAction(Array.from(selectedIds), payload);
      clearSelection();
      setBulkStatus("");
      setBulkAgentId("");
      setBulkArchived("");
      loadTickets();
    } catch (err) {
      toast.error(err.message || "Error al aplicar acción en lote");
    } finally {
      setBulkSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total_count / limit));
  const showingFrom = total_count === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total_count);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Tickets
          </h1>
          {user?.role === "agente" && (
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm rounded-md ${viewMode === "list" ? "bg-slate-900 dark:bg-slate-700 text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
              >
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`px-3 py-1 text-sm rounded-md ${viewMode === "board" ? "bg-slate-900 dark:bg-slate-700 text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
              >
                Tablero
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="px-3 py-1.5 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Exportar CSV
        </button>
      </div>
      {viewMode === "list" && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">Vistas guardadas</h2>
            {!showSaveView ? (
              <button
                type="button"
                onClick={() => setShowSaveView(true)}
                className="text-xs px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                + Guardar vista actual
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="Nombre de la vista..."
                  className="input text-xs py-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveView}
                  disabled={!newViewName.trim()}
                  className="text-xs px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSaveView(false); setNewViewName(""); }}
                  className="text-xs px-2 py-1 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          {views.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {views.map((view) => (
                <div
                  key={view.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => applyView(view.filters)}
                    className="hover:opacity-80"
                  >
                    {view.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteView(view.id)}
                    className="ml-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">No hay vistas guardadas</p>
          )}
        </div>
      )}
      {viewMode === "list" && (
        <form
          onSubmit={handleSearch}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Título o descripción..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="select"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Etiqueta
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Filtrar por tag..."
                className="input"
              />
            </div>
            {user?.role === "agente" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Agente
                </label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="select"
                >
                  <option value="">Todos</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {user?.role === "agente" && (
            <div className="flex items-center mt-3">
              <label
                htmlFor="show-archived"
                className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <IosCheckbox
                  id="show-archived"
                  checked={showArchived}
                  onChange={(v) => {
                    setShowArchived(v);
                    setPage(1);
                  }}
                />
                <span>Ver archivados</span>
              </label>
            </div>
          )}
          <div className="flex items-center justify-end space-x-2 mt-3">
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Limpiar filtros
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              Buscar
            </button>
          </div>
        </form>
      )}
      {viewMode === "list" && isAgent && selectedIds.size > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Estado
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="select"
              >
                <option value="">Sin cambios</option>
                {STATUS_OPTIONS.filter((s) => s.key).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Agente
              </label>
              <select
                value={bulkAgentId}
                onChange={(e) => setBulkAgentId(e.target.value)}
                className="select"
              >
                <option value="">Sin cambios</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Archivado
              </label>
              <select
                value={bulkArchived}
                onChange={(e) => setBulkArchived(e.target.value)}
                className="select"
              >
                <option value="">Sin cambios</option>
                <option value="1">Archivar</option>
                <option value="0">Desarchivar</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleBulkAction}
              disabled={bulkSubmitting}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              {bulkSubmitting
                ? "Aplicando..."
                : `Aplicar (${selectedIds.size})`}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
      {viewMode === "list" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading
                ? "Cargando..."
                : `Mostrando ${showingFrom}-${showingTo} de ${total_count} tickets`}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300"
              >
                Siguiente
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4">
              {error}
            </p>
          )}
          {loading ? (
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              Cargando tickets...
            </p>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <AnimatePresence>
                {tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-stretch gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <TicketCard
                        ticket={ticket}
                        agentName={agentMap[ticket.agent_id] || null}
                        selectedIds={selectedIds}
                        toggleSelect={toggleSelect}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          {!loading && tickets.length === 0 && (
            <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-12">
              No hay tickets para mostrar.
            </p>
          )}
        </>
      )}
      {viewMode === "board" && (
        <div className="mt-2">
          <BoardView />
        </div>
      )}
    </div>
  );
}
