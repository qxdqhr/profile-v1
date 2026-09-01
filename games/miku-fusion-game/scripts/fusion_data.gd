class_name FusionData
extends RefCounted

## Miku fusion tiers: cyan → green palette.
const RADII := [18.0, 25.0, 34.0, 44.0, 56.0, 70.0, 85.0, 100.0, 118.0, 138.0, 160.0]
const SCORES := [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 100]
const COLORS := [
	Color(0.55, 0.92, 0.95),
	Color(0.45, 0.85, 0.88),
	Color(0.35, 0.78, 0.82),
	Color(0.4, 0.88, 0.55),
	Color(0.35, 0.75, 0.48),
	Color(0.55, 0.95, 0.65),
	Color(0.7, 0.95, 0.75),
	Color(0.85, 0.98, 0.82),
	Color(0.95, 0.98, 0.9),
	Color(0.75, 0.55, 0.95),
	Color(0.39, 0.85, 0.92),
]
const DROP_MAX_LV := 4
const MAX_LV := 10

static func radius(lv: int) -> float:
	return float(RADII[clampi(lv, 0, MAX_LV)])

static func color(lv: int) -> Color:
	return COLORS[clampi(lv, 0, MAX_LV)]

static func score(lv: int) -> int:
	return int(SCORES[clampi(lv, 0, MAX_LV)])

static func random_drop_lv() -> int:
	return randi_range(0, DROP_MAX_LV)
