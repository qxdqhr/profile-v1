extends Control

@onready var _title: Label = $VBox/Title
@onready var _diff: Label = $VBox/DiffLabel
@onready var _hint: Label = $VBox/Hint
@onready var _best: Label = $VBox/Best
@onready var _play: Button = $VBox/Play
@onready var _prev: Button = $VBox/DiffRow/Prev
@onready var _next: Button = $VBox/DiffRow/Next

func _ready() -> void:
	_title.text = "予愿飞翔"
	_play.pressed.connect(func() -> void:
		get_tree().change_scene_to_file("res://scenes/play.tscn")
	)
	_prev.pressed.connect(func() -> void: GameConfig.cycle_diff(-1); _refresh())
	_next.pressed.connect(func() -> void: GameConfig.cycle_diff(1); _refresh())
	if not GameConfig.difficulty_changed.is_connected(_on_diff):
		GameConfig.difficulty_changed.connect(_on_diff)
	_refresh()

func _on_diff(_id: String) -> void:
	_refresh()

func _refresh() -> void:
	var d: Dictionary = GameConfig.get_diff()
	_diff.text = str(d["label"])
	_diff.modulate = d["color"]
	_hint.text = str(d["hint"])
	_best.text = "最佳 %d" % int(SaveData.best.get(GameConfig.current_id, 0))
	_play.text = "开始飞翔"
