import axios from 'axios';

const BASE_URL = "https://apple-indya-mobiles.onrender.com";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export const inventoryAPI = {
  getAll: (params) => API.get('/inventory', { params }),
  getSummary: () => API.get('/inventory/summary'),
  getOne: (id) => API.get(`/inventory/${id}`),
  create: (data) => API.post('/inventory', data),
  update: (id, data) => API.put(`/inventory/${id}`, data),
  restock: (id, data) => API.patch(`/inventory/${id}/restock`, data),
  delete: (id) => API.delete(`/inventory/${id}`),
};

export const salesAPI = {
  createSale: (data) => API.post('/sales', data),
  getTransactions: () => API.get('/sales/transactions'),
};

export const billsAPI = {
  getAll: () => API.get('/bills'),
  getOne: (id) => API.get(`/bills/${id}`),
};

export const dashboardAPI = {
  getSummary: () => API.get('/dashboard'),
};