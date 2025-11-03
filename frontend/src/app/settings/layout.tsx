import { Shell } from '@/components/layout/shell'
import { Providers } from '@/components/providers'

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Providers>
			<Shell>{children}</Shell>
		</Providers>
	)
}

