
![maplibre-gl-measures](https://raw.githubusercontent.com/jdsantos/maplibre-gl-measures/main/docs/screenshot.PNG)
============

## maplibre-gl-measures
A MapLibre GL JS plugin for taking length measures with lines and area measures with polygons.

It's working with [MapLibre GL JS](http://maplibre.org) inspired by the great work done by [mapbox/mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw)

## Demo

You can rush to the [demo here.](https://jdsantos.github.io/demos/maplibre-gl-measures/)


## Getting started

To use this plugin you need to run:

``` js
npm install --save maplibre-gl-measures
```

and then, in your code use it as follows:

``` js

// Import it into your code
import MeasuresControl from 'maplibre-gl-measures';

// your map logic here...

// add the plugin
map.addControl(new MeasuresControl({ /** see options below for further tunning */}), "top-left");

```

## Options

You can control the appearance, units by using the following:

``` js
options = {
            lang: {
                areaMeasurementButtonTitle: 'Measure area',
                lengthMeasurementButtonTitle: 'Measure length',
                clearMeasurementsButtonTitle:  'Clear measurements',
            },
            units: 'imperial', //or metric, the default
            unitsGroupingSeparator: ' ', // optional. use a space instead of ',' for separating thousands (3 digits group). Do not send this to use the browser default
            style: {
                text: {
                    radialOffset:  0.9,
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
                    lineColor: "#D20C0C",
                },
            }
        };

map.addControl(new MeasuresControl(options));

```

### Supported Versions

MapLibre GL JS 2.4  and later versions should be supported. Earlier versions probably won\'t work (not even tested anymore).

---

### Contributing

Any contributions to this project are more than welcome. Feel free to reach us and we will gladly include any improvements or ideas that you may have.
Please, fork this repository, make any changes and submit a Pull Request and we will get in touch!

### Contributors

| <a href="http://jdsantos.github.io" target="_blank">**Jorge Santos**</a>
|:---:|
| [![jdsantos](https://avatars1.githubusercontent.com/u/1708961?v=3&s=50)](http://jdsantos.github.io)    | 
| <a href="https://github.com/jdsantos" target="_blank">`github.com/jdsantos`</a>

### Support

The easiest way to seek support is by submiting an issue on this repo.

---