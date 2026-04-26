/**
 * API Handler for Perfume Store
 * Transitioned from LocalStorage to Real Backend API
 */

const BASE_URL = '/api';

const api = {
    // Helper for fetch requests
    request: async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // If body is FormData, don't set Content-Type header (let browser do it)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        // Add Token if exists (for future auth expansion)
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        // Timeout: 15 seconds to prevent buttons from hanging forever
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        let response;
        try {
            response = await fetch(`${BASE_URL}${endpoint}`, { ...config, signal: controller.signal });
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error('انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
            }
            throw err;
        }
        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'حدث خطأ ما');
        }

        return data;
    },

    // Authentication
    initAuth: () => {
        // No longer needed for LocalStorage seeding, 
        // but kept for compatibility.
        console.log('API Initialized');
    },

    login: async (username, password) => {
        const data = await api.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    register: async (userData) => {
        const data = await api.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
    },

    // Products
    getProducts: async (search = '', category = '') => {
        let url = `/products?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (category) url += `category=${encodeURIComponent(category)}`;
        return await api.request(url);
    },

    addProduct: async (formData) => {
        // formData is already passed correctly from main.js or add_product page
        return await api.request('/products', {
            method: 'POST',
            body: formData
        });
    },

    deleteProduct: async (id) => {
        // Note: Backend might need product deletion route. 
        // Currently seen list of routes, but verifying productRoutes if it has DELETE.
        // Assuming it's mapped to DELETE /api/products/:id
        return await api.request(`/products/${id}`, {
            method: 'DELETE'
        });
    },

    editProductPrice: async (id, newPrice) => {
        return await api.request(`/products/${id}/price`, {
            method: 'PUT',
            body: JSON.stringify({ price: newPrice })
        });
    },

    editProductImage: async (id, formData) => {
        return await api.request(`/products/${id}/image`, {
            method: 'PUT',
            body: formData
        });
    },

    // Categories
    getCategories: async () => {
        return await api.request('/categories');
    },

    addCategory: async (name) => {
        return await api.request('/categories', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    },

    deleteCategory: async (id) => {
        return await api.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    },

    // Orders
    placeOrder: async (formData) => {
        return await api.request('/orders', {
            method: 'POST',
            body: formData
        });
    },

    getOrders: async () => {
        return await api.request('/orders');
    },

    approvePayment: async (orderId) => {
        return await api.request(`/orders/${orderId}/approve`, {
            method: 'PATCH'
        });
    },

    // Dashboard & Analytics
    getDashboardStats: async () => {
        return await api.request('/dashboard/stats');
    },

    // Customers
    getCustomers: async () => {
        return await api.request('/customers');
    },

    // Admin Vendor Management
    getVendors: async () => {
        return await api.request('/admin/vendors');
    },

    approveVendor: async (id) => {
        return await api.request(`/admin/vendors/${id}/approve`, {
            method: 'PUT'
        });
    },

    rejectVendor: async (id) => {
        return await api.request(`/admin/vendors/${id}/reject`, {
            method: 'PUT'
        });
    },

    promoteToAdmin: async (id) => {
        return await api.request(`/admin/vendors/${id}/promote`, {
            method: 'PUT'
        });
    }
};

window.api = api; // Make it global as before
