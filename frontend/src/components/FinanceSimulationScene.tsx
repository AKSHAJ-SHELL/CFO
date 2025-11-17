'use client'

// @ts-nocheck
// TypeScript errors suppressed - React Three Fiber types are declared in src/types/r3f.d.ts
// Component wrapped with client-side mount check to avoid React 19 compatibility issues

/// <reference path="../types/r3f.d.ts" />

import React, {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { useQuery } from '@tanstack/react-query'
import { useWindowSize } from 'react-use'

/**
 * FinanceSimulationScene
 *
 * Props:
 * - apiUrl?: string - optional API endpoint to fetch financial time series
 *
 * It expects the API (if provided) to return:
 * {
 *   series: [{ date: "2025-11-01", balance: 10234.5, is_anomaly: false }, ...],
 *   meta: { currency: "USD" }
 * }
 *
 * If apiUrl is not provided or fetch fails, the component uses mocked data.
 */

type Point = {
	date: string
	balance: number
	is_anomaly?: boolean
	note?: string
}

type FinancialPayload = {
	series: Point[]
	meta?: { currency?: string }
}

const MOCK_POINTS = (() => {
	// create 30 days of mock balances with a spike anomaly
	const arr: Point[] = []
	let base = 10000
	for (let i = 0; i < 30; i++) {
		const noise = Math.sin(i / 3) * 400 + (Math.random() - 0.5) * 200
		base = Math.max(2000, base + noise)
		arr.push({
			date: new Date(
				Date.now() - (29 - i) * 24 * 60 * 60 * 1000
			)
				.toISOString()
				.slice(0, 10),
			balance: Math.round(base),
			is_anomaly: i === 12 || i === 22 ? true : false,
			note:
				i === 12
					? 'One-time vendor expense'
					: i === 22
						? 'Refund surge'
						: undefined,
		})
	}
	return arr
})()

const fetchFinancialData = async (
	apiUrl?: string
): Promise<FinancialPayload> => {
	if (!apiUrl) return { series: MOCK_POINTS, meta: { currency: 'USD' } }
	const res = await fetch(apiUrl, { credentials: 'include' })
	if (!res.ok) throw new Error('Failed to fetch financial data')
	return res.json()
}

/* -------------------------------
   Helper hooks & utils
---------------------------------*/
const usePrefersReducedMotion = () => {
	const [reduced, setReduced] = useState(false)
	useEffect(() => {
		const q = window.matchMedia?.('(prefers-reduced-motion: reduce)')
		if (!q) return
		const cb = () => setReduced(q.matches)
		cb()
		q.addEventListener?.('change', cb)
		return () => q.removeEventListener?.('change', cb)
	}, [])
	return reduced
}

const clamp = (v: number, a = -Infinity, b = Infinity) =>
	Math.max(a, Math.min(b, v))

/* -------------------------------
   Bars (instanced mesh)
---------------------------------*/
type BarsProps = {
	points: Point[]
	maxHeight?: number
	spacing?: number
	onHover?: (index: number | null, data?: Point) => void
}

function Bars({ points, maxHeight = 6, spacing = 0.9, onHover }: BarsProps) {
	const ref = useRef<THREE.InstancedMesh>(null)
	const temp = new THREE.Object3D()
	const colorOn = new THREE.Color('#14B8A6') // green
	const colorOff = new THREE.Color('#374151') // slate
	const anomalyColor = new THREE.Color('#ef4444') // red

	const balances = points.map((p) => p.balance)
	const minB = Math.min(...balances)
	const maxB = Math.max(...balances)

	// compute heights normalized
	const heights = points.map((p) => {
		const norm = (p.balance - minB) / (maxB - minB || 1)
		return 0.6 + norm * maxHeight
	})

	useEffect(() => {
		if (!ref.current) return
		points.forEach((p, i) => {
			const h = heights[i]
			const x = (i - points.length / 2) * spacing
			temp.position.set(x, h / 2, 0)
			temp.scale.set(0.6, h, 0.6)
			temp.updateMatrix()
			ref.current!.setMatrixAt(i, temp.matrix)
			// color via instance color attribute
			const color = p.is_anomaly
				? anomalyColor
				: colorOn.lerp(colorOff, 0.6 - (h / maxHeight) * 0.4)
			ref.current!.setColorAt(i, color)
		})
		ref.current.instanceMatrix.needsUpdate = true
		if ((ref.current.material as any).vertexColors)
			;(ref.current.material as any).vertexColors = true
	}, [points, heights, maxHeight, spacing])

	// raycast + hover
	const handlePointerMove = useCallback(
		(e: THREE.Event) => {
			e.stopPropagation()
			const instanceId = (e as any).instanceId as number | undefined
			if (instanceId !== undefined)
				onHover?.(instanceId, points[instanceId])
		},
		[onHover, points]
	)

	const handlePointerOut = useCallback(() => onHover?.(null), [onHover])

	return (
		<instancedMesh
			ref={ref}
			args={[
				undefined as unknown as THREE.BufferGeometry,
				undefined as unknown as THREE.Material,
				points.length,
			]}
			onPointerMove={handlePointerMove}
			onPointerOut={handlePointerOut}
			castShadow
			receiveShadow
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial
				color="#60a5fa"
				metalness={0.2}
				roughness={0.6}
			/>
		</instancedMesh>
	)
}

/* -------------------------------
   Flowing Wave (sine surface)
---------------------------------*/
function CashFlowWave({
	points,
	width = 20,
	depth = 4,
}: {
	points: Point[]
	width?: number
	depth?: number
}) {
	// create a simple plane geometry and displace vertices based on balances
	const meshRef = useRef<THREE.Mesh>(null)
	const geomRef = useRef<THREE.BufferGeometry | null>(null)
	const balances = points.map((p) => p.balance)
	const minB = Math.min(...balances)
	const maxB = Math.max(...balances || [1])
	const normalized = balances.map((b) => (b - minB) / (maxB - minB || 1))

	useEffect(() => {
		const cols = Math.max(16, points.length)
		const rows = 6
		const geometry = new THREE.PlaneGeometry(width, depth, cols - 1, rows - 1)
		const pos = geometry.attributes.position as THREE.BufferAttribute

		// map x coordinate to index
		for (let i = 0; i < cols; i++) {
			const h =
				normalized[
					Math.floor((i / (cols - 1)) * (normalized.length - 1))
				] ?? 0
			for (let j = 0; j < rows; j++) {
				const idx = (j * cols + i) * 3 + 2 // z-axis / y depending on plane orientation
				// displace z by h
				pos.array[idx] = h * 1.8 // amplitude
			}
		}
		pos.needsUpdate = true
		geometry.computeVertexNormals()
		geomRef.current = geometry
		if (meshRef.current) meshRef.current.geometry = geometry
	}, [points, normalized, width, depth])

	useFrame((state, delta) => {
		if (!geomRef.current) return
		const pos = geomRef.current.attributes.position as THREE.BufferAttribute
		const time = state.clock.elapsedTime
		// add a small oscillation to create the flowing effect
		for (let i = 2; i < pos.array.length; i += 3) {
			pos.array[i] = pos.array[i] + Math.sin(time + i * 0.001) * 0.002
		}
		pos.needsUpdate = true
	})

	return (
		<mesh
			ref={meshRef}
			rotation={[-Math.PI / 2, 0, 0]}
			position={[0, 0.2, 0]}
		>
			<bufferGeometry attach="geometry" />
			<meshStandardMaterial
				color="#0ea5a4"
				metalness={0.2}
				roughness={0.8}
				transparent
				opacity={0.16}
				side={THREE.DoubleSide}
			/>
		</mesh>
	)
}

/* -------------------------------
   Particles for anomalies
---------------------------------*/
function AnomalyParticles({ points }: { points: Point[] }) {
	const particlesRef = useRef<THREE.Points>(null)
	const [positions, setPositions] = useState<Float32Array | null>(null)

	useEffect(() => {
		const anomalies = points
			.map((p, idx) => ({ p, idx }))
			.filter((x) => x.p.is_anomaly)
			.map((x, i) => {
				const xPos = (x.idx - points.length / 2) * 0.9
				const yPos = 1.5 + Math.random() * 2.0
				const zPos = (Math.random() - 0.5) * 0.5
				return [xPos, yPos, zPos]
			})
		if (anomalies.length === 0) {
			setPositions(null)
		} else {
			const arr = new Float32Array(anomalies.length * 3)
			anomalies.forEach((pos, i) => {
				arr[i * 3 + 0] = pos[0]
				arr[i * 3 + 1] = pos[1]
				arr[i * 3 + 2] = pos[2]
			})
			setPositions(arr)
		}
	}, [points])

	useFrame((state) => {
		if (!particlesRef.current || !positions) return
		const t = state.clock.elapsedTime
		// animate y coordinate gently
		const posAttr = particlesRef.current.geometry.attributes
			.position as THREE.BufferAttribute
		for (let i = 0; i < positions.length / 3; i++) {
			const baseY = positions[i * 3 + 1]
			posAttr.array[i * 3 + 1] = baseY + Math.sin(t * 2 + i) * 0.25
		}
		posAttr.needsUpdate = true
	})

	if (!positions) return null

	return (
		<points ref={particlesRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					array={positions}
					count={positions.length / 3}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				attach="material"
				size={0.12}
				color={'#ffb347'}
				sizeAttenuation
			/>
		</points>
	)
}

/* -------------------------------
   Camera parallax + hover tooltip
---------------------------------*/
function SceneControls({
	mouse,
}: {
	mouse: { x: number; y: number }
}) {
	const { camera } = useThree()
	useFrame(() => {
		// subtle camera follow for parallax
		camera.position.x += (mouse.x * 2 - camera.position.x) * 0.04
		camera.position.y += (-mouse.y * 1.2 - camera.position.y) * 0.04
		camera.lookAt(0, 0, 0)
	})
	return null
}

/* -------------------------------
   Top-level Scene component
---------------------------------*/
export default function FinanceSimulationScene({
	apiUrl,
}: {
	apiUrl?: string
}) {
	const [mounted, setMounted] = useState(false)
	const reducedMotion = usePrefersReducedMotion()
	const { width } = useWindowSize()

	// Ensure component only renders on client side
	useEffect(() => {
		setMounted(true)
	}, [])

	// fetch series with react-query (cache + refetch)
	const { data, isLoading, error } = useQuery<FinancialPayload, Error>({
		queryKey: ['fin-data', apiUrl || 'mock'],
		queryFn: () => fetchFinancialData(apiUrl),
		staleTime: 5 * 60 * 1000,
		retry: 1,
		enabled: mounted,
	})

	// mouse position for parallax (normalized) - MUST be before early return
	const mouse = useRef({ x: 0, y: 0 })
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
			mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
		}
		window.addEventListener('mousemove', handler)
		return () => window.removeEventListener('mousemove', handler)
	}, [])

	// tooltip state - MUST be before early return
	const [hoverInfo, setHoverInfo] = useState<{
		idx: number
		point: Point
		screenX: number
		screenY: number
	} | null>(null)

	const points = data?.series ?? MOCK_POINTS

	const handleHover = useCallback(
		(idx: number | null, dataPoint?: Point) => {
			if (idx === null) {
				setHoverInfo(null)
				return
			}
			// compute approximate screen position for tooltip (basic)
			const screenX =
				window.innerWidth / 2 +
				((idx - points.length / 2) * 0.9) * (width / 1600)
			const screenY = window.innerHeight / 2
			setHoverInfo({
				idx,
				point: dataPoint as Point,
				screenX,
				screenY,
			})
		},
		[points.length, width]
	)

	// compute suggested camera distance based on width
	const cameraZ = width > 1200 ? 18 : width > 800 ? 22 : 30

	// Don't render Canvas until mounted on client
	if (!mounted) {
		return (
			<div className="relative w-full h-[500px] bg-card/50 rounded-lg flex items-center justify-center">
				<div className="text-muted-foreground">Loading 3D simulation...</div>
			</div>
		)
	}

	return (
		<div
			style={{
				width: '100%',
				height: '640px',
				position: 'relative',
			}}
		>
			<Suspense
				fallback={
					<div className="absolute inset-0 flex items-center justify-center text-white">
						Loading scene...
					</div>
				}
			>
				<Canvas
					shadows
					camera={{ position: [0, 6, cameraZ], fov: 45 }}
				>
					<ambientLight intensity={0.6} />
					<spotLight position={[10, 30, 20]} intensity={0.6} />
					<pointLight position={[-20, 10, -10]} intensity={0.2} />
					<group position={[0, 0, 0]}>
						{/* 3D background floor grid */}
						<mesh
							rotation={[-Math.PI / 2, 0, 0]}
							position={[0, -0.01, 0]}
						>
							<planeGeometry args={[80, 80, 1, 1]} />
							<meshStandardMaterial
								color="#020617"
								roughness={1}
								metalness={0}
							/>
						</mesh>

						{/* Bars */}
						<Bars points={points} onHover={handleHover} />

						{/* Wave */}
						<CashFlowWave
							points={points}
							width={Math.max(30, points.length * 0.9)}
							depth={6}
						/>

						{/* Particles for anomalies */}
						<AnomalyParticles points={points} />

						{/* subtle float for visual interest */}
						<group position={[0, 0.05, 0]}>
							{/* placeholder for small decorative object */}
						</group>
					</group>

					{/* Orbit controls for inspect (disabled rotate to keep gentle motion) */}
					<OrbitControls
						enablePan={true}
						enableRotate={false}
						enableZoom={true}
					/>
					<SceneControls mouse={mouse.current} />
					<Preload all />
				</Canvas>
			</Suspense>

			{/* HTML overlay tooltip */}
			{hoverInfo && (
				<div
					style={{
						position: 'absolute',
						left: Math.round(hoverInfo.screenX),
						top: Math.round(hoverInfo.screenY - 80),
						transform: 'translate(-50%, -100%)',
						pointerEvents: 'none',
						background:
							'linear-gradient(180deg, rgba(8,13,23,0.96), rgba(12,16,26,0.82))',
						padding: '10px 14px',
						borderRadius: 12,
						border: '1px solid rgba(255,255,255,0.06)',
						boxShadow: '0 6px 24px rgba(2,6,23,0.6)',
						color: '#E5E7EB',
						minWidth: 180,
						zIndex: 40,
					}}
				>
					<div style={{ fontSize: 13, color: '#9CA3AF' }}>
						{hoverInfo.point.date}
					</div>
					<div style={{ fontSize: 18, fontWeight: 700 }}>
						{hoverInfo.point.balance.toLocaleString()}
					</div>
					{hoverInfo.point.is_anomaly && (
						<div
							style={{
								marginTop: 6,
								color: '#FCA5A5',
								fontSize: 13,
							}}
						>
							Anomaly: {hoverInfo.point.note ?? 'investigate'}
						</div>
					)}
				</div>
			)}

			{/* bottom-left legend */}
			<div
				style={{
					position: 'absolute',
					left: 18,
					bottom: 16,
					color: '#cbd5e1',
					fontSize: 13,
					zIndex: 30,
				}}
			>
				<div>
					3D Finances Simulation • {data?.meta?.currency ?? 'USD'}
				</div>
			</div>
		</div>
	)
}

