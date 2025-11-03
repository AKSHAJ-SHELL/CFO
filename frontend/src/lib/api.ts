import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export const api = axios.create({
	baseURL: `${API_URL}/api`,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Add auth token interceptor - looks for 'access_token' to match backend response
api.interceptors.request.use((config) => {
	const token =
		typeof window !== 'undefined'
			? localStorage.getItem('access_token')
			: null
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Handle 401 errors - attempt token refresh before redirecting to login
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		if (error.response?.status === 401 && typeof window !== 'undefined') {
			// Don't attempt refresh if already on login/signup pages
			if (
				window.location.pathname.includes('/login') ||
				window.location.pathname.includes('/signup')
			) {
				return Promise.reject(error)
			}

			// Don't retry if this request already failed after a refresh attempt
			if (originalRequest._retry) {
				// Refresh failed or was already attempted, redirect to login
				localStorage.removeItem('access_token')
				localStorage.removeItem('refresh_token')
				localStorage.removeItem('user')
				window.location.href = '/login'
				return Promise.reject(error)
			}

			// Mark this request as retried to prevent infinite loops
			originalRequest._retry = true

			// Attempt to refresh the access token
			const refreshToken = localStorage.getItem('refresh_token')
			if (refreshToken) {
				try {
					// Call refresh endpoint without using the api instance to avoid interceptor loops
					const refreshResponse = await axios.post(
						`${API_URL}/api/auth/refresh/`,
						{ refresh: refreshToken },
						{
							headers: {
								'Content-Type': 'application/json',
							},
						}
					)

					const { access } = refreshResponse.data

					if (access) {
						// Store the new access token
						localStorage.setItem('access_token', access)

						// Update the original request with the new token
						originalRequest.headers.Authorization = `Bearer ${access}`

						// Retry the original request with the new token
						return api(originalRequest)
					}
				} catch (refreshError) {
					// Refresh failed, clear tokens and redirect to login
					localStorage.removeItem('access_token')
					localStorage.removeItem('refresh_token')
					localStorage.removeItem('user')
					window.location.href = '/login'
					return Promise.reject(refreshError)
				}
			}

			// No refresh token available, redirect to login
			localStorage.removeItem('access_token')
			localStorage.removeItem('refresh_token')
			localStorage.removeItem('user')
			window.location.href = '/login'
		}

		return Promise.reject(error)
	}
)

export interface Transaction {
	id: string
	description: string
	amount: number
	category: string
	date: string
	organization: string
}

export interface Anomaly {
	id: string
	transaction: Transaction
	score: number
	created_at: string
}

export interface Report {
	id: string
	org_id: string
	period_start: string
	period_end: string
	summary_text: string
	created_at: string
}

export interface ModelMetrics {
	epoch: number
	loss: number
	accuracy?: number
	perplexity?: number
	timestamp: string
}

export interface ModelInfo {
	name: string
	version: string
	last_trained: string
	metrics: {
		accuracy?: number
		perplexity?: number
	}
}
