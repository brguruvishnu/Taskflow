// Central API service for all frontend requests
const API_BASE = '/api';

const api = {
    // Helper to get headers with Auth token
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    // Handle fetch responses centrally
    handleResponse: async (response) => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            // Auto logout if token is invalid
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/index.html';
            }
            const error = (data && data.error) || response.statusText;
            throw new Error(error);
        }

        return data;
    },

    // Auth
    login: async (credentials) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return api.handleResponse(res);
    },

    register: async (data) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return api.handleResponse(res);
    },

    getMe: async () => {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    // Dashboard
    getDashboard: async () => {
        const res = await fetch(`${API_BASE}/dashboard`, {
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    // Projects
    getProjects: async () => {
        const res = await fetch(`${API_BASE}/projects`, {
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    getProject: async (id) => {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    createProject: async (data) => {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(data)
        });
        return api.handleResponse(res);
    },

    // Tasks
    getTasks: async (projectId) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    createTask: async (projectId, data) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(data)
        });
        return api.handleResponse(res);
    },

    updateTask: async (projectId, taskId, data) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: api.getHeaders(),
            body: JSON.stringify(data)
        });
        return api.handleResponse(res);
    },

    deleteTask: async (projectId, taskId) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    // Members
    getMembers: async (projectId) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    },

    addMember: async (projectId, email) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ email })
        });
        return api.handleResponse(res);
    },
    
    removeMember: async (projectId, userId) => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/members/${userId}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        return api.handleResponse(res);
    }
};

// Check auth status on page load (except for index page)
document.addEventListener('DOMContentLoaded', () => {
    const isAuthPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    const token = localStorage.getItem('token');

    if (!token && !isAuthPage) {
        window.location.href = '/index.html';
    } else if (token && isAuthPage) {
        // Verify token is still valid, if so redirect to dashboard
        api.getMe()
            .then(() => { window.location.href = '/dashboard.html'; })
            .catch(() => { /* Token invalid, stay on login */ localStorage.removeItem('token'); });
    }
});
