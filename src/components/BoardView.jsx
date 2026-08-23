import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { DndContext, useDroppable } from "@dnd-kit/core";
import BoardCard from "./BoardCard.jsx";
import {
  searchTickets,
  updateTicketApi,
  fetchAgents,
} from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const COLUMNS = [
  { id: "abierto", label: "Abierto" },
  { id: "en_progreso", label: "En progreso" },
  { id: "resuelto", label: "Resuelto" },
  { id: "cerrado", label: "Cerrado" },
];

function Column({ id, label, tickets, children, columnRef }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={columnRef} className="flex-1 min-w-[260px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          {label}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {tickets.length}
        </span>
      </div>
      <motion.div
        layout
        ref={setNodeRef}
        className={`min-h-[200px] rounded-xl border-2 border-dashed p-3 space-y-3 transition-colors ${isOver ? "border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/50" : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function BoardView() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentMap, setAgentMap] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);
  const columnRef = useRef(null);

  useEffect(() => {
    searchTickets({
      userRole: user?.role,
      userId: user?.id,
      limit: 200,
    })
      .then((result) => {
        setTickets(result.tickets || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar tickets");
        setLoading(false);
      });
    fetchAgents()
      .then((res) => {
        const list = res.agents || [];
        const map = {};
        list.forEach((a) => {
          map[a.id] = a.name;
        });
        setAgentMap(map);
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByColumn = useCallback((direction) => {
    const el = scrollContainerRef.current;
    const col = columnRef.current;
    if (!el || !col) return;
    const step = col.offsetWidth + 16; // column width + gap
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    COLUMNS.forEach((col) => {
      map[col.id] = [];
    });
    tickets.forEach((ticket) => {
      if (map[ticket.status]) {
        map[ticket.status].push(ticket);
      }
    });
    return map;
  }, [tickets]);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const ticketId = Number(active.id.replace("ticket-", ""));
    const newStatus = over.id;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    if (ticket.status === newStatus) return;
    if (user?.role !== "agente") return;

    try {
      await updateTicketApi(ticket.id, newStatus, ticket.agent_id);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      setError(err.message || "Error al actualizar estado");
    }
  }

  if (loading) {
    return (
      <p className="text-slate-400 dark:text-slate-500 text-sm">
        Cargando tablero...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
        {error}
      </p>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByColumn(-1)}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByColumn(1)}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Siguiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.board-scroll::-webkit-scrollbar { display: none; }`}</style>
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              tickets={grouped[col.id]}
              columnRef={col.id === COLUMNS[0].id ? columnRef : undefined}
            >
              {grouped[col.id].map((ticket) => (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BoardCard
                    ticket={ticket}
                    agentName={agentMap[ticket.agent_id] || null}
                  />
                </motion.div>
              ))}
              {grouped[col.id].length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                  Sin tickets
                </p>
              )}
            </Column>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
