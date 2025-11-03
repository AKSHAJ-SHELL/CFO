'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	LayoutDashboard,
	Database,
	Brain,
	Play,
	Settings,
	Menu,
	X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Data', href: '/data', icon: Database },
	{ name: 'Models', href: '/models', icon: Brain },
	{ name: 'Playground', href: '/playground', icon: Play },
	{ name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
	const pathname = usePathname()
	const [mobileOpen, setMobileOpen] = React.useState(false)

	return (
		<>
			<div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
				<div className="flex-1 flex flex-col min-h-0 bg-card border-r border-border">
					<div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
						<div className="flex items-center flex-shrink-0 px-4">
							<h1 className="text-2xl font-bold bg-gradient-to-r from-[#5e81f4] to-[#81d4fa] bg-clip-text text-transparent">
								FinPilot
							</h1>
						</div>
						<nav className="mt-8 flex-1 px-2 space-y-1">
							{navigation.map((item) => {
								const isActive = pathname === item.href
								return (
									<Link key={item.name} href={item.href}>
										<motion.div
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className={cn(
												'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
												isActive
													? 'bg-primary/10 text-primary'
													: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
											)}
										>
											<item.icon
												className={cn(
													'mr-3 flex-shrink-0 h-5 w-5',
													isActive
														? 'text-primary'
														: 'text-muted-foreground group-hover:text-accent-foreground'
												)}
											/>
											{item.name}
										</motion.div>
									</Link>
								)
							})}
						</nav>
					</div>
				</div>
			</div>

			{/* Mobile sidebar */}
			<div className="md:hidden">
				<Button
					variant="ghost"
					size="icon"
					className="fixed top-4 left-4 z-50"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label="Toggle menu"
				>
					{mobileOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</Button>

				<AnimatePresence>
					{mobileOpen && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
								onClick={() => setMobileOpen(false)}
							/>
							<motion.div
								initial={{ x: -300 }}
								animate={{ x: 0 }}
								exit={{ x: -300 }}
								transition={{ type: 'spring', damping: 25, stiffness: 200 }}
								className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border"
							>
								<div className="flex flex-col h-full">
									<div className="flex items-center justify-between px-4 pt-5 pb-4">
										<h1 className="text-2xl font-bold bg-gradient-to-r from-[#5e81f4] to-[#81d4fa] bg-clip-text text-transparent">
											FinPilot
										</h1>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setMobileOpen(false)}
										>
											<X className="h-6 w-6" />
										</Button>
									</div>
									<nav className="flex-1 px-2 space-y-1">
										{navigation.map((item) => {
											const isActive = pathname === item.href
											return (
												<Link
													key={item.name}
													href={item.href}
													onClick={() => setMobileOpen(false)}
												>
													<div
														className={cn(
															'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
															isActive
																? 'bg-primary/10 text-primary'
																: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
														)}
													>
														<item.icon
															className={cn(
																'mr-3 flex-shrink-0 h-5 w-5',
																isActive
																	? 'text-primary'
																	: 'text-muted-foreground group-hover:text-accent-foreground'
															)}
														/>
														{item.name}
													</div>
												</Link>
											)
										})}
									</nav>
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>
			</div>
		</>
	)
}

