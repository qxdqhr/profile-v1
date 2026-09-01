extends Node
## Difficulty presets (original numbers inspired by flappy feel; art is new).

signal difficulty_changed(id: String)

var current_id: String = "medium"

var DIFFICULTIES := {
	"easy": {
		"label": "简单",
		"hint": "缝更大 · 更慢",
		"color": Color(0.24, 0.72, 0.47),
		"gravity": 980.0,
		"flap_impulse": -360.0,
		"max_fall": 520.0,
		"pipe_gap": 210.0,
		"pipe_speed": 160.0,
		"spawn_distance": 240.0,
		"hitbox_scale": 0.55,
	},
	"medium": {
		"label": "中等",
		"hint": "均衡节奏",
		"color": Color(1.0, 0.42, 0.29),
		"gravity": 1100.0,
		"flap_impulse": -390.0,
		"max_fall": 560.0,
		"pipe_gap": 170.0,
		"pipe_speed": 200.0,
		"spawn_distance": 210.0,
		"hitbox_scale": 0.64,
	},
	"hard": {
		"label": "困难",
		"hint": "窄缝高速",
		"color": Color(0.77, 0.27, 0.41),
		"gravity": 1240.0,
		"flap_impulse": -410.0,
		"max_fall": 600.0,
		"pipe_gap": 140.0,
		"pipe_speed": 240.0,
		"spawn_distance": 190.0,
		"hitbox_scale": 0.72,
	},
}

const DIFF_ORDER := ["easy", "medium", "hard"]
const PIPE_SCORE := 1
const COIN_SCORE := 3

func get_diff() -> Dictionary:
	return DIFFICULTIES[current_id]

func set_diff(id: String) -> void:
	if not DIFFICULTIES.has(id):
		return
	current_id = id
	difficulty_changed.emit(id)

func cycle_diff(delta: int) -> void:
	var i := DIFF_ORDER.find(current_id)
	if i < 0:
		i = 1
	i = (i + delta + DIFF_ORDER.size()) % DIFF_ORDER.size()
	set_diff(DIFF_ORDER[i])
