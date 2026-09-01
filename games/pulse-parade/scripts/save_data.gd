extends Node
## Persists audio latency offset and simple prefs.

const SAVE_PATH := "user://save.json"

var audio_offset_ms: float = 0.0
var calibrated: bool = false

func _ready() -> void:
	load_save()

func load_save() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if f == null:
		return
	var data: Variant = JSON.parse_string(f.get_as_text())
	if typeof(data) != TYPE_DICTIONARY:
		return
	audio_offset_ms = float(data.get("audio_offset_ms", 0.0))
	calibrated = bool(data.get("calibrated", false))

func save() -> void:
	var payload := {
		"audio_offset_ms": audio_offset_ms,
		"calibrated": calibrated,
	}
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f == null:
		push_error("Failed to write save: %s" % SAVE_PATH)
		return
	f.store_string(JSON.stringify(payload))
