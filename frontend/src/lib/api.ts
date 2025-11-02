/**
 * API client for FinPilot backend
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const api = axios.create({
	baseURL: `${API_URL}/api`,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Add auth token to requests
api.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('access_token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
	}
	return config
})

// Handle token refresh on 401
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			const refreshToken = localStorage.getItem('refresh_token')
			if (refreshToken) {
				try {
					const response = await axios.post(`${API_URL}/api/auth/refresh/`, {
						refresh: refreshToken,
					})
					localStorage.setItem('access_token', response.data.access)
					// Retry original request
					return api.request(error.config)
				} catch {
					// Refresh failed, redirect to login
					localStorage.removeItem('access_token')
					localStorage.removeItem('refresh_token')
					window.location.href = '/login'
				}
			}
		}
		return Promise.reject(error)
	}
)

export default api

