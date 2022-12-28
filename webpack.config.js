const path = require('path');

module.exports = {
    entry: './src/maplibre-gl-measures.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'maplibre-gl-measures.js',
        library: "maplibreGLMeasures",
    },
    devtool: 'source-map',
};