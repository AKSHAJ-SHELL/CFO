'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Three.js component to avoid SSR issues with React 19
const Hero3DShapesInner = dynamic(() => import('@/components/3d-hero-shapes-inner'), {
	ssr: false,
	loading: () => null,
})

export default function Hero3DShapes() {
	return <Hero3DShapesInner />
}

