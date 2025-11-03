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

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await api.post('/auth/login/', {
				email,
				password,
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
			setError(
				err.response?.data?.error ||
					err.response?.data?.detail ||
					'Failed to sign in. Please check your credentials.'
			)
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
						<CardTitle className="text-2xl font-heading">
							Sign In
						</CardTitle>
						<CardDescription>Welcome back to FinPilot</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
									{error}
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={loading}
								/>
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? 'Signing in...' : 'Sign In'}
							</Button>
							<div className="text-center text-sm text-muted-foreground">
								Don't have an account?{' '}
								<Link
									href="/signup"
									className="text-primary hover:underline"
								>
									Sign up
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}
