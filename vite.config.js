import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	define: {
		global: 'window',
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/maplibre-gl-measures.js'),
			name: 'maplibreGLMeasures',
			formats: ['umd'],
			fileName: () => 'maplibre-gl-measures.js',
		},
		rollupOptions: {
			output: {
				exports: "named"
			}
		},
		sourcemap: true,
		outDir: 'dist',
	},
})
