class_name FusionData
extends RefCounted

## Miku fusion tiers: cyan → green palette.
const RADII := [18.0, 25.0, 34.0, 44.0, 56.0, 70.0, 85.0, 100.0, 118.0, 138.0, 160.0]
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
## Align original spawnWeights for levels 0..2
const SPAWN_WEIGHTS := [0.62, 0.28, 0.1]
const MAX_LV := 10

static func radius(lv: int) -> float:
	return float(RADII[clampi(lv, 0, MAX_LV)])

static func color(lv: int) -> Color:
	return COLORS[clampi(lv, 0, MAX_LV)]

static func merge_score(new_lv: int, chain_index: int) -> int:
	# sa2kit getMergeScore: 10 * max(1, newLevel)^2 * (1 + (chain-1)*0.15)
	# newLevel is 0-based orb level after merge (merge of two lv0 → 1 → score 10).
	var lv := maxi(1, new_lv)
	var base := 10 * lv * lv
	var mult := 1.0 + float(maxi(0, chain_index - 1)) * 0.15
	return int(round(float(base) * mult))

static func random_drop_lv() -> int:
	var r := randf()
	var acc := 0.0
	for i in SPAWN_WEIGHTS.size():
		acc += float(SPAWN_WEIGHTS[i])
		if r <= acc:
			return i
	return SPAWN_WEIGHTS.size() - 1
