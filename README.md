# maplibre-gl-measures

![maplibre-gl-measures](https://raw.githubusercontent.com/jdsantos/maplibre-gl-measures/main/docs/screenshot.PNG)

[![npm version](https://badge.fury.io/js/maplibre-gl-measures.svg)](https://badge.fury.io/js/maplibre-gl-measures)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/github/actions/workflow/status/jdsantos/maplibre-gl-measures/tests.yml?label=tests&style=round-square)](https://github.com/jdsantos/maplibre-gl-measures/actions?query=workflow%3ATests)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

A MapLibre GL JS plugin for taking length measurements with lines and area measurements with polygons.

This plugin works with [MapLibre GL JS](http://maplibre.org) and is inspired by the great work done by [mapbox/mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw).

## Features

- **Line Length Measurement**: Draw lines to measure distances
- **Area Measurement**: Draw polygons to measure areas
- **Multiple Unit Systems**: Support for both metric and imperial units
- **Customizable Units**: Fixed units for length (mm, cm, m, km, in, ft, yd, mi) and area (mm², cm², m², km², ha, in², ft², yd², ac, mi²)
- **Flexible Formatting**: Control number formatting with custom grouping separators and precision
- **Styling Options**: Full customization of colors, line widths, fill opacity, and text styles
- **Event Callbacks**: `onRender` and `onCreate` callbacks for handling drawn features
- **TypeScript Support**: Full TypeScript definitions included
- **Easy Integration**: Simple control that integrates seamlessly with MapLibre GL JS

## Demo

Try the live demo here: [https://jdsantos.github.io/demos/maplibre-gl-measures/](https://jdsantos.github.io/demos/maplibre-gl-measures/)

## Installation

### npm

```bash
npm install --save maplibre-gl-measures
```

### yarn

```bash
yarn add maplibre-gl-measures
```

### CDN

```html
<script src="https://unpkg.com/maplibre-gl-measures@latest/dist/maplibre-gl-measures.js"></script>
```

## Getting Started

### Basic Usage

```javascript
import MeasuresControl from 'maplibre-gl-measures';

// Initialize your map
const map = new maplibregl.Map({
	container: 'map',
	style: 'your-style-url',
	center: [0, 0],
	zoom: 2,
});

// Add the measures control
map.addControl(new MeasuresControl(), 'top-left');
```

### With Custom Options

```javascript
map.addControl(
	new MeasuresControl({
		lang: {
			areaMeasurementButtonTitle: 'Measure area',
			lengthMeasurementButtonTitle: 'Measure length',
			clearMeasurementsButtonTitle: 'Clear measurements',
		},
		units: 'metric',
		fixedLengthUnit: 'm',
		fixedAreaUnit: 'm2',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		unitsGroupingSeparator: ' ',
		showOnlyTotalLineLength: true,
		style: {
			text: {
				radialOffset: 0.9,
				letterSpacing: 0.05,
				color: '#D20C0C',
				haloColor: '#fff',
				haloWidth: 0,
				font: 'Klokantech Noto Sans Bold',
			},
			common: {
				midPointRadius: 3,
				midPointColor: '#D20C0C',
				midPointHaloRadius: 5,
				midPointHaloColor: '#FFF',
			},
			areaMeasurement: {
				fillColor: '#D20C0C',
				fillOutlineColor: '#D20C0C',
				fillOpacity: 0.01,
				lineWidth: 2,
			},
			lengthMeasurement: {
				lineWidth: 2,
				lineColor: '#D20C0C',
			},
		},
	}),
	'top-left',
);
```

### Using Event Callbacks

```javascript
const measuresControl = new MeasuresControl({
	onRender: (features) => {
		console.log('Features rendered:', features);
		// Handle render events
	},
	onCreate: (features) => {
		console.log('Features created:', features);
		// Handle creation events
	},
});

map.addControl(measuresControl, 'top-left');
```

## API Reference

### Options

| Option                                   | Type                     | Default                       | Description                                                                                         |
| ---------------------------------------- | ------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `lang`                                   | `object`                 | `{}`                          | Localization options for button titles                                                              |
| `lang.areaMeasurementButtonTitle`        | `string`                 | `''`                          | Title for area measurement button                                                                   |
| `lang.lengthMeasurementButtonTitle`      | `string`                 | `''`                          | Title for length measurement button                                                                 |
| `lang.clearMeasurementsButtonTitle`      | `string`                 | `''`                          | Title for clear measurements button                                                                 |
| `units`                                  | `'metric' \| 'imperial'` | `'metric'`                    | Unit system to use                                                                                  |
| `unitsGroupingSeparator`                 | `string`                 | `undefined`                   | Separator for number grouping (e.g., space instead of comma)                                        |
| `minimumFractionDigits`                  | `number`                 | `2`                           | Minimum number of decimal places to display                                                         |
| `maximumFractionDigits`                  | `number`                 | `2`                           | Maximum number of decimal places to display                                                         |
| `fixedLengthUnit`                        | `string`                 | `undefined`                   | Fixed unit for length measurements: `mm`, `cm`, `m`, `km`, `in`, `ft`, `yd`, `mi`                   |
| `fixedAreaUnit`                          | `string`                 | `undefined`                   | Fixed unit for area measurements: `mm2`, `cm2`, `m2`, `km2`, `ha`, `in2`, `ft2`, `yd2`, `ac`, `mi2` |
| `showOnlyTotalLineLength`                | `boolean`                | `true`                        | Show only total line length instead of each segment length                                          |
| `style`                                  | `object`                 | `{}`                          | Styling options for measurements                                                                    |
| `style.text`                             | `object`                 | `{}`                          | Text styling options                                                                                |
| `style.text.radialOffset`                | `number`                 | `0.5`                         | Radial offset for text labels                                                                       |
| `style.text.letterSpacing`               | `number`                 | `0.05`                        | Letter spacing for text labels                                                                      |
| `style.text.color`                       | `string`                 | `'#D20C0C'`                   | Color of text labels                                                                                |
| `style.text.haloColor`                   | `string`                 | `'#fff'`                      | Halo color of text labels                                                                           |
| `style.text.haloWidth`                   | `number`                 | `10`                          | Halo width of text labels                                                                           |
| `style.text.font`                        | `string`                 | `'Klokantech Noto Sans Bold'` | Font family for text labels                                                                         |
| `style.common`                           | `object`                 | `{}`                          | Common styling options                                                                              |
| `style.common.midPointRadius`            | `number`                 | `3`                           | Radius of mid-point circles                                                                         |
| `style.common.midPointColor`             | `string`                 | `'#fbb03b'`                   | Color of mid-point circles                                                                          |
| `style.common.midPointHaloRadius`        | `number`                 | `3`                           | Halo radius of mid-point circles                                                                    |
| `style.common.midPointHaloColor`         | `string`                 | `'#FFF'`                      | Halo color of mid-point circles                                                                     |
| `style.areaMeasurement`                  | `object`                 | `{}`                          | Area measurement styling options                                                                    |
| `style.areaMeasurement.fillColor`        | `string`                 | `'#D20C0C'`                   | Fill color for polygons                                                                             |
| `style.areaMeasurement.fillOutlineColor` | `string`                 | `'#D20C0C'`                   | Outline color for polygons                                                                          |
| `style.areaMeasurement.fillOpacity`      | `number`                 | `0.1`                         | Fill opacity for polygons                                                                           |
| `style.areaMeasurement.lineWidth`        | `number`                 | `2`                           | Line width for polygon outlines                                                                     |
| `style.lengthMeasurement`                | `object`                 | `{}`                          | Length measurement styling options                                                                  |
| `style.lengthMeasurement.lineWidth`      | `number`                 | `2`                           | Line width for lines                                                                                |
| `style.lengthMeasurement.lineColor`      | `string`                 | `'#D20C0C'`                   | Color of lines                                                                                      |
| `onRender`                               | `function`               | `undefined`                   | Callback function called when features are rendered                                                 |
| `onCreate`                               | `function`               | `undefined`                   | Callback function called when features are created                                                  |

### Methods

| Method       | Returns       | Description                      |
| ------------ | ------------- | -------------------------------- |
| `onAdd(map)` | `HTMLElement` | Adds the control to the map      |
| `onRemove()` | `void`        | Removes the control from the map |

## TypeScript Support

This package includes TypeScript definitions. Import with type safety:

```typescript
import MeasuresControl, { MeasuresControlOptions } from 'maplibre-gl-measures';

const options: MeasuresControlOptions = {
	units: 'metric',
	fixedLengthUnit: 'm',
	fixedAreaUnit: 'm2',
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
	style: {
		text: {
			color: '#FF0000',
		},
	},
};

const control = new MeasuresControl(options);
map.addControl(control, 'top-left');
```

## Examples

### Metric Units with Meters and Square Meters

```javascript
const control = new MeasuresControl({
	units: 'metric',
	fixedLengthUnit: 'm',
	fixedAreaUnit: 'm2',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});
```

### Imperial Units with Feet and Acres

```javascript
const control = new MeasuresControl({
	units: 'imperial',
	fixedLengthUnit: 'ft',
	fixedAreaUnit: 'ac',
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});
```

### Custom Styling

```javascript
const control = new MeasuresControl({
	style: {
		text: {
			color: '#2E7D32',
			haloColor: '#FFFFFF',
			haloWidth: 5,
			font: 'Roboto Medium',
		},
		areaMeasurement: {
			fillColor: '#4CAF50',
			fillOutlineColor: '#2E7D32',
			fillOpacity: 0.2,
			lineWidth: 3,
		},
		lengthMeasurement: {
			lineWidth: 3,
			lineColor: '#2E7D32',
		},
	},
});
```

### Spanish Localization

```javascript
const control = new MeasuresControl({
	lang: {
		areaMeasurementButtonTitle: 'Medir área',
		lengthMeasurementButtonTitle: 'Medir longitud',
		clearMeasurementsButtonTitle: 'Limpiar mediciones',
	},
});
```

## Dependencies

This plugin depends on the following libraries:

- [@mapbox/mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw) - Drawing functionality
- [@turf/turf](https://github.com/Turfjs/turf) - Geospatial analysis and measurements
- maplibre-gl (peer dependency) - Core mapping library

## Supported Versions

- MapLibre GL JS 2.4 and later versions
- Earlier versions are not supported and have not been tested

## Browser Support

This plugin supports all modern browsers that support MapLibre GL JS:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
```

## Contributors

| <a href="http://jdsantos.github.io" target="_blank">**Jorge Santos**</a>
|:---:|
| [![jdsantos](https://avatars1.githubusercontent.com/u/1708961?v=3&s=50)](http://jdsantos.github.io)    | 
| <a href="https://github.com/jdsantos" target="_blank">`github.com/jdsantos`</a>

Inspired by the excellent work of the Mapbox team on [mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw).

## Related Libraries

- [mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw) - A drawing component for Mapbox GL JS
- [@turf/turf](https://github.com/Turfjs/turf) - Advanced geospatial analysis
- [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) - Open-source fork of Mapbox GL JS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

The easiest way to seek support is by submitting an issue on [GitHub Issues](https://github.com/jdsantos/maplibre-gl-measures/issues).

---

Made with ❤️ for the open-source mapping community
