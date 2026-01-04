import { describe, it, expect, vi, beforeEach } from 'vitest';
import MeasuresControl from './maplibre-gl-measures';

vi.mock('@mapbox/mapbox-gl-draw', () => ({
	default: function MockDraw() {
		this.modes = { DRAW_LINE_STRING: 'draw_line', DRAW_POLYGON: 'draw_polygon' };
		this.getAll = vi.fn(() => ({ features: [] }));
		this.changeMode = vi.fn();
		this.deleteAll = vi.fn();
	},
	constants: {
		sources: {
			HOT: 'mapbox-gl-draw-hot',
			COLD: 'mapbox-gl-draw-cold',
		},
	},
}));

vi.mock('@turf/turf', () => ({
	area: vi.fn(() => 100),
	centroid: vi.fn((feature) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } })),
	lineSegment: vi.fn(() => ({ features: [] })),
	length: vi.fn(() => 1),
}));

describe('MeasuresControl', () => {
	let ctrl;
	let map;

	beforeEach(() => {
		ctrl = new MeasuresControl({ units: 'metric' });
		map = {
			addControl: vi.fn(),
			on: vi.fn(),
			off: vi.fn(),
			remove: vi.fn(),
			getStyle: vi.fn(() => ({ layers: [] })),
			getSource: vi.fn(),
			getLayer: vi.fn(),
			addSource: vi.fn(),
			addLayer: vi.fn(),
			moveLayer: vi.fn(),
			removeLayer: vi.fn(),
			removeSource: vi.fn(),
		};
	});

	it('formats metric area correctly', () => {
		expect(ctrl._formatAreaToMetricSystem(100)).toMatch(/100\.00.*m²/);
	});

	it('formats imperial area correctly', () => {
		ctrl.options.units = 'imperial';
		expect(ctrl._formatAreaToImperialSystem(100)).toMatch(/1,076\.39.*ft²/);
	});

	it('formats metric length correctly', () => {
		expect(ctrl._formatToMetricSystem(100)).toMatch(/100\.00.*m/);
	});

	it('formats imperial length correctly', () => {
		ctrl.options.units = 'imperial';
		expect(ctrl._formatToImperialSystem(100)).toMatch(/328\.08.*ft/);
	});

	it('formats locale number with grouping', () => {
		ctrl.options.unitsGroupingSeparator = ' ';
		expect(ctrl._getLocaleNumber(1234567.89)).toMatch(/1 234 567/);
	});

	it('creates draw buttons and clear button', () => {
		ctrl._container = document.createElement('div');
		ctrl.initDrawBtn('draw_line');
		ctrl.initDrawBtn('draw_polygon');
		ctrl.initClearBtn();
		expect(ctrl._container.querySelectorAll('button').length).toBe(3);
	});

	it('calls changeMode on draw button click', () => {
		ctrl._container = document.createElement('div');
		ctrl.initDrawBtn('draw_line');
		const btn = ctrl._container.querySelector('button');
		btn.click();
		expect(ctrl._drawCtrl.changeMode).toHaveBeenCalledWith('draw_line');
	});

	it('calls deleteAll and _updateLabels on clear button click', () => {
		ctrl._container = document.createElement('div');
		ctrl._updateLabels = vi.fn();
		ctrl.initClearBtn();
		const btn = ctrl._container.querySelector('button');
		btn.click();
		expect(ctrl._drawCtrl.deleteAll).toHaveBeenCalled();
		expect(ctrl._updateLabels).toHaveBeenCalled();
	});

	it('returns empty FeatureCollection from _getDrawnFeatures', () => {
		expect(ctrl._getDrawnFeatures()).toEqual({
			type: 'FeatureCollection',
			features: [],
		});
	});

	it('adds and removes the control', () => {
		const container = ctrl.onAdd(map);
		expect(map.addControl).toHaveBeenCalledWith(ctrl._drawCtrl, 'top-left');
		document.body.appendChild(container);
		expect(ctrl._container.parentNode).not.toBeNull();

		// Manually append to body to test removal
		document.body.appendChild(ctrl._container);
		ctrl.onRemove();
		expect(document.body.contains(ctrl._container)).toBe(false);
		expect(map.removeLayer).toHaveBeenCalled();
	});

	it('registers map events', () => {
		ctrl.onAdd(map);
		expect(map.on).toHaveBeenCalledWith('load', expect.any(Function));
		expect(map.on).toHaveBeenCalledWith('draw.create', expect.any(Function));
		expect(map.on).toHaveBeenCalledWith('draw.update', expect.any(Function));
		expect(map.on).toHaveBeenCalledWith('draw.delete', expect.any(Function));
		expect(map.on).toHaveBeenCalledWith('draw.render', expect.any(Function));
	});

	it('handles onRender and onCreate callbacks', () => {
		const onRender = vi.fn();
		const onCreate = vi.fn();
		ctrl.options.onRender = onRender;
		ctrl.options.onCreate = onCreate;

		ctrl._handleOnRender();
		expect(onRender).toHaveBeenCalled();

		ctrl._handleOnCreate();
		expect(onCreate).toHaveBeenCalled();
	});

	it('gets drawn features', () => {
		ctrl._drawCtrl.getAll.mockReturnValue({
			features: [
				{
					id: '1',
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Polygon',
						coordinates: [
							[
								[0, 0],
								[0, 1],
								[1, 1],
								[1, 0],
								[0, 0],
							],
						],
					},
				},
				{
					id: '2',
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[2, 2],
							[3, 3],
						],
					},
				},
			],
		});
		const features = ctrl._getDrawnFeatures();
		expect(features.features.length).toBe(1);
	});

	it('recreates source and layers', () => {
		ctrl.onAdd(map);
		ctrl._recreateSourceAndLayers();
		expect(map.addSource).toHaveBeenCalled();
		expect(map.addLayer).toHaveBeenCalled();
	});

	it('updates labels', () => {
		const source = { setData: vi.fn() };
		map.getSource.mockReturnValue(source);
		ctrl.onAdd(map);
		ctrl._reorderLayers = vi.fn();
		ctrl._updateLabels();
		expect(source.setData).toHaveBeenCalled();
		expect(ctrl._reorderLayers).toHaveBeenCalled();
	});

	it('formats measure', () => {
		ctrl.options.units = 'metric';
		expect(ctrl._formatMeasure(100)).toMatch(/100\.00.*m/);
		ctrl.options.units = 'imperial';
		expect(ctrl._formatMeasure(100)).toMatch(/328\.08.*ft/);
	});

	it('uses fixed unit for metric length', () => {
		ctrl.options.units = 'metric';
		ctrl.options.fixedLengthUnit = 'm';
		expect(ctrl._formatToMetricSystem(5000)).toMatch(/5,?000\.00.*m/);
	});

	it('uses fixed unit for imperial length', () => {
		ctrl.options.units = 'imperial';
		ctrl.options.fixedLengthUnit = 'mi';
		expect(ctrl._formatToImperialSystem(100)).toMatch(/0\.06.*mi/);
	});

	it('uses fixed unit for metric area', () => {
		ctrl.options.units = 'metric';
		ctrl.options.fixedAreaUnit = 'm2';
		expect(ctrl._formatAreaToMetricSystem(50000)).toMatch(/50,?000\.00.*m²/);
	});

	it('uses fixed unit for imperial area', () => {
		ctrl.options.units = 'imperial';
		ctrl.options.fixedAreaUnit = 'ft2';
		expect(ctrl._formatAreaToImperialSystem(100)).toMatch(/1,?076\.39.*ft²/);
	});

	it('uses different fixed units for length and area', () => {
		ctrl.options.units = 'metric';
		ctrl.options.fixedLengthUnit = 'km';
		ctrl.options.fixedAreaUnit = 'ha';
		expect(ctrl._formatToMetricSystem(5000)).toMatch(/5\.00.*km/);
		expect(ctrl._formatAreaToMetricSystem(50000)).toMatch(/5\.00.*ha/);
	});
});
