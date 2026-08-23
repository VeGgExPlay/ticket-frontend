import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  fetchTicket,
  updateTicketApi,
  createCommentApi,
  fetchAgents,
  fetchTicketHistory,
  fetchAttachments,
  uploadAttachment,
  deleteAttachment,
  archiveTicket,
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  updateTicketTags,
} from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  STATUS_MAP,
  CATEGORY_MAP,
  PRIORITY_MAP,
  FIELD_LABELS,
  TAG_CHIP_CLASS,
} from "../constants/ticket.js";
import TicketSidebar from "../components/ticket-detail/TicketSidebar.jsx";
import TicketTabs from "../components/ticket-detail/TicketTabs.jsx";
import CommentsTab from "../components/ticket-detail/CommentsTab.jsx";
import HistoryTab from "../components/ticket-detail/HistoryTab.jsx";
import AttachmentsTab from "../components/ticket-detail/AttachmentsTab.jsx";
import CommentFormTab from "../components/ticket-detail/CommentFormTab.jsx";
import ActionsTab from "../components/ticket-detail/ActionsTab.jsx";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [internal, setInternal] = useState(false);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [activeTab, setActiveTab] = useState("comments");
  const [tagInput, setTagInput] = useState("");
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    if (user?.role === "agente") {
      fetchAgents()
        .then((res) => setAgents(res.agents || []))
        .catch(() => {});
      fetchTemplates()
        .then((res) => setTemplates(res.templates || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;
    loadHistory();
    loadAttachments();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(loadComments, 15000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadHistory() {
    try {
      const res = await fetchTicketHistory(id);
      setHistory(res.history || []);
    } catch {
      // ignore history load errors
    }
  }

  async function loadAttachments() {
    try {
      const res = await fetchAttachments(id);
      setAttachments(res.attachments || []);
    } catch {
      // ignore attachment load errors
    }
  }

  async function loadComments() {
    try {
      const res = await fetchTicket(id);
      setData((prev) => (prev ? { ...prev, comments: res.comments || [] } : prev));
    } catch {
      // ignore polling errors
    }
  }

  async function loadTicket() {
    try {
      const res = await fetchTicket(id);
      setData(res);
      setStatus(res.ticket.status);
      setCategory(res.ticket.category || "otro");
      setPriority(res.ticket.priority || "media");
      setSelectedAgentId(res.ticket.agent_id ?? "");
    } catch (err) {
      toast.error(err.message || "Error al cargar ticket");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateTicketApi(id, status, data.ticket.agent_id);
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Error al actualizar estado");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignmentChange(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const agentId = selectedAgentId === "" ? null : Number(selectedAgentId);
      const res = await updateTicketApi(id, data.ticket.status, agentId);
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Error al actualizar asignación");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCategoryChange(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateTicketApi(
        id,
        data.ticket.status,
        data.ticket.agent_id,
        category,
        undefined,
      );
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Error al actualizar categoría");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePriorityChange(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateTicketApi(
        id,
        data.ticket.status,
        data.ticket.agent_id,
        undefined,
        priority,
      );
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Error al actualizar prioridad");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await createCommentApi(id, comment.trim(), internal);
      setData((prev) => ({
        ...prev,
        comments: [...prev.comments, res.comment],
      }));
      setComment("");
      setInternal(false);
    } catch (err) {
      toast.error(err.message || "Error al crear comentario");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAttachmentUpload() {
    if (!attachmentFile) return;
    setSubmitting(true);
    setAttachmentError("");
    try {
      const res = await uploadAttachment(id, attachmentFile);
      setAttachments((prev) => [...prev, res.attachment]);
      setAttachmentFile(null);
    } catch (err) {
      setAttachmentError(err.message || "Error al subir archivo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAttachmentDelete(attId) {
    setSubmitting(true);
    try {
      await deleteAttachment(attId);
      setAttachments((prev) => prev.filter((a) => a.id !== attId));
    } catch (err) {
      toast.error(err.message || "Error al eliminar adjunto");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchiveToggle() {
    setSubmitting(true);
    try {
      const res = await archiveTicket(id, !data.ticket.archived);
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Error al archivar ticket");
    } finally {
      setSubmitting(false);
    }
  }

  function handleTemplateSelect(e) {
    const selId = Number(e.target.value);
    setTemplateId("");
    if (!selId) return;
    const tpl = templates.find((t) => t.id === selId);
    if (!tpl) return;
    setComment((prev) => (prev ? `${prev}\n${tpl.content}` : tpl.content));
  }

  async function handleCreateTemplate(e) {
    e.preventDefault();
    if (!newTemplateTitle.trim() || !newTemplateContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await createTemplate(
        newTemplateTitle.trim(),
        newTemplateContent.trim(),
      );
      setTemplates((prev) => [...prev, res.template]);
      setNewTemplateTitle("");
      setNewTemplateContent("");
    } catch (err) {
      toast.error(err.message || "Error al crear plantilla");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTagSubmit(e) {
    e.preventDefault();
    const raw = tagInput.trim();
    if (!raw) return;
    setSavingTags(true);
    try {
      const current = data.ticket.tags || [];
      const next = [
        ...current,
        raw.toLowerCase().replace(/\s+/g, "-").slice(0, 30),
      ];
      const res = await updateTicketTags(id, next);
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      setTagInput("");
      toast.success("Etiqueta agregada");
    } catch (err) {
      toast.error(err.message || "Error al agregar etiqueta");
    } finally {
      setSavingTags(false);
    }
  }

  async function handleRemoveTag(tagToRemove) {
    setSavingTags(true);
    try {
      const next = (data.ticket.tags || []).filter((t) => t !== tagToRemove);
      const res = await updateTicketTags(id, next);
      setData((prev) => ({ ...prev, ticket: res.ticket }));
      toast.success("Etiqueta eliminada");
    } catch (err) {
      toast.error(err.message || "Error al eliminar etiqueta");
    } finally {
      setSavingTags(false);
    }
  }

  async function handleDeleteTemplate(tplId) {
    setSubmitting(true);
    try {
      await deleteTemplate(tplId);
      setTemplates((prev) => prev.filter((t) => t.id !== tplId));
    } catch (err) {
      toast.error(err.message || "Error al eliminar plantilla");
    } finally {
      setSubmitting(false);
    }
  }

  function getAgentName(agentId) {
    if (!agentId && agentId !== 0) return "Sin asignar";
    if (agentId === "" || agentId === null || agentId === undefined)
      return "Sin asignar";
    const found = agents.find((a) => a.id === Number(agentId));
    return found ? found.name : `Agente #${agentId}`;
  }

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

  if (loading)
    return (
      <p className="text-slate-400 dark:text-slate-500 text-sm">Cargando...</p>
    );
  if (!data) return null;

  const isArchived = data.ticket.archived === 1;

  const statusInfo = STATUS_MAP[data.ticket.status] || {
    label: data.ticket.status,
    color: "bg-slate-100 text-slate-800",
  };
  const agent = agents.find((a) => a.id === data.ticket.agent_id);

  return (
    <div>
      <button
        onClick={() => navigate("/tickets")}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
      >
        ← Volver a tickets
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <TicketSidebar ticket={data.ticket} history={history} />
        <div className="space-y-4">
          <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-row gap-2 items-center justify-center">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {data.ticket.title}
                </h1>
                {/* <div className="flex flex-row gap-4 items-center text-xs text-slate-400 dark:text-slate-500">
                  <span>Cliente ID: {data.ticket.client_id}</span>
                  {data.ticket.agent_id && (
                    <span>Agente: {agent ? agent.name : "Sin agente"}</span>
                  )}
                </div> */}
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
                {(() => {
                  const cat = CATEGORY_MAP[data.ticket.category];
                  return cat ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}
                    >
                      {cat.label}
                    </span>
                  ) : null;
                })()}
                {(() => {
                  const pri = PRIORITY_MAP[data.ticket.priority];
                  return pri ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pri.color}`}
                    >
                      {pri.label}
                    </span>
                  ) : null;
                })()}
                {data.ticket.archived === 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-300/70 text-slate-700 dark:bg-slate-600 dark:text-slate-100">
                    Archivado
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {data.ticket.description}
              </p>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(data.ticket.created_at).toLocaleString("es-ES")}
              </span>
            </div>
          </div>
          {!isArchived &&
            (user.role === "agente" || data.ticket.client_id === user.id) && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Etiquetas
                  </span>
                  {(data.ticket.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className={`${TAG_CHIP_CLASS} inline-flex items-center gap-1`}
                    >
                      {tag}
                      {user.role === "agente" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={savingTags}
                          className="ml-0.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {(data.ticket.tags || []).length === 0 && (
                    <span className="text-xs text-slate-400">
                      Sin etiquetas
                    </span>
                  )}
                  {user.role === "agente" && (
                    <form
                      onSubmit={handleTagSubmit}
                      className="flex items-center gap-2 ml-auto"
                    >
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Nueva etiqueta..."
                        className="input text-xs py-1 px-2"
                        disabled={savingTags}
                      />
                      <button
                        type="submit"
                        disabled={savingTags || !tagInput.trim()}
                        className="px-2.5 py-1 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Agregar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          {isArchived && (data.ticket.tags || []).length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Etiquetas
                </span>
                {(data.ticket.tags || []).map((tag) => (
                  <span key={tag} className={`${TAG_CHIP_CLASS} opacity-70`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <TicketTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              userRole={user.role}
            />
          </div>
          {isArchived && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
              Este ticket está archivado. Solo se permite desarchivarlo; los
              demás campos están deshabilitados.
            </p>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-6"
            >
              {activeTab === "comments" && (
                <CommentsTab comments={data.comments} />
              )}
              {activeTab === "history" && (
                <HistoryTab
                  history={history}
                  formatHistoryValue={formatHistoryValue}
                  getAgentName={getAgentName}
                />
              )}
              {activeTab === "attachments" && (
                <AttachmentsTab
                  ticket={data.ticket}
                  attachments={attachments}
                  user={user}
                  submitting={submitting}
                  disabled={isArchived}
                  onUpload={handleAttachmentUpload}
                  onDelete={handleAttachmentDelete}
                  attachmentFile={attachmentFile}
                  setAttachmentFile={setAttachmentFile}
                  attachmentError={attachmentError}
                />
              )}
              {activeTab === "commentForm" && (
                <CommentFormTab
                  user={user}
                  submitting={submitting}
                  disabled={isArchived}
                  comment={comment}
                  setComment={setComment}
                  internal={internal}
                  setInternal={setInternal}
                  templates={templates}
                  templateId={templateId}
                  setTemplateId={setTemplateId}
                  onTemplateSelect={handleTemplateSelect}
                  onSubmit={handleCommentSubmit}
                  showTemplates={showTemplates}
                  setShowTemplates={setShowTemplates}
                  newTemplateTitle={newTemplateTitle}
                  setNewTemplateTitle={setNewTemplateTitle}
                  newTemplateContent={newTemplateContent}
                  setNewTemplateContent={setNewTemplateContent}
                  onCreateTemplate={handleCreateTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              )}
              {activeTab === "actions" && user.role === "agente" && (
                <ActionsTab
                  ticket={data.ticket}
                  status={status}
                  setStatus={setStatus}
                  category={category}
                  setCategory={setCategory}
                  priority={priority}
                  setPriority={setPriority}
                  selectedAgentId={selectedAgentId}
                  setSelectedAgentId={setSelectedAgentId}
                  agents={agents}
                  submitting={submitting}
                  disabled={isArchived}
                  onStatusChange={handleStatusChange}
                  onAssignmentChange={handleAssignmentChange}
                  onCategoryChange={handleCategoryChange}
                  onPriorityChange={handlePriorityChange}
                  onArchiveToggle={handleArchiveToggle}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
