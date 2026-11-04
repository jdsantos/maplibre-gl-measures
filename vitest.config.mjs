export default {
	test: {
		environment: 'jsdom',
		// Coverage options
		coverage: {
			reporter: ['text', 'html'], // Generates both text and html reports
			include: ['src/**/*.{js,ts}'], // Files to include in coverage calculation
			exclude: ['node_modules/**'], // Exclude files from node_modules
			checkCoverage: false, // Optional: if set to true, tests will fail if coverage doesn't meet threshold
		},
	},
};
