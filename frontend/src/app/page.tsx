'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
	const router = useRouter()

	useEffect(() => {
		// Check if user is logged in
		const token = localStorage.getItem('access_token')
		if (token) {
			router.push('/dashboard')
		}
	}, [router])

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
			<div className='max-w-4xl mx-auto px-4 py-16 text-center'>
				<h1 className='text-5xl font-bold text-gray-900 mb-4'>
					FinPilot
				</h1>
				<p className='text-xl text-gray-600 mb-2'>
					Your business finances, on autopilot.
				</p>
				<p className='text-gray-500 mb-8'>
					AI-powered financial management for small business owners
				</p>
				<div className='flex gap-4 justify-center'>
					<Link
						href='/signup'
						className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
					>
						Get Started
					</Link>
					<Link
						href='/login'
						className='px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition'
					>
						Sign In
					</Link>
				</div>
			</div>
		</div>
	)
}
