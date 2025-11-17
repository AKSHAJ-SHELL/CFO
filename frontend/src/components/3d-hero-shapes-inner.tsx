'use client'

// React Three Fiber types are declared below via module augmentation
// This component is currently disabled due to React 19 compatibility issues

import * as React from 'react'

// Type augmentation for React Three Fiber JSX elements
// Note: TypeScript language server may need to be restarted for these types to take effect
declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			mesh: any
			sphereGeometry: any
			boxGeometry: any
			torusGeometry: any
			meshStandardMaterial: any
			ambientLight: any
			pointLight: any
			[key: string]: any
		}
	}
}
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShape({ shape, position, color }: { shape: 'sphere' | 'box' | 'torus'; position: [number, number, number]; color: string }) {
	const meshRef = React.useRef<THREE.Mesh>(null)
	
	useFrame((state) => {
		if (!meshRef.current) return
		const time = state.clock.elapsedTime
		meshRef.current.rotation.x = time * 0.2
		meshRef.current.rotation.y = time * 0.3
		meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.3
	})

	const geometry = React.useMemo(() => {
		switch (shape) {
			case 'sphere':
				return <sphereGeometry args={[0.8, 32, 32]} />
			case 'box':
				return <boxGeometry args={[1, 1, 1]} />
			case 'torus':
				return <torusGeometry args={[0.6, 0.3, 16, 100]} />
			default:
				return <sphereGeometry args={[0.8, 32, 32]} />
		}
	}, [shape])

	return (
		<mesh ref={meshRef} position={position} castShadow>
			{geometry}
			<meshStandardMaterial
				color={color}
				metalness={0.6}
				roughness={0.3}
				emissive={color}
				emissiveIntensity={0.2}
			/>
		</mesh>
	)
}

function Scene({ mouse }: { mouse: { x: number; y: number } }) {
	const { camera } = useThree()
	useFrame(() => {
		camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02
		camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02
		camera.lookAt(0, 0, 0)
	})
	
	return null
}

export default function Hero3DShapesInner() {
	const [mouse, setMouse] = React.useState({ x: 0, y: 0 })

	React.useEffect(() => {
		const handler = (e: MouseEvent) => {
			setMouse({
				x: (e.clientX / window.innerWidth) * 2 - 1,
				y: (e.clientY / window.innerHeight) * 2 - 1,
			})
		}
		window.addEventListener('mousemove', handler)
		return () => window.removeEventListener('mousemove', handler)
	}, [])

	return (
		<div className="absolute inset-0 -z-10">
			<Canvas
				camera={{ position: [0, 0, 8], fov: 50 }}
				style={{ background: 'transparent' }}
			>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} intensity={0.8} />
				<pointLight position={[-10, -10, -10]} intensity={0.4} color="#9333EA" />
				
				<FloatingShape
					shape="sphere"
					position={[-3, 2, -2]}
					color="#3B82F6"
				/>
				<FloatingShape
					shape="box"
					position={[3, -1, -3]}
					color="#9333EA"
				/>
				<FloatingShape
					shape="torus"
					position={[0, 3, -4]}
					color="#14B8A6"
				/>
				<FloatingShape
					shape="sphere"
					position={[-2, -2, -5]}
					color="#3B82F6"
				/>
				<FloatingShape
					shape="box"
					position={[2, 1, -6]}
					color="#14B8A6"
				/>
				
				<Scene mouse={mouse} />
				<OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
			</Canvas>
		</div>
	)
}
