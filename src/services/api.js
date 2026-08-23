const BASE = '/api';

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error en la solicitud');
  }
  return res.json().catch(() => ({}));
}

export async function register(name, email, password, role) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export async function me() {
  return request('/auth/me');
}

export async function updateProfile({ name, currentPassword, newPassword }) {
  return request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name, currentPassword, newPassword }),
  });
}

export async function fetchTickets() {
  return request('/tickets');
}

export async function fetchTicket(id) {
  return request(`/tickets/${id}`);
}

export async function createTicketApi(title, description, category, priority, tags = []) {
  const body = { title, description, category };
  if (priority) body.priority = priority;
  if (tags && tags.length > 0) body.tags = tags;
  return request('/tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateTicketApi(id, status, agent_id, category, priority) {
  const body = { status, agent_id };
  if (category !== undefined) body.category = category;
  if (priority !== undefined) body.priority = priority;
  return request(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function updateTicketTags(id, tags) {
  return request(`/tickets/${id}/tags`, { method: 'PUT', body: JSON.stringify({ tags }) });
}

export async function deleteTicketApi(id) {
  return request(`/tickets/${id}`, { method: 'DELETE' });
}

export async function archiveTicket(id, archived) {
  return request(`/tickets/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ archived }),
  });
}

export async function fetchTemplates() {
  return request('/templates');
}

export async function createTemplate(title, content) {
  return request('/templates', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
}

export async function deleteTemplate(id) {
  return request(`/templates/${id}`, { method: 'DELETE' });
}

export async function createCommentApi(ticketId, content, internal = false) {
  return request(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, internal }),
  });
}

export async function bulkTicketsAction(ids, { status, agent_id, archived } = {}) {
  const body = { ids };
  if (status !== undefined) body.status = status;
  if (agent_id !== undefined) body.agent_id = agent_id;
  if (archived !== undefined) body.archived = archived;
  return request('/tickets/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchAgents() {
  return request('/users/agents');
}

export async function searchTickets(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  return request(`/tickets/search?${searchParams.toString()}`);
}

export async function fetchMetrics() {
  return request('/metrics');
}

export async function fetchTicketHistory(id) {
  return request(`/tickets/${id}/history`);
}

export async function fetchAttachments(id) {
  return request(`/tickets/${id}/attachments`);
}

export async function uploadAttachment(id, file) {
  const form = new FormData();
  form.append('file', file);
  return request(`/tickets/${id}/attachments`, {
    method: 'POST',
    body: form,
  });
}

export async function deleteAttachment(attId) {
  return request(`/attachments/${attId}`, { method: 'DELETE' });
}

export const ATTACHMENT_BASE = '/api/attachments';
export function getAttachmentUrl(attId) {
  return `${ATTACHMENT_BASE}/${attId}`;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "0 B";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  if (kb >= 1) return `${kb.toFixed(1)} KB`;
  return `${bytes} B`;
}

export async function fetchNotifications() {
  return request('/notifications');
}

export async function markNotificationsRead() {
  return request('/notifications/read', { method: 'POST' });
}

export function exportTicketsCsv(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  window.open(`/api/tickets/export?${searchParams.toString()}`, '_blank');
}

export async function fetchSavedViews() {
  return request('/views');
}

export async function createSavedView(name, filters) {
  return request('/views', { method: 'POST', body: JSON.stringify({ name, filters }) });
}

export async function updateSavedView(id, { name, filters }) {
  return request(`/views/${id}`, { method: 'PATCH', body: JSON.stringify({ name, filters }) });
}

export async function deleteSavedView(id) {
  return request(`/views/${id}`, { method: 'DELETE' });
}

export function currentFilters(state) {
  return {
    q: state.q || undefined,
    status: state.status || undefined,
    category: state.category || undefined,
    priority: state.priority || undefined,
    agent_id: state.agentId || undefined,
    archived: state.showArchived ? '1' : undefined,
    tag: state.tag || undefined,
  };
}

