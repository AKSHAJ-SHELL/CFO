'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Filter } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/hooks/use-api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DataPage() {
	const { data: transactions = [], isLoading } = useTransactions()
	const [searchTerm, setSearchTerm] = useState('')
	const [dateRange, setDateRange] = useState({ start: '', end: '' })
	const [amountRange, setAmountRange] = useState({ min: '', max: '' })
	const [categoryFilter, setCategoryFilter] = useState('')

	const filteredTransactions = React.useMemo(() => {
		return transactions.filter((tx) => {
			if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) {
				return false
			}
			if (dateRange.start && tx.date < dateRange.start) return false
			if (dateRange.end && tx.date > dateRange.end) return false
			if (amountRange.min && tx.amount < parseFloat(amountRange.min)) return false
			if (amountRange.max && tx.amount > parseFloat(amountRange.max)) return false
			if (categoryFilter && tx.category !== categoryFilter) return false
			return true
		})
	}, [transactions, searchTerm, dateRange, amountRange, categoryFilter])

	const categories = React.useMemo(() => {
		const cats = new Set(transactions.map((tx) => tx.category))
		return Array.from(cats).sort()
	}, [transactions])

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold font-heading">Transactions</h1>
				<p className="text-muted-foreground">
					View and filter your financial data
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-4">
				{/* Filter Panel */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="lg:col-span-1"
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Filter className="h-5 w-5" />
								<span>Filters</span>
							</CardTitle>
							<CardDescription>Refine your search</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="search">Search</Label>
								<Input
									id="search"
									placeholder="Search transactions..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div>
								<Label htmlFor="date-start">Start Date</Label>
								<Input
									id="date-start"
									type="date"
									value={dateRange.start}
									onChange={(e) =>
										setDateRange({ ...dateRange, start: e.target.value })
									}
								/>
							</div>

							<div>
								<Label htmlFor="date-end">End Date</Label>
								<Input
									id="date-end"
									type="date"
									value={dateRange.end}
									onChange={(e) =>
										setDateRange({ ...dateRange, end: e.target.value })
									}
								/>
							</div>

							<div>
								<Label htmlFor="amount-min">Min Amount</Label>
								<Input
									id="amount-min"
									type="number"
									placeholder="0"
									value={amountRange.min}
									onChange={(e) =>
										setAmountRange({ ...amountRange, min: e.target.value })
									}
								/>
							</div>

							<div>
								<Label htmlFor="amount-max">Max Amount</Label>
								<Input
									id="amount-max"
									type="number"
									placeholder="100000"
									value={amountRange.max}
									onChange={(e) =>
										setAmountRange({ ...amountRange, max: e.target.value })
									}
								/>
							</div>

							<div>
								<Label htmlFor="category">Category</Label>
								<select
									id="category"
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={categoryFilter}
									onChange={(e) => setCategoryFilter(e.target.value)}
								>
									<option value="">All Categories</option>
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
							</div>

							<Button
								variant="outline"
								onClick={() => {
									setSearchTerm('')
									setDateRange({ start: '', end: '' })
									setAmountRange({ min: '', max: '' })
									setCategoryFilter('')
								}}
								className="w-full"
							>
								Clear Filters
							</Button>
						</CardContent>
					</Card>
				</motion.div>

				{/* Table */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					className="lg:col-span-3"
				>
					<Card>
						<CardHeader>
							<CardTitle>
								{filteredTransactions.length} Transaction
								{filteredTransactions.length !== 1 ? 's' : ''}
							</CardTitle>
							<CardDescription>
								All your financial transactions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="text-center py-12 text-muted-foreground">
									Loading transactions...
								</div>
							) : (
								<div className="rounded-md border border-border overflow-hidden">
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead className="bg-muted">
												<tr>
													<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
														Date
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
														Description
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
														Category
													</th>
													<th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
														Amount
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-border">
												{filteredTransactions.length > 0 ? (
													filteredTransactions.map((tx) => (
														<tr
															key={tx.id}
															className="hover:bg-accent transition-colors"
														>
															<td className="px-4 py-3 text-sm whitespace-nowrap">
																{formatDate(tx.date)}
															</td>
															<td className="px-4 py-3 text-sm">
																{tx.description}
															</td>
															<td className="px-4 py-3 text-sm">
																<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
																	{tx.category}
																</span>
															</td>
															<td className="px-4 py-3 text-sm text-right font-medium">
																{formatCurrency(tx.amount)}
															</td>
														</tr>
													))
												) : (
													<tr>
														<td
															colSpan={4}
															className="px-4 py-12 text-center text-muted-foreground"
														>
															No transactions found
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	)
}

