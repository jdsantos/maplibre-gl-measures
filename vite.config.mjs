import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
				exports: 'named',
			},
		},
		sourcemap: true,
		outDir: 'dist',
	},
});
