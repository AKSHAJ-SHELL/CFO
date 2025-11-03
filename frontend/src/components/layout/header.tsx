'use client'

import * as React from 'react'
import { Bell, User } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function Header() {
	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-between px-4 md:pl-64">
				<div className="flex items-center space-x-4">
					{/* Add breadcrumb or title here if needed */}
				</div>
				<div className="flex items-center space-x-4">
					<Button className="p-2" aria-label="Notifications">
						<Bell className="h-5 w-5" />
					</Button>
					<div className="flex items-center space-x-2 rounded-md border border-border px-3 py-1.5">
						<span className="text-xs font-medium bg-gradient-to-r from-[#5e81f4] to-[#81d4fa] bg-clip-text text-transparent">
							Pro
						</span>
					</div>
					<Button className="p-2" aria-label="User profile">
						<User className="h-5 w-5" />
					</Button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	)
}

