'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface ShellProps {
	children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
	return (
		<div className="min-h-screen bg-background">
			<Sidebar />
			<div className="md:pl-64">
				<Header />
				<main className="p-6">{children}</main>
			</div>
		</div>
	)
}

