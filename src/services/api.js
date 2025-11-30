// API service layer for backend requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token if available and not a public request
    const token = localStorage.getItem('token');
    const authHeaders = (token && options.requireAuth !== false) ? { 'Authorization': `Bearer ${token}` } : {};
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Don't throw "No token provided" error for public endpoints
        if (response.status === 401 && options.requireAuth === false) {
          throw new Error(data.error || 'Access denied');
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Restaurant APIs
  async getRestaurant(orgId, isPublic = false) {
    if (isPublic) {
      console.log('API: Using public endpoint for restaurant:', orgId);
      return this.request(`/restaurants/public/${orgId}`, { requireAuth: false });
    }
    console.log('API: Using authenticated endpoint for restaurant:', orgId);
    return this.request(`/restaurants/${orgId}`);
  }

  async createOrUpdateRestaurant(restaurantData) {
    return this.request('/restaurants', {
      method: 'POST',
      body: restaurantData,
    });
  }

  async updateRestaurant(orgId, updateData) {
    return this.request(`/restaurants/${orgId}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  async updateRestaurantLogo(orgId, logo) {
    return this.request(`/restaurants/${orgId}/logo`, {
      method: 'PATCH',
      body: { logo },
    });
  }

  async updateRestaurantLocation(orgId, position, address) {
    return this.request(`/restaurants/${orgId}/location`, {
      method: 'PATCH',
      body: { position, address },
    });
  }

  async getCharges(orgId, isPublic = false) {
    if (isPublic) {
      return this.request(`/restaurants/public/${orgId}/charges`, { requireAuth: false });
    }
    return this.request(`/restaurants/${orgId}/charges`);
  }

  async addCharge(orgId, chargeData) {
    return this.request(`/restaurants/${orgId}/charges`, {
      method: 'POST',
      body: chargeData,
    });
  }

  async updateCharge(orgId, chargeId, updateData) {
    return this.request(`/restaurants/${orgId}/charges/${chargeId}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  async deleteCharge(orgId, chargeId) {
    return this.request(`/restaurants/${orgId}/charges/${chargeId}`, {
      method: 'DELETE',
    });
  }

  async toggleCharge(orgId, chargeId) {
    return this.request(`/restaurants/${orgId}/charges/${chargeId}/toggle`, {
      method: 'PATCH',
    });
  }

  // Menu Items APIs
  async getMenuItems(orgId, filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters.subcategoryId) queryParams.append('subcategoryId', filters.subcategoryId);
    
    const queryString = queryParams.toString();
    return this.request(`/menu-items/${orgId}${queryString ? `?${queryString}` : ''}`);
  }

  async getMenuItem(orgId, itemId) {
    return this.request(`/menu-items/${orgId}/item/${itemId}`);
  }

  async createMenuItem(orgId, itemData) {
    return this.request(`/menu-items/${orgId}`, {
      method: 'POST',
      body: itemData,
    });
  }

  async updateMenuItem(orgId, itemId, updateData) {
    return this.request(`/menu-items/${orgId}/item/${itemId}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  async deleteMenuItem(orgId, itemId) {
    return this.request(`/menu-items/${orgId}/item/${itemId}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateMenuItems(orgId, items) {
    return this.request(`/menu-items/${orgId}/bulk`, {
      method: 'POST',
      body: { items },
    });
  }

  // Categories APIs
  async getCategories(orgId) {
    return this.request(`/categories/${orgId}`);
  }

  async getCategory(orgId, categoryId) {
    return this.request(`/categories/${orgId}/category/${categoryId}`);
  }

  async createCategory(orgId, categoryData) {
    return this.request(`/categories/${orgId}`, {
      method: 'POST',
      body: categoryData,
    });
  }

  async updateCategory(orgId, categoryId, updateData) {
    return this.request(`/categories/${orgId}/category/${categoryId}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  async deleteCategory(orgId, categoryId, options = {}) {
    const queryParams = new URLSearchParams();
    if (options.subcategoryId) {
      queryParams.append('subcategoryId', options.subcategoryId);
    }
    const queryString = queryParams.toString();
    return this.request(`/categories/${orgId}/category/${categoryId}${queryString ? `?${queryString}` : ''}`, {
      method: 'DELETE',
    });
  }

  // Orders APIs
  async getOrders(orgId, filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.customerName) queryParams.append('customerName', filters.customerName);
    if (filters.customerId) queryParams.append('customerId', filters.customerId);
    if (filters.tableNumber) queryParams.append('tableNumber', filters.tableNumber);
    
    const queryString = queryParams.toString();
    const endpoint = `/orders/${orgId}${queryString ? `?${queryString}` : ''}`;
    console.log('API: getOrders called with orgId:', orgId, 'filters:', filters, 'endpoint:', endpoint);
    return this.request(endpoint);
  }

  async getOrder(orgId, orderId) {
    return this.request(`/orders/${orgId}/order/${orderId}`);
  }

  async createOrder(orgId, orderData) {
    return this.request(`/orders/${orgId}`, {
      method: 'POST',
      body: orderData,
    });
  }

  async updateOrder(orgId, orderId, updateData) {
    return this.request(`/orders/${orgId}/order/${orderId}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  async updateOrderStatus(orgId, orderId, status) {
    return this.request(`/orders/${orgId}/order/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteOrder(orgId, orderId) {
    return this.request(`/orders/${orgId}/order/${orderId}`, {
      method: 'DELETE',
    });
  }

  // History APIs
  async getHistory(orgId, filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    return this.request(`/history/${orgId}${queryString ? `?${queryString}` : ''}`);
  }

  async getHistoryOrder(orgId, orderId) {
    return this.request(`/history/${orgId}/order/${orderId}`);
  }

  async deleteHistory(orgId, orderId) {
    return this.request(`/history/${orgId}/order/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Menu Suggestions APIs
  async getMenuSuggestions(orgId) {
    return this.request(`/menu-suggestions/${orgId}`);
  }

  async updateMenuSuggestions(orgId, suggestions) {
    return this.request(`/menu-suggestions/${orgId}`, {
      method: 'PUT',
      body: { suggestions },
    });
  }

  // Authentication APIs
  async superAdminLogin(username, password) {
    return this.request('/auth/super-admin/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async orgAdminLogin(username, password) {
    return this.request('/auth/org-admin/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async staffLogin(username, password) {
    return this.request('/auth/staff/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async customerAccess(orgId) {
    return this.request(`/auth/customer/access/${orgId}`, {
      method: 'GET',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  // Helper method to include auth token in requests
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export default new ApiService();

