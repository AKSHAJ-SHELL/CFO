import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
})

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-heading',
	weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
	title: 'FinPilot — AI CFO',
	description: 'Your business finances, on autopilot.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
