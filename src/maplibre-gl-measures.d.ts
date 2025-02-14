declare module 'maplibre-gl-measures' {
    import {Map} from 'maplibre-gl';

    interface MeasuresControlOptions {
        lang?: {
            areaMeasurementButtonTitle?: string;
            lengthMeasurementButtonTitle?: string;
            clearMeasurementsButtonTitle?: string;
        };
        units?: 'imperial' | 'metric';
        unitsGroupingSeparator?: string;
        style?: {
            text?: {
                radialOffset?: number;
                letterSpacing?: number;
                color?: string;
                haloColor?: string;
                haloWidth?: number;
                font?: string;
            };
            common?: {
                midPointRadius?: number;
                midPointColor?: string;
                midPointHaloRadius?: number;
                midPointHaloColor?: string;
            };
            areaMeasurement?: {
                fillColor?: string;
                fillOutlineColor?: string;
                fillOpacity?: number;
                lineWidth?: number;
            };
            lengthMeasurement?: {
                lineWidth?: number;
                lineColor?: string;
            };
        };
        onRender?: (features: any) => void;
        onCreate?: (features: any) => void;
    }

    class MeasuresControl {
        constructor(options: MeasuresControlOptions);

        onAdd(map: Map): HTMLElement;

        onRemove(): void;
    }

    export default MeasuresControl;
}