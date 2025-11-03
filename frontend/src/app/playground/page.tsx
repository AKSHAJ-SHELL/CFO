'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Play, Loader2, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useClassify } from '@/hooks/use-api'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#5e81f4', '#81d4fa', '#f59e0b', '#ef4444', '#10b981']

interface ClassificationResult {
	description: string
	amount: number
	category: string
	confidence: number
}

export default function PlaygroundPage() {
	const [selectedModel, setSelectedModel] = useState('classifier')
	const [results, setResults] = useState<ClassificationResult[]>([])
	const [isProcessing, setIsProcessing] = useState(false)
	const [fileData, setFileData] = useState<{ description: string; amount: number }[]>([])
	
	const classifyMutation = useClassify()

	const onDrop = useCallback((acceptedFiles: File[]) => {
		acceptedFiles.forEach((file) => {
			const reader = new FileReader()
			reader.onload = () => {
				try {
					const text = reader.result as string
					const lines = text.split('\n').filter((line) => line.trim())
					const data = lines.map((line) => {
						const [description, amount] = line.split(',')
						return {
							description: description?.trim() || '',
							amount: parseFloat(amount?.trim() || '0'),
						}
					})
					setFileData(data)
				} catch (error) {
					console.error('Error parsing file:', error)
				}
			}
			reader.readAsText(file)
		})
	}, [])

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'text/csv': ['.csv'],
			'text/plain': ['.txt'],
		},
	})

	const handleRun = async () => {
		if (!fileData.length) return

		setIsProcessing(true)
		setResults([])

		try {
			const promises = fileData.map((item) =>
				classifyMutation.mutateAsync({
					description: item.description,
					amount: item.amount,
				})
			)

			const responses = await Promise.all(promises)
			const newResults: ClassificationResult[] = fileData.map((item, index) => ({
				...item,
				category: responses[index]?.category || 'Unknown',
				confidence: responses[index]?.confidence || 0,
			}))

			setResults(newResults)
		} catch (error) {
			console.error('Error classifying:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	const categoryDistribution = React.useMemo(() => {
		const counts: Record<string, number> = {}
		results.forEach((r) => {
			counts[r.category] = (counts[r.category] || 0) + 1
		})
		return Object.entries(counts).map(([name, value]) => ({ name, value }))
	}, [results])

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold font-heading">Model Playground</h1>
				<p className="text-muted-foreground">
					Test and experiment with AI models
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					{/* Model Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Select Model</CardTitle>
							<CardDescription>Choose which model to run</CardDescription>
						</CardHeader>
						<CardContent>
							<Select value={selectedModel} onValueChange={setSelectedModel}>
								<SelectTrigger>
									<SelectValue placeholder="Select a model" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="classifier">Expense Classifier</SelectItem>
									<SelectItem value="generator">Report Generator</SelectItem>
								</SelectContent>
							</Select>
						</CardContent>
					</Card>

					{/* File Upload */}
					<Card>
						<CardHeader>
							<CardTitle>Upload Data</CardTitle>
							<CardDescription>
								Drag and drop a CSV file or click to browse
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div
								{...getRootProps()}
								className={`
									border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
									transition-all duration-200
									${isDragActive
										? 'border-primary bg-primary/5 scale-[1.02]'
										: 'border-border hover:border-primary/50 hover:bg-accent/50'
									}
								`}
							>
								<input {...getInputProps()} />
								<Upload
									className={`mx-auto h-12 w-12 mb-4 ${
										isDragActive ? 'text-primary' : 'text-muted-foreground'
									}`}
								/>
								<p className="text-sm font-medium mb-2">
									{isDragActive
										? 'Drop the file here...'
										: 'Drag & drop a file here, or click to select'}
								</p>
								<p className="text-xs text-muted-foreground">
									CSV or TXT format (description, amount)
								</p>
								{fileData.length > 0 && (
									<p className="text-xs text-primary mt-2">
										{fileData.length} rows loaded
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Run Button */}
					<div>
						<Button
							onClick={handleRun}
							disabled={!fileData.length || isProcessing}
							className="w-full"
							size="lg"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Play className="mr-2 h-4 w-4" />
									Run Model
								</>
							)}
						</Button>
					</div>

					{/* Results Table */}
					{results.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card>
								<CardHeader>
									<CardTitle>Results</CardTitle>
									<CardDescription>
										Classification results from the model
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="rounded-md border border-border overflow-hidden">
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-muted">
													<tr>
														<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
															Description
														</th>
														<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
															Amount
														</th>
														<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
															Category
														</th>
														<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
															Confidence
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-border">
													{results.map((result, index) => (
														<tr
															key={index}
															className="hover:bg-accent transition-colors"
														>
															<td className="px-4 py-3 text-sm">
																{result.description}
															</td>
															<td className="px-4 py-3 text-sm font-medium">
																{formatCurrency(result.amount)}
															</td>
															<td className="px-4 py-3 text-sm">
																<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
																	{result.category}
																</span>
															</td>
															<td className="px-4 py-3 text-sm">
																{(result.confidence * 100).toFixed(1)}%
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>

				{/* Sidebar - Category Distribution */}
				<div className="space-y-6">
					{categoryDistribution.length > 0 && (
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<FileText className="h-5 w-5" />
										<span>Category Distribution</span>
									</CardTitle>
									<CardDescription>Results by category</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<PieChart>
											<Pie
												data={categoryDistribution}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name} ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : '0')}%`
												}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{categoryDistribution.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={COLORS[index % COLORS.length]}
													/>
												))}
											</Pie>
											<Tooltip />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	)
}

