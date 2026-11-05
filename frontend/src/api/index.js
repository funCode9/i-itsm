import api from './axiosConfig';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const incidentAPI = {
  create: (data) => api.post('/incidents', data),
  getAll: () => api.get('/incidents'),
  getMy: () => api.get('/incidents/my'),
  getById: (id) => api.get(`/incidents/${id}`),
  updateStatus: (id, data) => api.patch(`/incidents/${id}/status`, data),
  classify: (id, data) => api.post(`/incidents/${id}/classify`, data),
  manualAssign: (id, techId) => api.post(`/incidents/${id}/assign/${techId}`),
  getNotes: (id) => api.get(`/incidents/${id}/notes`),
  addNote: (id, data) => api.post(`/incidents/${id}/notes`, data),
  suggestCategory: (title, description) =>
    api.get('/incidents/suggest-category', { params: { title, description } }),
  checkDuplicates: (params) => api.get('/incidents/check-duplicates', { params }),
};

export const technicianAPI = {
  getAll: () => api.get('/technician/all'),
  getProfile: () => api.get('/technician/profile'),
  getById: (id) => api.get(`/technician/${id}`),
  getWorkload: (id) => api.get(`/technician/${id}/workload`),
  getMyIncidents: () => api.get('/technician/my-incidents'),
  setAvailability: (id, available) =>
    api.patch(`/technician/${id}/availability`, null, { params: { available } }),
  updateSkills: (id, skills) => api.put(`/technician/${id}/skills`, skills),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const serviceAPI = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const feedbackAPI = {
  submit: (incidentId, data) => api.post(`/feedback/incident/${incidentId}`, data),
  get: (incidentId) => api.get(`/feedback/incident/${incidentId}`),
};

export const auditAPI = {
  getAll: () => api.get('/audit'),
  getForIncident: (id) => api.get(`/audit/incident/${id}`),
};

export const slaPolicyAPI = {
  getAll: () => api.get('/sla-policies'),
  update: (id, data) => api.put(`/sla-policies/${id}`, data),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  toggleUser: (id, enabled) =>
    api.patch(`/admin/users/${id}/toggle`, null, { params: { enabled } }),
  createTechnician: (data) => api.post('/admin/technicians', data),
  getStrategy: () => api.get('/admin/strategy'),
  setStrategy: (strategy) =>
    api.put('/admin/strategy', null, { params: { strategy } }),
  getDashboard: () => api.get('/admin/reports/dashboard'),
  getWorkload: () => api.get('/admin/reports/workload'),
  getByStatus: () => api.get('/admin/reports/by-status'),
  getByPriority: () => api.get('/admin/reports/by-priority'),
  getByCategory: () => api.get('/admin/reports/by-category'),
  getByService: () => api.get('/admin/reports/by-service'),
  getSlaAll: () => api.get('/admin/sla/all'),
  getSlaBreached: () => api.get('/admin/sla/breached'),
  getAudit: () => api.get('/admin/audit'),
  getEmailLogs: () => api.get('/admin/audit/emails'),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
};
