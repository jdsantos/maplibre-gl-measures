import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

import * as convert from "convert-units";

const DRAW_LABELS_SOURCE_ID = "source-draw-labels";
const DRAW_LABELS_LAYER_ID = "layer-draw-labels";
const SOURCE_DATA = {
  type: "FeatureCollection",
  features: [],
};
export default class MeasuresControl {
  constructor(options) {
    this.options = options;
    this._numberFormattingOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: "always",
    };
    this._drawCtrl = new MapboxDraw({
      displayControlsDefault: false,
      styles: [
        // ACTIVE (being drawn)
        // line stroke
        {
          id: "gl-draw-line",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color":
              this.options?.style?.lengthMeasurement?.lineColor ?? "#D20C0C",
            "line-dasharray": [0.2, 2],
            "line-width":
              this.options?.style?.lengthMeasurement?.lineWidth ?? 2,
          },
        },
        // polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color":
              this.options?.style?.areaMeasurement?.fillColor ?? "#D20C0C",
            "fill-outline-color":
              this.options?.style?.areaMeasurement?.fillOutlineColor ??
              "#D20C0C",
            "fill-opacity":
              this.options?.style?.areaMeasurement?.fillOpacity ?? 0.1,
          },
        },
        // polygon mid points
        {
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: {
            "circle-radius": this.options?.style?.common?.midPointRadius ?? 3,
            "circle-color":
              this.options?.style?.common?.midPointColor ?? "#fbb03b",
          },
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color":
              this.options?.style?.areaMeasurement?.fillOutlineColor ??
              "#D20C0C",
            "line-dasharray": [0.2, 2],
            "line-width": this.options?.style?.areaMeasurement?.lineWidth ?? 2,
          },
        },
        // vertex point halos
        {
          id: "gl-draw-polygon-and-line-vertex-halo-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius":
              this.options?.style?.common?.midPointHaloRadius ?? 3,
            "circle-color":
              this.options?.style?.common?.midPointHaloColor ?? "#FFF",
          },
        },
        // vertex points
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": this.options?.style?.common?.midPointRadius ?? 3,
            "circle-color":
              this.options?.style?.common?.midPointColor ?? "#fbb03b",
          },
        },

        // INACTIVE (static, already drawn)
        // line stroke
        {
          id: "gl-draw-line-static",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["==", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color":
              this.options?.style?.lengthMeasurement?.lineColor ?? "#D20C0C",
            "line-width":
              this.options?.style?.lengthMeasurement?.lineWidth ?? 3,
          },
        },
        // polygon fill
        {
          id: "gl-draw-polygon-fill-static",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          paint: {
            "fill-color":
              this.options?.style?.areaMeasurement?.fillColor ?? "#000",
            "fill-outline-color":
              this.options?.style?.areaMeasurement?.fillOutlineColor ?? "#000",
            "fill-opacity":
              this.options?.style?.areaMeasurement?.fillOpacity ?? 0.1,
          },
        },
        // polygon outline
        {
          id: "gl-draw-polygon-stroke-static",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color":
              this.options?.style?.areaMeasurement?.fillOutlineColor ?? "#000",
            "line-width": this.options?.style?.areaMeasurement?.lineWidth ?? 2,
          },
        },
      ],
    });
  }

  onAdd(map) {
    this._map = map;
    this._map.addControl(this._drawCtrl, "top-left");
    this._initControl();
    this._registerEvents();
    return this._container;
  }

  _initControl() {
    this._container = document.createElement("div");
    this._container.className =
      "maplibregl-ctrl mapboxgl-ctrl maplibregl-measures maplibregl-ctrl-group mapboxgl-ctrl-group";

    this.initDrawBtn(this._drawCtrl.modes.DRAW_LINE_STRING);
    this.initDrawBtn(this._drawCtrl.modes.DRAW_POLYGON);
    this.initClearBtn();
  }

  _formatMeasure(dist, isAreaMeasurement = false) {
    if (this.options?.units == "imperial") {
      return isAreaMeasurement
        ? this._formatAreaToImperialSystem(dist)
        : this._formatToImperialSystem(dist);
    } else {
      return isAreaMeasurement
        ? this._formatAreaToMetricSystem(dist)
        : this._formatToMetricSystem(dist);
    }
  }

  // area in sqm
  _formatAreaToMetricSystem(dist) {
    let measure = convert(dist).from("m2").toBest({ system: "metric" });
    let unit = measure.unit.replaceAll("2", "²");
    let val = this._getLocaleNumber(measure.val);
    return `${val} ${unit}`;
  }

  // area in sqm
  _formatAreaToImperialSystem(dist) {
    let measure = convert(dist).from("m2").to("mi2");
    measure = convert(measure).from("mi2").toBest({ system: "imperial" });
    let unit = measure.unit.replaceAll("2", "²");
    let val = this._getLocaleNumber(measure.val);
    return `${val} ${unit}`;
  }

  _formatToMetricSystem(dist) {
    let measure = convert(dist).from("m").toBest({ system: "metric" });
    let val = this._getLocaleNumber(measure.val);
    return `${val} ${measure.unit}`;
  }

  _formatToImperialSystem(dist) {
    let measure = convert(dist).from("m").to("mi");
    measure = convert(measure).from("mi").toBest({ system: "imperial" });
    let val = this._getLocaleNumber(measure.val);
    return `${val} ${measure.unit}`;
  }

  _getLocaleNumber(val) {
    // Format without grouping separator
    let formattedNumber = val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: this.options?.unitsGroupingSeparator ? false : true,
    });

    let groupingSeparator = this.options?.unitsGroupingSeparator;
    if (groupingSeparator) {
      // Insert spaces for grouping
      formattedNumber = formattedNumber.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        groupingSeparator
      );
    }

    return formattedNumber;
  }

  initDrawBtn(mode) {
    let btn = document.createElement("button");
    btn.type = "button";
    switch (mode) {
      case this._drawCtrl.modes.DRAW_LINE_STRING:
        btn.title = this.options?.lang?.lengthMeasurementButtonTitle ?? "";
        btn.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 512 512" xml:space="preserve" style="padding:4px">
               <path d="M503.467,0h-51.2c-4.71,0-8.533,3.814-8.533,8.533v51.2c0,4.719,3.823,8.533,8.533,8.533h16.077
                   c-15.027,136.132-31.095,243.354-75.81,275.678V332.8c0-4.719-3.823-8.533-8.533-8.533h-51.2c-4.71,0-8.533,3.814-8.533,8.533
                   v9.207c-24.226-20.591-47.59-60.45-70.298-99.26c-22.485-38.426-43.793-74.795-66.236-93.269V128c0-4.719-3.823-8.533-8.533-8.533
                   H128c-4.71,0-8.533,3.814-8.533,8.533v20.326c-45.833,25.207-73.916,114.697-93.005,295.407H8.533
                   c-4.71,0-8.533,3.814-8.533,8.533v51.2C0,508.186,3.823,512,8.533,512h51.2c4.71,0,8.533-3.814,8.533-8.533v-51.2
                   c0-4.719-3.823-8.533-8.533-8.533H43.622c16.734-157.124,41.054-245.598,75.844-274.765V179.2c0,4.719,3.823,8.533,8.533,8.533
                   h51.2c4.71,0,8.533-3.814,8.533-8.533v-5.973c16.614,18.56,33.664,47.667,51.499,78.14
                   c26.539,45.363,53.948,92.117,85.035,111.829V384c0,4.719,3.823,8.533,8.533,8.533H384c4.71,0,8.533-3.814,8.533-8.533v-20.096
                   c58.539-29.158,75.981-141.21,92.979-295.637h17.954c4.71,0,8.533-3.814,8.533-8.533v-51.2C512,3.814,508.177,0,503.467,0z"/>
           </svg>`;
        break;
      case this._drawCtrl.modes.DRAW_POLYGON:
        btn.title = this.options?.lang?.areaMeasurementButtonTitle ?? "";
        btn.innerHTML = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 38C18 40.2091 16.2091 42 14 42C11.7909 42 10 40.2091 10 38C10 35.7909 11.7909 34 14 34C16.2091 34 18 35.7909 18 38Z" fill="#333333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M14 40C15.1046 40 16 39.1046 16 38C16 36.8954 15.1046 36 14 36C12.8954 36 12 36.8954 12 38C12 39.1046 12.8954 40 14 40ZM14 42C16.2091 42 18 40.2091 18 38C18 35.7909 16.2091 34 14 34C11.7909 34 10 35.7909 10 38C10 40.2091 11.7909 42 14 42Z" fill="#333333"/>
                <path d="M14 20C14 22.2091 12.2091 24 10 24C7.79086 24 6 22.2091 6 20C6 17.7909 7.79086 16 10 16C12.2091 16 14 17.7909 14 20Z" fill="#333333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 22C11.1046 22 12 21.1046 12 20C12 18.8954 11.1046 18 10 18C8.89543 18 8 18.8954 8 20C8 21.1046 8.89543 22 10 22ZM10 24C12.2091 24 14 22.2091 14 20C14 17.7909 12.2091 16 10 16C7.79086 16 6 17.7909 6 20C6 22.2091 7.79086 24 10 24Z" fill="#333333"/>
                <path d="M42 20C42 22.2091 40.2091 24 38 24C35.7909 24 34 22.2091 34 20C34 17.7909 35.7909 16 38 16C40.2091 16 42 17.7909 42 20Z" fill="#333333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M38 22C39.1046 22 40 21.1046 40 20C40 18.8954 39.1046 18 38 18C36.8954 18 36 18.8954 36 20C36 21.1046 36.8954 22 38 22ZM38 24C40.2091 24 42 22.2091 42 20C42 17.7909 40.2091 16 38 16C35.7909 16 34 17.7909 34 20C34 22.2091 35.7909 24 38 24Z" fill="#333333"/>
                <path d="M38 38C38 40.2091 36.2091 42 34 42C31.7909 42 30 40.2091 30 38C30 35.7909 31.7909 34 34 34C36.2091 34 38 35.7909 38 38Z" fill="#333333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M34 40C35.1046 40 36 39.1046 36 38C36 36.8954 35.1046 36 34 36C32.8954 36 32 36.8954 32 38C32 39.1046 32.8954 40 34 40ZM34 42C36.2091 42 38 40.2091 38 38C38 35.7909 36.2091 34 34 34C31.7909 34 30 35.7909 30 38C30 40.2091 31.7909 42 34 42Z" fill="#333333"/>
                <path d="M28 10C28 12.2091 26.2091 14 24 14C21.7909 14 20 12.2091 20 10C20 7.79086 21.7909 6 24 6C26.2091 6 28 7.79086 28 10Z" fill="#333333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C25.1046 12 26 11.1046 26 10C26 8.89543 25.1046 8 24 8C22.8954 8 22 8.89543 22 10C22 11.1046 22.8954 12 24 12ZM24 14C26.2091 14 28 12.2091 28 10C28 7.79086 26.2091 6 24 6C21.7909 6 20 7.79086 20 10C20 12.2091 21.7909 14 24 14Z" fill="#333333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M34.9188 19.028L25.9188 12.5994L27.0812 10.9719L36.0812 17.4005L34.9188 19.028ZM21.7844 12.8114L13.0812 19.028L11.9187 17.4005L20.6219 11.1839L21.7844 12.8114ZM11.6428 22.783L14.3095 34.783L12.3571 35.2169L9.69047 23.2169L11.6428 22.783ZM33.6905 34.783L36.246 23.283L38.1984 23.7169L35.6428 35.2169L33.6905 34.783ZM17 36.9999H31V38.9999H17V36.9999Z" fill="#333333"/>
                </svg>
                `;
        break;
    }
    btn.addEventListener("click", () => {
      this._drawCtrl.changeMode(mode);
    });
    this._container.appendChild(btn);
  }

  initClearBtn() {
    let btn = document.createElement("button");
    btn.type = "button";
    btn.title = this.options?.lang?.clearMeasurementsButtonTitle ?? "";
    btn.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            style="padding:5px"
                            viewBox="0 0 465.311 465.311" style="enable-background:new 0 0 465.311 465.311;" xml:space="preserve">
                            <g>
                                <path d="M372.811,51.002h-59.908V36.566C312.902,16.404,296.499,0,276.335,0h-87.356c-20.163,0-36.567,16.404-36.567,36.566v14.436
                                    H92.5c-20.726,0-37.587,16.861-37.587,37.587v38.91c0,8.284,6.716,15,15,15h7.728v307.812c0,8.284,6.716,15,15,15H372.67
                                    c8.284,0,15-6.716,15-15V142.499h7.728c8.284,0,15-6.716,15-15v-38.91C410.397,67.863,393.536,51.002,372.811,51.002z
                                        M182.412,36.566c0-3.621,2.946-6.566,6.567-6.566h87.356c3.621,0,6.567,2.946,6.567,6.566v14.436h-100.49V36.566z M84.914,88.589
                                    c0-4.184,3.403-7.587,7.587-7.587h280.31c4.184,0,7.587,3.403,7.587,7.587v23.91H84.914V88.589z M357.67,435.311H107.641V142.499
                                    H357.67V435.311z"/>
                                <path d="M137.41,413.485c5.523,0,10-4.477,10-10V166.497c0-5.523-4.477-10-10-10s-10,4.477-10,10v236.988
                                    C127.41,409.008,131.887,413.485,137.41,413.485z"/>
                                <path d="M200.907,413.485c5.523,0,10-4.477,10-10V166.497c0-5.523-4.477-10-10-10s-10,4.477-10,10v236.988
                                    C190.907,409.008,195.384,413.485,200.907,413.485z"/>
                                <path d="M264.404,413.485c5.523,0,10-4.477,10-10V166.497c0-5.523-4.477-10-10-10s-10,4.477-10,10v236.988
                                    C254.404,409.008,258.881,413.485,264.404,413.485z"/>
                                <path d="M327.901,413.485c5.523,0,10-4.477,10-10V166.497c0-5.523-4.477-10-10-10s-10,4.477-10,10v236.988
                                    C317.901,409.008,322.378,413.485,327.901,413.485z"/>
                            </g>
                            </svg>`;
    btn.addEventListener("click", () => {
      this._drawCtrl.deleteAll();
      this._updateLabels();
    });
    this._container.appendChild(btn);
  }

  _registerEvents() {
    if (this._map) {
      this._map.on("load", () => {
        this._recreateSourceAndLayers();
      });
      this._map.on("draw.create", this._updateLabels.bind(this));
      this._map.on("draw.update", this._updateLabels.bind(this));
      this._map.on("draw.delete", this._updateLabels.bind(this));
      this._map.on("draw.render", this._updateLabels.bind(this));
    }
  }

  _recreateSourceAndLayers() {
    if (!this._map.getSource(DRAW_LABELS_SOURCE_ID))
      this._map.addSource(DRAW_LABELS_SOURCE_ID, {
        type: "geojson",
        data: SOURCE_DATA,
      });
    if (!this._map.getLayer(DRAW_LABELS_LAYER_ID))
      this._map.addLayer({
        id: DRAW_LABELS_LAYER_ID,
        type: "symbol",
        source: DRAW_LABELS_SOURCE_ID,
        layout: {
          "text-font": [
            this.options?.style?.text?.font ?? "Klokantech Noto Sans Bold",
          ],
          "text-field": ["get", "measurement"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": this.options?.style?.text?.radialOffset ?? 0.5,
          "text-justify": "auto",
          "text-letter-spacing":
            this.options?.style?.text?.letterSpacing ?? 0.05,
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            10,
            10,
            12.0,
            13,
            14.0,
            14,
            16.0,
            18,
            18.0, // Change 15.0 to 10.0 or lower
          ],
        },
        paint: {
          "text-color": this.options?.style?.text?.color ?? "#D20C0C",
          "text-halo-color": this.options?.style?.text?.haloColor ?? "#fff",
          "text-halo-width": this.options?.style?.text?.haloWidth ?? 10,
        },
      });
  }

  _reorderLayers() {
    if (this._map) {
      let mapboxGlSources = Object.values(MapboxDraw.constants.sources);
      this._map
        .getStyle()
        .layers.filter((l) => mapboxGlSources.includes(l.source))
        .forEach((l) => {
          this._map.moveLayer(l.id);
        });

      // move to top
      this._map.moveLayer(DRAW_LABELS_LAYER_ID);
    }
  }

  _updateLabels() {
    let source = this._map.getSource(DRAW_LABELS_SOURCE_ID);
    if (!source && this._map) {
      // in case of the source is somehow missing, recreate and empty one
      this._recreateSourceAndLayers();
      source = this._map.getSource(DRAW_LABELS_SOURCE_ID);
    }

    // Build up the centroids for each segment into a features list, containing a property
    // to hold up the measurements
    let features = [];
    // Generate features from what we have on the drawControl:
    let drawnFeatures = this._drawCtrl.getAll();
    drawnFeatures.features.forEach((feature) => {
      try {
        if (feature.geometry.type == "Polygon") {
          let area = this._formatMeasure(turf.area(feature), true);
          let centroid = turf.centroid(feature);
          let measurement = `${area}`;
          centroid.properties = {
            measurement,
          };
          features.push(centroid);
        } else if (feature.geometry.type == "LineString") {
          let segments = turf.lineSegment(feature);
          segments.features.forEach((segment) => {
            let centroid = turf.centroid(segment);
            let lineLength = this._formatMeasure(turf.length(segment) * 1000); //km to m
            let measurement = `${lineLength}`;
            centroid.properties = {
              measurement,
            };
            features.push(centroid);
          });
        }
      } catch (e) {
        //Silently ignored
      }
    });
    let data = {
      type: "FeatureCollection",
      features: features,
    };
    source.setData(data);

    this._reorderLayers();
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map.removeLayer(DRAW_LABELS_LAYER_ID);
    this._map = undefined;
  }
}
