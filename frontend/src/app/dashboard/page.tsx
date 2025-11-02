'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function DashboardPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [transactions, setTransactions] = useState<any[]>([])
	const [forecast, setForecast] = useState<any>(null)
	const [orgId, setOrgId] = useState('')

	useEffect(() => {
		const token = localStorage.getItem('access_token')
		if (!token) {
			router.push('/login')
			return
		}

		const storedOrgId = localStorage.getItem('org_id')
		if (storedOrgId) {
			setOrgId(storedOrgId)
			loadData(storedOrgId)
		}
	}, [router])

	const loadData = async (orgId: string) => {
		try {
			// Load transactions
			const txResponse = await api.get(`/orgs/${orgId}/transactions/`, {
				params: { limit: 10 },
			})
			setTransactions(txResponse.data.results || txResponse.data)

			// Load forecast
			try {
				const forecastResponse = await api.get(`/orgs/${orgId}/forecasts/`)
				if (forecastResponse.data.results && forecastResponse.data.results.length > 0) {
					setForecast(forecastResponse.data.results[0])
				} else if (forecastResponse.data.length > 0) {
					setForecast(forecastResponse.data[0])
				}
			} catch {
				// Forecast not available
			}
		} catch (err) {
			console.error('Failed to load data:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		localStorage.removeItem('org_id')
		router.push('/login')
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-gray-600'>Loading...</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<nav className='bg-white shadow'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16'>
						<div className='flex items-center'>
							<h1 className='text-xl font-bold text-blue-600'>FinPilot</h1>
						</div>
						<div className='flex items-center gap-4'>
							<button
								onClick={handleLogout}
								className='text-gray-600 hover:text-gray-900'
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
				<div className='px-4 py-6 sm:px-0'>
					<h2 className='text-2xl font-bold text-gray-900 mb-6'>Dashboard</h2>

					{/* KPIs */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
						<div className='bg-white p-6 rounded-lg shadow'>
							<h3 className='text-sm font-medium text-gray-500'>Cash Runway</h3>
							<p className='text-3xl font-bold text-gray-900 mt-2'>
								{forecast?.runway_days || 'N/A'} days
							</p>
						</div>
						<div className='bg-white p-6 rounded-lg shadow'>
							<h3 className='text-sm font-medium text-gray-500'>Recent Transactions</h3>
							<p className='text-3xl font-bold text-gray-900 mt-2'>
								{transactions.length}
							</p>
						</div>
						<div className='bg-white p-6 rounded-lg shadow'>
							<h3 className='text-sm font-medium text-gray-500'>Status</h3>
							<p className='text-lg font-semibold text-green-600 mt-2'>Active</p>
						</div>
					</div>

					{/* Recent Transactions */}
					<div className='bg-white shadow rounded-lg'>
						<div className='px-4 py-5 sm:p-6'>
							<h3 className='text-lg font-medium text-gray-900 mb-4'>Recent Transactions</h3>
							<div className='overflow-x-auto'>
								<table className='min-w-full divide-y divide-gray-200'>
									<thead>
										<tr>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
												Date
											</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
												Description
											</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
												Category
											</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
												Amount
											</th>
										</tr>
									</thead>
									<tbody className='bg-white divide-y divide-gray-200'>
										{transactions.length === 0 ? (
											<tr>
												<td colSpan={4} className='px-6 py-4 text-center text-gray-500'>
													No transactions yet
												</td>
											</tr>
										) : (
											transactions.map((tx) => (
												<tr key={tx.id}>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
														{new Date(tx.date).toLocaleDateString()}
													</td>
													<td className='px-6 py-4 text-sm text-gray-900'>
														{tx.description?.substring(0, 50) || 'N/A'}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
														{tx.category}
													</td>
													<td
														className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
															tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
														}`}
													>
														${Math.abs(parseFloat(tx.amount)).toFixed(2)}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

