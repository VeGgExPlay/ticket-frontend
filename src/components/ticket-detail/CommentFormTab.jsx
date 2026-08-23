import IosCheckbox from "../IosCheckbox.jsx";

export default function CommentFormTab({
  user,
  submitting,
  disabled = false,
  comment,
  setComment,
  internal,
  setInternal,
  templates,
  templateId,
  setTemplateId,
  onTemplateSelect,
  onSubmit,
  showTemplates,
  setShowTemplates,
  newTemplateTitle,
  setNewTemplateTitle,
  newTemplateContent,
  setNewTemplateContent,
  onCreateTemplate,
  onDeleteTemplate,
}) {
  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Añadir comentario
        </label>
        {user.role === "agente" && (
          <label
            htmlFor="internal-comment"
            className={`flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <IosCheckbox
              id="internal-comment"
              checked={!!internal}
              onChange={(v) => setInternal(v)}
              disabled={disabled}
            />
            <span>Comentario interno (solo visible para agentes)</span>
          </label>
        )}
        {user.role === "agente" && (
          <div>
            <select
              value={templateId}
              onChange={onTemplateSelect}
              disabled={disabled}
              className="select max-w-xs"
            >
              <option value="">Insertar plantilla...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          disabled={disabled}
          className="textarea mt-1"
          required
        />
        <button
          type="submit"
          disabled={submitting || !comment.trim() || disabled}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          Comentar
        </button>
      </form>
      {user.role === "agente" && (
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <button
            type="button"
            onClick={() => setShowTemplates((prev) => !prev)}
            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            {showTemplates ? "Ocultar plantillas" : "Gestionar plantillas"}
          </button>
          {showTemplates && (
            <div className="mt-4 space-y-4">
              {templates.length > 0 && (
                <ul className="flex flex-col space-y-2">
                  {templates.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                    >
                      <div className="min-w-0 items-start">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap mt-1">
                          {t.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => onDeleteTemplate(t.id)}
                          disabled={submitting}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 whitespace-nowrap"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={onCreateTemplate} className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Contenido
                  </label>
                  <textarea
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    rows={3}
                    className="textarea"
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !newTemplateTitle.trim() ||
                    !newTemplateContent.trim()
                  }
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  Crear plantilla
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
