extends Control

const COLS := 4
const ROWS := 4
const CELL := 68.0
const GAP := 8.0
const TIME_LIMIT := 40.0
const COLORS: Array[Color] = [
	Color(0.95, 0.4, 0.55), Color(0.4, 0.85, 0.9), Color(0.95, 0.8, 0.35),
	Color(0.55, 0.75, 0.95), Color(0.7, 0.5, 0.95), Color(0.45, 0.9, 0.55),
]

@onready var _grid: GridContainer = $Center/Grid
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry

var _score: int = 0
var _taps: int = 0
var _time_left: float = TIME_LIMIT
var _alive: bool = true
var _cells: Array[Button] = []
var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	_grid.columns = COLS
	_build_grid()
	_restart()

func _build_grid() -> void:
	for c in _grid.get_children():
		c.queue_free()
	_cells.clear()
	for i in COLS * ROWS:
		var b := Button.new()
		b.custom_minimum_size = Vector2(CELL, CELL)
		var idx := i
		b.pressed.connect(func() -> void: _on_cell(idx))
		_grid.add_child(b)
		_cells.append(b)
		_style_cell(i, false)

func _style_cell(i: int, flash: bool) -> void:
	var style := StyleBoxFlat.new()
	style.bg_color = COLORS[i % COLORS.size()]
	if flash:
		style.bg_color = style.bg_color.lightened(0.35)
	style.set_corner_radius_all(12)
	_cells[i].add_theme_stylebox_override("normal", style)
	_cells[i].add_theme_stylebox_override("hover", style)
	_cells[i].text = ""

func _restart() -> void:
	_score = 0
	_taps = 0
	_time_left = TIME_LIMIT
	_alive = true
	_overlay.visible = false
	for i in _cells.size():
		_style_cell(i, false)
	_update_hud()

func _process(delta: float) -> void:
	if not _alive:
		return
	_time_left -= delta
	_update_hud()
	if _time_left <= 0.0:
		_end()

func _on_cell(i: int) -> void:
	if not _alive:
		return
	_taps += 1
	_score += 5 + (_taps % 8)
	_style_cell(i, true)
	get_tree().create_timer(0.12).timeout.connect(func() -> void:
		if i < _cells.size():
			_style_cell(i, false)
	)
	_update_hud()

func _update_hud() -> void:
	_hud.text = "分数 %d  点击 %d\n剩余 %.1fs\n点格子奏乐（视觉节拍）" % [_score, _taps, maxf(0.0, _time_left)]

func _end() -> void:
	_alive = false
	_over_msg.text = "时间到\n分数 %d\n点击 %d" % [_score, _taps]
	_overlay.visible = true
