import { useNavigate } from "react-router-dom";
import { TAG_CHIP_CLASS } from "../constants/ticket.js";
import { useAuth } from "../context/AuthContext.jsx";
import IosCheckbox from "./IosCheckbox.jsx";

const STATUS_MAP = {
  abierto: { label: "Abierto", color: "bg-yellow-200/70 text-yellow-800" },
  en_progreso: { label: "En progreso", color: "bg-blue-200/70 text-blue-800" },
  resuelto: { label: "Resuelto", color: "bg-green-200/70 text-green-800" },
  cerrado: { label: "Cerrado", color: "bg-red-200/70 text-red-800" },
};

const CATEGORY_MAP = {
  bug: { label: "Bug", color: "bg-red-100 text-red-800" },
  consulta: { label: "Consulta", color: "bg-blue-100 text-blue-800" },
  mejora: { label: "Mejora", color: "bg-purple-100 text-purple-800" },
  otro: { label: "Otro", color: "bg-slate-100 text-slate-800" },
};

const PRIORITY_MAP = {
  baja: { label: "Baja", color: "bg-sky-200/70 text-sky-800" },
  media: { label: "Media", color: "bg-violet-200/70 text-violet-800" },
  alta: { label: "Alta", color: "bg-orange-200/70 text-orange-800" },
};

export default function TicketCard({
  ticket,
  agentName,
  selectedIds,
  toggleSelect,
}) {
  const navigate = useNavigate();
  const status = STATUS_MAP[ticket.status] || {
    label: ticket.status,
    color: "bg-slate-100 text-slate-800",
  };

  const { user } = useAuth();

  const isAgent = user?.role === "agente";

  const handleCardClick = () => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/tickets/${ticket.id}`);
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex flex-row gap-2">
        {isAgent && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(e, ticket.id);
            }}
            role="checkbox"
            aria-checked={selectedIds.has(ticket.id)}
            aria-label={`Seleccionar ticket ${ticket.id}`}
            className="flex self-stretch items-center justify-center cursor-pointer px-2"
          >
            <IosCheckbox
              checked={selectedIds.has(ticket.id)}
              onChange={() => {}}
              size={44}
              variant="red"
              ariaLabel={`Seleccionar ticket ${ticket.id}`}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-row justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                {ticket.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {ticket.description}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 ml-3">
                  {ticket.archived === 1 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-300/70 text-slate-700 dark:bg-slate-600 dark:text-slate-100">
                      Archivado
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                  {(() => {
                    const cat = CATEGORY_MAP[ticket.category];
                    return cat ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}
                      >
                        {cat.label}
                      </span>
                    ) : null;
                  })()}
                  {(() => {
                    const pri = PRIORITY_MAP[ticket.priority];
                    return pri ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pri.color}`}
                      >
                        {pri.label}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              <div>
                {(ticket.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/tickets?tag=${encodeURIComponent(tag)}`);
                        }}
                        className={`${TAG_CHIP_CLASS} cursor-pointer hover:opacity-80`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center text-xs text-slate-400 dark:text-slate-500">
            <span>Cliente: {ticket.client_id}</span>
            {ticket.agent_id && (
              <span className="ml-3">
                Agente: {agentName || ticket.agent_id}
              </span>
            )}
            <span className="ml-auto">
              {new Date(ticket.created_at).toLocaleDateString("es-ES")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
