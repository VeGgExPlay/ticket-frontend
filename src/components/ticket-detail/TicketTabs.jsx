const AGENT_TABS = [
  { key: "comments", label: "Comentarios" },
  { key: "history", label: "Historial" },
  { key: "attachments", label: "Evidencias" },
  { key: "commentForm", label: "Comentar + Plantillas" },
  { key: "actions", label: "Acciones" },
];

const CLIENT_TABS = [
  { key: "comments", label: "Comentarios" },
  { key: "attachments", label: "Evidencias" },
  { key: "commentForm", label: "Comentar" },
];

export default function TicketTabs({ activeTab, onTabChange, userRole }) {
  const tabs = userRole === "agente" ? AGENT_TABS : CLIENT_TABS;

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
