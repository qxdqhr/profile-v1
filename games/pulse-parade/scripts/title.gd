extends Control

@onready var _title: Label = $Center/VBox/Title
@onready var _play: Button = $Center/VBox/PlayButton
@onready var _calibrate: Button = $Center/VBox/CalibrateButton
@onready var _hint: Label = $Center/VBox/Hint

func _ready() -> void:
	_title.text = "Pulse Parade"
	_hint.text = "横屏纯点按 · Space / Z / 点击 / 触摸"
	if SaveData.calibrated:
		_hint.text += "\n延迟校准: %.0f ms" % SaveData.audio_offset_ms
	_play.pressed.connect(_on_play)
	_calibrate.pressed.connect(_on_calibrate)

func _on_play() -> void:
	get_tree().change_scene_to_file("res://scenes/rhythm_stage.tscn")

func _on_calibrate() -> void:
	get_tree().change_scene_to_file("res://scenes/calibrate.tscn")
