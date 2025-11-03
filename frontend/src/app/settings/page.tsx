'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Building, Moon, ToggleLeft } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
	const [mockMode, setMockMode] = React.useState(false)

	return (
		<div className="space-y-6 max-w-4xl">
			<div>
				<h1 className="text-3xl font-bold font-heading">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account and preferences
				</p>
			</div>

			{/* Billing Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<CreditCard className="h-5 w-5" />
							<span>Billing</span>
						</CardTitle>
						<CardDescription>Manage your subscription and billing</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between p-4 rounded-lg border border-border">
							<div>
								<p className="font-medium">Current Plan</p>
								<p className="text-sm text-muted-foreground">
									Pro Plan - $49/month
								</p>
							</div>
							<span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#5e81f4] to-[#81d4fa] bg-clip-text text-transparent border border-primary">
								Active
							</span>
						</div>
						<Button variant="outline" className="w-full">
							Change Plan
						</Button>
					</CardContent>
				</Card>
			</motion.div>

			{/* Company Info */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Building className="h-5 w-5" />
							<span>Company Information</span>
						</CardTitle>
						<CardDescription>
							Update your company details
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="company-name">Company Name</Label>
							<Input
								id="company-name"
								placeholder="Acme Inc."
								defaultValue="Acme Inc."
							/>
						</div>
						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="contact@acme.com"
								defaultValue="contact@acme.com"
							/>
						</div>
						<div>
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								placeholder="123 Main St, City, State 12345"
								defaultValue="123 Main St, City, State 12345"
							/>
						</div>
						<Button>Save Changes</Button>
					</CardContent>
				</Card>
			</motion.div>

			{/* Preferences */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
			>
				<Card>
					<CardHeader>
						<CardTitle>Preferences</CardTitle>
						<CardDescription>
							Customize your experience
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="theme-toggle">Theme</Label>
								<p className="text-sm text-muted-foreground">
									Switch between dark and light mode
								</p>
							</div>
							<ThemeToggle />
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="mock-mode">Mock Mode</Label>
								<p className="text-sm text-muted-foreground">
									Use mock data for testing
								</p>
							</div>
							<Switch
								id="mock-mode"
								checked={mockMode}
								onCheckedChange={setMockMode}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

