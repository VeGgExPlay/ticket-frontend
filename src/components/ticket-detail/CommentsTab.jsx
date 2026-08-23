export default function CommentsTab({ comments }) {
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Sin comentarios.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg border p-4 ${
                c.internal === 1
                  ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              {c.internal === 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800 dark:bg-amber-800/40 dark:text-amber-200 mb-2">
                  Interno
                </span>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                {c.content}
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {c.creator_name} ·{" "}
                {new Date(c.created_at).toLocaleString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
