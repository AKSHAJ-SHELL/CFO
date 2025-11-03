'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type Transaction, type Anomaly, type Report, type ModelMetrics } from '@/lib/api'

// Transactions
export function useTransactions() {
	return useQuery({
		queryKey: ['transactions'],
		queryFn: async () => {
			const { data } = await api.get('/transactions/')
			return data as Transaction[]
		},
	})
}

// Anomalies
export function useAnomalies() {
	return useQuery({
		queryKey: ['anomalies'],
		queryFn: async () => {
			const { data } = await api.get('/anomalies/')
			return data as Anomaly[]
		},
	})
}

// Reports
export function useReports(orgId?: string) {
	return useQuery({
		queryKey: ['reports', orgId],
		queryFn: async () => {
			const { data } = await api.get(`/orgs/${orgId}/reports/`)
			return data as Report[]
		},
		enabled: !!orgId,
	})
}

// Model metrics
export function useModelMetrics(modelName: string) {
	return useQuery({
		queryKey: ['model-metrics', modelName],
		queryFn: async () => {
			// This would typically come from ML dashboard or service
			// For now, return mock data structure
			return [] as ModelMetrics[]
		},
	})
}

// Model playground - classify
export function useClassify() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (data: { description: string; amount: number }) => {
			const { data: response } = await api.post('/classify/', data)
			return response
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['classifications'] })
		},
	})
}

// Model playground - generate report
export function useGenerateReport() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (data: { org_id: string; metrics: Record<string, any> }) => {
			const { data: response } = await api.post('/reports/generate/', data)
			return response
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reports'] })
		},
	})
}

