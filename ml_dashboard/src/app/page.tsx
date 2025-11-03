'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts'

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8080'

export default function MLDashboard() {
	const [metrics, setMetrics] = useState<any[]>([])
	const [status, setStatus] = useState<any>(null)

	useEffect(() => {
		const fetchMetrics = async () => {
			try {
				const response = await axios.get(`${ML_SERVICE_URL}/status`)
				setStatus(response.data)
			} catch (err) {
				console.error('Failed to fetch status:', err)
			}
		}

		fetchMetrics()
		const interval = setInterval(fetchMetrics, 5000)
		return () => clearInterval(interval)
	}, [])

	// Mock metrics data for display
	const chartData = [
		{ epoch: 1, loss: 0.8, accuracy: 0.65 },
		{ epoch: 2, loss: 0.6, accuracy: 0.75 },
		{ epoch: 3, loss: 0.45, accuracy: 0.85 },
		{ epoch: 4, loss: 0.35, accuracy: 0.90 },
		{ epoch: 5, loss: 0.28, accuracy: 0.92 },
	]

	return (
		<div className='min-h-screen bg-gray-50 p-8'>
			<div className='max-w-7xl mx-auto'>
				<h1 className='text-3xl font-bold text-gray-900 mb-8'>
					FinPilot ML Dashboard
				</h1>

				{/* Status Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
					<div className='bg-white p-6 rounded-lg shadow'>
						<h3 className='text-lg font-semibold text-gray-700 mb-2'>
							Expense Classifier
						</h3>
						<p className='text-sm text-gray-500'>
							Status: {status?.classifier_loaded ? '✅ Loaded' : '⏳ Loading...'}
						</p>
					</div>
					<div className='bg-white p-6 rounded-lg shadow'>
						<h3 className='text-lg font-semibold text-gray-700 mb-2'>
							Report Generator
						</h3>
						<p className='text-sm text-gray-500'>
							Status: {status?.report_generator_loaded ? '✅ Loaded' : '⏳ Loading...'}
						</p>
					</div>
				</div>

				{/* Training Metrics Chart */}
				<div className='bg-white p-6 rounded-lg shadow mb-8'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>
						Training Metrics
					</h2>
					<ResponsiveContainer width='100%' height={400}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='epoch' label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line
								type='monotone'
								dataKey='loss'
								stroke='#ef4444'
								name='Loss'
								yAxisId={0}
							/>
							<Line
								type='monotone'
								dataKey='accuracy'
								stroke='#10b981'
								name='Accuracy'
								yAxisId={0}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Metrics Table */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>
						Latest Metrics
					</h2>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Epoch
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Loss
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Accuracy
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{chartData.map((row) => (
									<tr key={row.epoch}>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
											{row.epoch}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row.loss.toFixed(4)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{(row.accuracy * 100).toFixed(2)}%
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

