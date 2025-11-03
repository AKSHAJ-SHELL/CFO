'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	FileText,
} from 'lucide-react'
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnomalies } from '@/hooks/use-api'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

const FinanceSimulationScene = dynamic(
	() => import('@/components/FinanceSimulationScene'),
	{ ssr: false }
)

// Mock data - replace with actual API calls
const runwayData = [
	{ month: 'Jan', runway: 180 },
	{ month: 'Feb', runway: 165 },
	{ month: 'Mar', runway: 150 },
	{ month: 'Apr', runway: 135 },
	{ month: 'May', runway: 120 },
	{ month: 'Jun', runway: 105 },
]

const revenueExpenseData = [
	{ month: 'Jan', revenue: 45000, expenses: 32000 },
	{ month: 'Feb', revenue: 52000, expenses: 35000 },
	{ month: 'Mar', revenue: 48000, expenses: 34000 },
	{ month: 'Apr', revenue: 55000, expenses: 36000 },
	{ month: 'May', revenue: 60000, expenses: 38000 },
	{ month: 'Jun', revenue: 58000, expenses: 37000 },
]

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
	const { data: anomalies = [] } = useAnomalies()

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-6"
		>
			<div>
				<h1 className="text-3xl font-bold font-heading">Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of your financial health
				</p>
			</div>

			{/* 3D Finance Simulation Scene */}
			<motion.div
				variants={itemVariants}
				className="rounded-lg overflow-hidden border border-border bg-card/50 backdrop-blur-xl"
			>
				<FinanceSimulationScene apiUrl="/api/finances/series" />
			</motion.div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{/* Runway & Burn Rate Card */}
				<motion.div variants={itemVariants} className="md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Cash Runway</CardTitle>
							<CardDescription>Days until cash runs out</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-baseline space-x-2 mb-4">
								<span className="text-4xl font-bold">105</span>
								<span className="text-muted-foreground">days</span>
							</div>
							<ResponsiveContainer width="100%" height={150}>
								<AreaChart data={runwayData}>
									<defs>
										<linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#5e81f4" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#5e81f4" stopOpacity={0} />
										</linearGradient>
									</defs>
									<Area
										type="monotone"
										dataKey="runway"
										stroke="#5e81f4"
										fillOpacity={1}
										fill="url(#runwayGradient)"
									/>
									<XAxis dataKey="month" />
									<YAxis />
								</AreaChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</motion.div>

				{/* Revenue Card */}
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Revenue</CardTitle>
							<TrendingUp className="h-4 w-4 text-chart-1" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(58000)}</div>
							<p className="text-xs text-muted-foreground">
								+12.5% from last month
							</p>
						</CardContent>
					</Card>
				</motion.div>

				{/* Expenses Card */}
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Expenses</CardTitle>
							<TrendingDown className="h-4 w-4 text-chart-2" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(37000)}</div>
							<p className="text-xs text-muted-foreground">
								-2.1% from last month
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Revenue vs Expenses Chart */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle>Revenue vs Expenses</CardTitle>
						<CardDescription>Monthly comparison</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={revenueExpenseData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip
									contentStyle={{
										backgroundColor: 'hsl(var(--card))',
										border: '1px solid hsl(var(--border))',
										borderRadius: '0.5rem',
									}}
								/>
								<Line
									type="monotone"
									dataKey="revenue"
									stroke="#5e81f4"
									strokeWidth={2}
									name="Revenue"
								/>
								<Line
									type="monotone"
									dataKey="expenses"
									stroke="#ef4444"
									strokeWidth={2}
									name="Expenses"
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</motion.div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Recent Anomalies */}
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<AlertTriangle className="h-5 w-5" />
								<span>Recent Anomalies</span>
							</CardTitle>
							<CardDescription>
								Unusual transactions detected
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{anomalies.slice(0, 5).map((anomaly: any) => (
									<div
										key={anomaly.id}
										className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
									>
										<div className="flex-1">
											<p className="text-sm font-medium">
												{anomaly.transaction.description}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatRelativeTime(anomaly.created_at)}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">
												{formatCurrency(anomaly.transaction.amount)}
											</p>
											<p className="text-xs text-muted-foreground">
												Score: {anomaly.score.toFixed(2)}
											</p>
										</div>
									</div>
								))}
								{anomalies.length === 0 && (
									<p className="text-sm text-muted-foreground text-center py-4">
										No anomalies detected
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Weekly Report */}
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<FileText className="h-5 w-5" />
								<span>Weekly Report</span>
							</CardTitle>
							<CardDescription>
								Latest financial summary
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4 max-h-96 overflow-y-auto">
								<div className="prose prose-invert max-w-none">
									<p className="text-sm text-muted-foreground leading-relaxed">
										Strong financial performance with revenue of $58,000 exceeding
										expenses of $37,000. Net profit of $21,000. Cash runway: 105 days.
										Key highlights include increased sales in Q2 and improved expense
										management. Recommendation: Consider reinvesting profits for growth.
									</p>
								</div>
								<div className="pt-4 border-t border-border">
									<p className="text-xs text-muted-foreground">
										Generated {formatRelativeTime(new Date().toISOString())}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</motion.div>
	)
}
