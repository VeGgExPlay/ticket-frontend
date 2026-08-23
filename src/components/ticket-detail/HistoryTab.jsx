import { STATUS_MAP, CATEGORY_MAP, PRIORITY_MAP, FIELD_LABELS } from "../../constants/ticket.js";

export default function HistoryTab({ history, getAgentName }) {
  function formatHistoryValue(field, value) {
    if (value === null || value === undefined || value === "") return "—";
    switch (field) {
      case "status":
        return STATUS_MAP[value]?.label || value;
      case "agent_id":
        return getAgentName(value);
      case "category":
        return CATEGORY_MAP[value]?.label || value;
      case "priority":
        return PRIORITY_MAP[value]?.label || value;
      case "archived":
        return value === "1" ? "Sí" : "No";
      default:
        return value;
    }
  }

  return (
    <div className="max-h-96 overflow-y-auto pr-1">
      {history.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Sin cambios registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <div
              key={h.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
            >
              <p className="text-sm text-slate-700 dark:text-slate-200">
                <span className="font-medium">
                  {h.user_name || `Usuario #${h.user_id}`}
                </span>{" "}
                cambió{" "}
                <span className="font-medium">
                  {FIELD_LABELS[h.field] || h.field}
                </span>{" "}
                de{" "}
                <span className="text-slate-500 dark:text-slate-400">
                  {formatHistoryValue(h.field, h.old_value)}
                </span>{" "}
                a{" "}
                <span className="text-slate-900 dark:text-slate-100">
                  {formatHistoryValue(h.field, h.new_value)}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {new Date(h.created_at).toLocaleString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
