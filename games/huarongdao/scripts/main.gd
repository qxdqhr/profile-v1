extends Control

const ROWS := 3
const COLS := 3
const TILE_GAP := 6.0
const TILE_COLORS: Array[Color] = [
	Color(0.35, 0.55, 0.85),
	Color(0.45, 0.75, 0.55),
	Color(0.9, 0.55, 0.35),
	Color(0.75, 0.45, 0.85),
	Color(0.85, 0.75, 0.35),
	Color(0.55, 0.85, 0.85),
	Color(0.85, 0.45, 0.55),
	Color(0.5, 0.5, 0.55),
]

@onready var _board: Control = $Board
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _shuffle_btn: Button = $UI/Shuffle

var _tiles: Array[int] = []
var _move_count: int = 0
var _solved: bool = false
var _tile_size: float = 100.0

func _ready() -> void:
	_retry.pressed.connect(_restart)
	_shuffle_btn.pressed.connect(_restart)
	_restart()

func _restart() -> void:
	_tiles = PuzzleLogic.shuffle_solvable(ROWS, COLS)
	_move_count = 0
	_solved = false
	_overlay.visible = false
	_rebuild_board()
	_update_hud()

func _update_hud() -> void:
	_hud.text = "步数 %d\n点击与空格相邻的块" % _move_count

func _rebuild_board() -> void:
	for c in _board.get_children():
		c.queue_free()
	var board_w := COLS * _tile_size + (COLS - 1) * TILE_GAP
	var board_h := ROWS * _tile_size + (ROWS - 1) * TILE_GAP
	_board.custom_minimum_size = Vector2(board_w, board_h)
	_board.size = Vector2(board_w, board_h)
	for i in _tiles.size():
		var val: int = _tiles[i]
		if val == 0:
			continue
		var r := i / COLS
		var c := i % COLS
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(_tile_size, _tile_size)
		btn.size = Vector2(_tile_size, _tile_size)
		btn.position = Vector2(c * (_tile_size + TILE_GAP), r * (_tile_size + TILE_GAP))
		btn.text = str(val)
		btn.add_theme_font_size_override("font_size", 32)
		var color_idx := (val - 1) % TILE_COLORS.size()
		var style := StyleBoxFlat.new()
		style.bg_color = TILE_COLORS[color_idx]
		style.set_corner_radius_all(12)
		btn.add_theme_stylebox_override("normal", style)
		var hover := style.duplicate() as StyleBoxFlat
		hover.bg_color = hover.bg_color.lightened(0.12)
		btn.add_theme_stylebox_override("hover", hover)
		btn.add_theme_color_override("font_color", Color(1, 1, 1))
		var idx := i
		btn.pressed.connect(func() -> void: _on_tile(idx))
		_board.add_child(btn)

func _on_tile(tile_index: int) -> void:
	if _solved:
		return
	if not PuzzleLogic.can_move(_tiles, ROWS, COLS, tile_index):
		return
	_tiles = PuzzleLogic.move_tile(_tiles, ROWS, COLS, tile_index)
	_move_count += 1
	_rebuild_board()
	_update_hud()
	if PuzzleLogic.is_solved(_tiles):
		_solved = true
		_over_msg.text = "通关！\n步数 %d" % _move_count
		_overlay.visible = true
