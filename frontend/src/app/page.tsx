'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HeroBackground } from '@/components/hero-background'

const Hero3DShapes = dynamic(() => import('@/components/3d-hero-shapes'), {
	ssr: false,
})

export default function HomePage() {
	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<HeroBackground />
			<Hero3DShapes />
			
			<div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-6xl md:text-7xl lg:text-8xl font-heading font-bold mb-6"
				>
					<span className="gradient-text">
						Your business finances,
					</span>
					<br />
					<span className="text-foreground">reimagined.</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
				>
					FinPilot — AI CFO for small business owners.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="flex items-center justify-center gap-4"
				>
					<Link href="/dashboard">
						<Button size="lg" className="group">
							Try FinPilot
							<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
					<Link href="/dashboard">
						<Button size="lg" variant="outline" className="group">
							Live Demo
						</Button>
					</Link>
				</motion.div>

				{/* Floating shape decoration */}
				<motion.div
					className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-[#5e81f4]/30 to-[#81d4fa]/30 rounded-full blur-3xl float-animation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 0.6 }}
				/>
			</div>
		</div>
	)
}
