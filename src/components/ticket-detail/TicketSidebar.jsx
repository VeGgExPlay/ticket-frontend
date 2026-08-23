import { STATUS_MAP } from "../../constants/ticket.js";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function TicketSidebar({ ticket, history }) {
  const creatorName = ticket.creator_name || `Cliente #${ticket.client_id}`;
  const creatorRole = ticket.creator_role || "cliente";
  const creatorAvatar = ticket.creator_avatar;
  const statusInfo = STATUS_MAP[ticket.status] || {
    label: ticket.status,
    color: "bg-slate-100 text-slate-800",
  };

  const statusHistory = history
    .filter((h) => h.field === "status")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <aside className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-fit">
      <div className="flex flex-col items-center text-center">
        {creatorAvatar ? (
          <img
            src={creatorAvatar}
            alt={creatorName}
            className="w-16 h-16 rounded-full object-cover mb-3"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {getInitials(creatorName)}
          </div>
        )}
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {creatorName}
        </p>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
          {creatorRole === "agente" ? "Agente" : "Cliente"}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Fecha de llegada
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {new Date(ticket.created_at).toLocaleString("es-ES")}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Estado actual
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {statusHistory.length > 0 && (
        <div className="mt-6 max-h-64 overflow-y-auto pr-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
            Historial de estados
          </p>
          <ul>
            {statusHistory.map((h, i) => {
              const label = STATUS_MAP[h.new_value]?.label || h.new_value;
              const isLast = i === statusHistory.length - 1;
              return (
                <li key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5" />
                    {!isLast && (
                      <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                  <div className="min-w-0 pb-6">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(h.created_at).toLocaleString("es-ES")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
