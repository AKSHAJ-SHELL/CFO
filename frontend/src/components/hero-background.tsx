'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

export function HeroBackground() {
	return (
		<div className="absolute inset-0 overflow-hidden -z-10">
			{/* Gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1b] via-[#1a1f2e] to-[#0a0f1b]" />
			
			{/* Animated shapes */}
			<motion.div
				className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#5e81f4]/20 to-[#81d4fa]/20 rounded-full blur-3xl"
				animate={{
					x: [0, 100, 0],
					y: [0, -50, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>
			<motion.div
				className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-[#81d4fa]/20 to-[#5e81f4]/20 rounded-full blur-3xl"
				animate={{
					x: [0, -100, 0],
					y: [0, 50, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>
			
			{/* Grid pattern */}
			<div
				className="absolute inset-0 opacity-20"
				style={{
					backgroundImage: `
						linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
					`,
					backgroundSize: '50px 50px',
				}}
			/>
		</div>
	)
}

