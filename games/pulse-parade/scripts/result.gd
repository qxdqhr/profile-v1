extends Control

@onready var _title: Label = $Center/VBox/Title
@onready var _stats: Label = $Center/VBox/Stats
@onready var _retry: Button = $Center/VBox/Retry
@onready var _home: Button = $Center/VBox/Home

func _ready() -> void:
	var stats: Dictionary = {}
	if get_tree().has_meta("last_result"):
		stats = get_tree().get_meta("last_result")
	var counts: Dictionary = stats.get("counts", {})
	_title.text = "评级 %s" % str(stats.get("rank", "?"))
	_stats.text = "%s\n命中率 %.0f%%\n最大连击 %d\nP %d / G %d / OK %d / M %d" % [
		str(stats.get("title", "Demo Tap")),
		float(stats.get("accuracy", 0.0)) * 100.0,
		int(stats.get("combo", 0)),
		int(counts.get("perfect", 0)),
		int(counts.get("great", 0)),
		int(counts.get("ok", 0)),
		int(counts.get("miss", 0)),
	]
	_retry.pressed.connect(func() -> void:
		get_tree().change_scene_to_file("res://scenes/rhythm_stage.tscn")
	)
	_home.pressed.connect(func() -> void:
		get_tree().change_scene_to_file("res://scenes/title.tscn")
	)
