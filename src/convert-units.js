const lengthUnits = {
	mm: { system: 'metric', toBase: 0.001 },
	cm: { system: 'metric', toBase: 0.01 },
	m: { system: 'metric', toBase: 1 },
	km: { system: 'metric', toBase: 1000 },
	in: { system: 'imperial', toBase: 0.0254 },
	ft: { system: 'imperial', toBase: 0.3048 },
	yd: { system: 'imperial', toBase: 0.9144 },
	mi: { system: 'imperial', toBase: 1609.344 },
};

const areaUnits = {
	mm2: { system: 'metric', toBase: 0.000001 },
	cm2: { system: 'metric', toBase: 0.0001 },
	m2: { system: 'metric', toBase: 1 },
	km2: { system: 'metric', toBase: 1000000 },
	ha: { system: 'metric', toBase: 10000 },
	in2: { system: 'imperial', toBase: 0.00064516 },
	ft2: { system: 'imperial', toBase: 0.092903 },
	yd2: { system: 'imperial', toBase: 0.836127 },
	ac: { system: 'imperial', toBase: 4046.8564224 },
	mi2: { system: 'imperial', toBase: 2589988.110336 },
};

const allUnits = {
	...lengthUnits,
	...areaUnits,
};

export default function convert(value) {
	return {
		from: function (fromUnit) {
			const fromUnitData = allUnits[fromUnit];
			if (!fromUnitData) {
				throw new Error(`Unknown unit: ${fromUnit}`);
			}

			const baseValue = value * fromUnitData.toBase;

			return {
				to: function (toUnit) {
					const toUnitData = allUnits[toUnit];
					if (!toUnitData) {
						throw new Error(`Unknown unit: ${toUnit}`);
					}
					return baseValue / toUnitData.toBase;
				},
				toBest: function (options = {}) {
					const system = options.system;
					const isArea = fromUnit.endsWith('2');

					if (isArea) {
						if (system === 'imperial') {
							const ft2Value = baseValue / areaUnits.ft2.toBase;
							if (ft2Value < 43560) {
								return { val: ft2Value, unit: 'ft2' };
							} else if (ft2Value < 6272640) {
								const acValue = baseValue / 4046.8564224;
								return { val: acValue, unit: 'ac' };
							} else {
								const mi2Value = baseValue / areaUnits.mi2.toBase;
								return { val: mi2Value, unit: 'mi2' };
							}
						} else {
							const m2Value = baseValue;
							if (m2Value < 10000) {
								return { val: m2Value, unit: 'm2' };
							} else if (m2Value < 1000000) {
								const haValue = baseValue / areaUnits.ha.toBase;
								return { val: haValue, unit: 'ha' };
							} else {
								const km2Value = baseValue / areaUnits.km2.toBase;
								return { val: km2Value, unit: 'km2' };
							}
						}
					} else {
						if (system === 'imperial') {
							const ftValue = baseValue / lengthUnits.ft.toBase;
							if (ftValue < 5280) {
								return { val: ftValue, unit: 'ft' };
							} else {
								const miValue = baseValue / lengthUnits.mi.toBase;
								return { val: miValue, unit: 'mi' };
							}
						} else {
							const mValue = baseValue;
							if (mValue < 1000) {
								return { val: mValue, unit: 'm' };
							} else {
								const kmValue = baseValue / lengthUnits.km.toBase;
								return { val: kmValue, unit: 'km' };
							}
						}
					}
				},
			};
		},
	};
}
