import api from './axios';

export const fleetApi = {
  // Vehicles
  getVehicles: (params?: any) => api.get('vehicles', { params }),
  getVehicle: (id: string) => api.get(`vehicles/${id}`),
  createVehicle: (data: any) => api.post('vehicles', data),
  updateVehicle: (id: string, data: any) => api.put(`vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`vehicles/${id}`),

  // Incomes
  getIncomes: (params?: any) => api.get('income', { params }),
  createIncome: (data: any) => api.post('income', data),
  deleteIncome: (id: string) => api.delete(`income/${id}`),

  // Expenses
  getExpenses: (params?: any) => api.get('expenses', { params }),
  createExpense: (data: any) => api.post('expenses', data),
  deleteExpense: (id: string) => api.delete(`expenses/${id}`),

  // Fuel
  getFuelPurchases: (params?: any) => api.get('fuel', { params }),
  createFuelPurchase: (data: any) => api.post('fuel', data),
  deleteFuelPurchase: (id: string) => api.delete(`fuel/${id}`),

  // Reports
  getSummary: (params?: any) => api.get('reports/summary', { params }),
  getAIAnalysis: (params?: any) => api.get('reports/analysis', { params }),
  getVehiclePerformance: (id: string) => api.get(`reports/vehicle/${id}`),
  chatWithAI: (data: { message: string, history?: any[] }, params?: any) => api.post('reports/chat', data, { params }),

  // Maintenance
  getMaintenance: (params?: any) => api.get('maintenance', { params }),
  createMaintenance: (data: any) => api.post('maintenance', data),

  // Notifications
  getNotifications: () => api.get('notifications'),
  markNotificationAsRead: (id: string) => api.put(`notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put('notifications/read-all'),
};
