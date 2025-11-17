// Global type declarations for React Three Fiber
// This file ensures React Three Fiber JSX elements are recognized by TypeScript

declare global {
	namespace JSX {
		interface IntrinsicElements {
			mesh: any
			sphereGeometry: any
			boxGeometry: any
			torusGeometry: any
			meshStandardMaterial: any
			ambientLight: any
			pointLight: any
			spotLight: any
			planeGeometry: any
			[key: string]: any
		}
	}
}

export {}

