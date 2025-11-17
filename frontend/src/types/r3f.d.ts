// Type declarations for React Three Fiber JSX elements
// These extend the global JSX namespace to recognize React Three Fiber elements

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
			[key: string]: any
		}
	}
}

export {}
