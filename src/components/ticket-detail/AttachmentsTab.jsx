import { formatBytes, getAttachmentUrl } from "../../services/api.js";

export default function AttachmentsTab({
  ticket,
  attachments,
  user,
  submitting,
  disabled = false,
  onUpload,
  onDelete,
  attachmentFile,
  setAttachmentFile,
  attachmentError,
}) {
  const canUpload = user.role === "agente" || ticket.client_id === user.id;

  function handleUploadSubmit(e) {
    e.preventDefault();
    if (!attachmentFile) return;
    onUpload();
  }

  return (
    <div>
      {attachments.length > 0 && (
        <div className="space-y-2 mb-4">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {att.filename}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatBytes(att.size)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <a
                  href={getAttachmentUrl(att.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  Descargar
                </a>
                {(user.role === "agente" ||
                  att.uploaded_by === user.id) && (
                  <button
                    onClick={() => onDelete(att.id)}
                    disabled={submitting}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {canUpload && !disabled && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Subir archivo
          </h3>
          <form onSubmit={handleUploadSubmit} className="file-upload-form">
            <label className="file-upload-label">
              <div className="file-upload-design">
                <svg viewBox="0 0 640 512" height="1em" aria-hidden="true">
                  <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                </svg>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Arrastra y suelta
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  o
                </p>
                <span className="browse-button">Seleccionar archivo</span>
              </div>
              <input
                id="file"
                type="file"
                onChange={(e) =>
                  setAttachmentFile(e.target.files[0] || null)
                }
              />
            </label>
          </form>
          {attachmentError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {attachmentError}
            </p>
          )}
          {attachmentFile && (
            <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {attachmentFile.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {(attachmentFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={onUpload}
                disabled={submitting}
                className="ml-4 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 whitespace-nowrap"
              >
                Subir archivo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
