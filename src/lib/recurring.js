import { api } from './api';

// Monthly payments the API logs as expenses on their due day.
export const listRecurring = () => api.get('/api/recurring').then((r) => r.data);
export const createRecurring = (body) => api.post('/api/recurring', body).then((r) => r.data);
export const updateRecurring = (id, body) => api.put(`/api/recurring/${id}`, body).then((r) => r.data);
export const deleteRecurring = (id) => api.delete(`/api/recurring/${id}`);
export const logRecurringNow = (id) => api.post(`/api/recurring/${id}/log`).then((r) => r.data);
export const addDefaultRecurring = () => api.post('/api/recurring/defaults').then((r) => r.data);

export const getEmailSettings = () => api.get('/api/notifications').then((r) => r.data);
export const saveEmailSettings = (body) => api.put('/api/notifications', body).then((r) => r.data);
export const sendTestEmail = () => api.post('/api/notifications/test').then((r) => r.data);

/** 1 -> "1st", 22 -> "22nd". */
export function ordinal(n) {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return `${n}${suffix}`;
}
