'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { HeroBackground } from '@/components/hero-background'
import { api } from '@/lib/api'

export default function SignupPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		org_name: '',
		password: '',
		password_confirm: '',
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		})
		setError('')
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		// Client-side validation
		if (formData.password !== formData.password_confirm) {
			setError('Passwords do not match')
			return
		}

		if (formData.password.length < 8) {
			setError('Password must be at least 8 characters long')
			return
		}

		setLoading(true)

		try {
			const response = await api.post('/auth/register/', {
				email: formData.email,
				password: formData.password,
				password_confirm: formData.password_confirm,
				name: formData.name,
				org_name: formData.org_name,
			})

			const { tokens, user } = response.data

			// Store tokens in localStorage
			if (tokens?.access) {
				localStorage.setItem('access_token', tokens.access)
			}
			if (tokens?.refresh) {
				localStorage.setItem('refresh_token', tokens.refresh)
			}

			// Store user data if needed
			if (user) {
				localStorage.setItem('user', JSON.stringify(user))
			}

			// Redirect to dashboard
			router.push('/dashboard')
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.error ||
				err.response?.data?.detail ||
				Object.values(err.response?.data || {}).flat()[0] ||
				'Failed to create account. Please try again.'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<HeroBackground />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative z-10 w-full max-w-md px-6"
			>
				<Card>
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-heading">Sign Up</CardTitle>
						<CardDescription>
							Create your FinPilot account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
									{error}
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="name">Your Name</Label>
								<Input
									id="name"
									placeholder="John Doe"
									value={formData.name}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={formData.email}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="org_name">Business Name</Label>
								<Input
									id="org_name"
									placeholder="Acme Inc."
									value={formData.org_name}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									value={formData.password}
									onChange={handleChange}
									required
									disabled={loading}
									minLength={8}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password_confirm">Confirm Password</Label>
								<Input
									id="password_confirm"
									type="password"
									value={formData.password_confirm}
									onChange={handleChange}
									required
									disabled={loading}
									minLength={8}
								/>
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? 'Creating account...' : 'Sign Up'}
							</Button>
							<div className="text-center text-sm text-muted-foreground">
								Already have an account?{' '}
								<Link
									href="/login"
									className="text-primary hover:underline"
								>
									Sign in
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}
