extends Control

const COLS := 6
const ROWS := 8
const TYPES := 8
const TILE := 48.0
const GAP := 4.0
const COLORS: Array[Color] = [
	Color(0.9, 0.35, 0.35), Color(0.95, 0.6, 0.25), Color(0.95, 0.85, 0.3),
	Color(0.4, 0.8, 0.4), Color(0.35, 0.7, 0.9), Color(0.5, 0.45, 0.95),
	Color(0.9, 0.4, 0.75), Color(0.55, 0.55, 0.6),
]

@onready var _board_ui: Control = $BoardWrap/Board
@onready var _hud: Label = $UI/HUD
@onready var _line: Line2D = $UI/PathLine
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _shuffle: Button = $UI/Shuffle

var _board: Array = [] ## int type or -1
var _selected: Vector2i = Vector2i(-1, -1)
var _matched: int = 0
var _total: int = COLS * ROWS
var _won: bool = false
var _buttons: Dictionary = {} ## Vector2i -> Button

func _ready() -> void:
	_retry.pressed.connect(_restart)
	_shuffle.pressed.connect(_do_shuffle)
	_line.width = 3.0
	_line.default_color = Color(1, 1, 1, 0.85)
	_restart()

func _restart() -> void:
	_won = false
	_matched = 0
	_selected = Vector2i(-1, -1)
	_overlay.visible = false
	_line.points = PackedVector2Array()
	_build_board()
	_rebuild_ui()
	_update_hud()

func _build_board() -> void:
	var types: Array[int] = []
	for i in _total / 2:
		var t: int = i % TYPES
		types.append(t)
		types.append(t)
	types.shuffle()
	_board.clear()
	var idx := 0
	for y in ROWS:
		var row: Array = []
		for x in COLS:
			row.append(types[idx])
			idx += 1
		_board.append(row)

func _do_shuffle() -> void:
	if _won:
		return
	var vals: Array[int] = []
	for y in ROWS:
		for x in COLS:
			var v: int = int((_board[y] as Array)[x])
			if v >= 0:
				vals.append(v)
	vals.shuffle()
	var i := 0
	for y in ROWS:
		for x in COLS:
			if int((_board[y] as Array)[x]) >= 0:
				(_board[y] as Array)[x] = vals[i]
				i += 1
	_selected = Vector2i(-1, -1)
	_line.points = PackedVector2Array()
	_rebuild_ui()

func _update_hud() -> void:
	_hud.text = "剩余 %d\n点选同色且可连通（≤2 拐）" % (_total - _matched)

func _cell_pos(c: Vector2i) -> Vector2:
	return Vector2(c.x * (TILE + GAP) + TILE * 0.5, c.y * (TILE + GAP) + TILE * 0.5)

func _rebuild_ui() -> void:
	for c in _board_ui.get_children():
		c.queue_free()
	_buttons.clear()
	var w := COLS * TILE + (COLS - 1) * GAP
	var h := ROWS * TILE + (ROWS - 1) * GAP
	_board_ui.custom_minimum_size = Vector2(w, h)
	_board_ui.size = Vector2(w, h)
	for y in ROWS:
		for x in COLS:
			var t: int = int((_board[y] as Array)[x])
			if t < 0:
				continue
			var btn := Button.new()
			btn.custom_minimum_size = Vector2(TILE, TILE)
			btn.size = Vector2(TILE, TILE)
			btn.position = Vector2(x * (TILE + GAP), y * (TILE + GAP))
			btn.text = str(t + 1)
			btn.add_theme_font_size_override("font_size", 18)
			var style := StyleBoxFlat.new()
			style.bg_color = COLORS[t % COLORS.size()]
			style.set_corner_radius_all(8)
			btn.add_theme_stylebox_override("normal", style)
			var hover := style.duplicate() as StyleBoxFlat
			hover.bg_color = hover.bg_color.lightened(0.15)
			btn.add_theme_stylebox_override("hover", hover)
			btn.add_theme_color_override("font_color", Color.WHITE)
			var cell := Vector2i(x, y)
			btn.pressed.connect(func() -> void: _on_cell(cell))
			_board_ui.add_child(btn)
			_buttons[cell] = btn
	_refresh_selection_style()

func _refresh_selection_style() -> void:
	for k in _buttons.keys():
		var cell: Vector2i = k as Vector2i
		var btn: Button = _buttons[cell] as Button
		var t: int = int((_board[cell.y] as Array)[cell.x])
		if t < 0:
			continue
		var style := StyleBoxFlat.new()
		style.bg_color = COLORS[t % COLORS.size()]
		style.set_corner_radius_all(8)
		if cell == _selected:
			style.border_color = Color.WHITE
			style.set_border_width_all(3)
		btn.add_theme_stylebox_override("normal", style)

func _on_cell(cell: Vector2i) -> void:
	if _won:
		return
	if int((_board[cell.y] as Array)[cell.x]) < 0:
		return
	if _selected.x < 0:
		_selected = cell
		_refresh_selection_style()
		return
	if _selected == cell:
		_selected = Vector2i(-1, -1)
		_line.points = PackedVector2Array()
		_refresh_selection_style()
		return
	var result: Dictionary = LinkLogic.try_link(_board, _selected, cell)
	if bool(result.get("ok", false)):
		var path: Array = result["path"] as Array
		_draw_path(path)
		(_board[_selected.y] as Array)[_selected.x] = -1
		(_board[cell.y] as Array)[cell.x] = -1
		_matched += 2
		_selected = Vector2i(-1, -1)
		get_tree().create_timer(0.25).timeout.connect(func() -> void:
			_line.points = PackedVector2Array()
			_rebuild_ui()
			_update_hud()
			if _matched >= _total:
				_won = true
				_over_msg.text = "通关！"
				_overlay.visible = true
		)
	else:
		_selected = cell
		_line.points = PackedVector2Array()
		_refresh_selection_style()

func _draw_path(path: Array) -> void:
	var pts := PackedVector2Array()
	var origin := _board_ui.global_position
	for p in path:
		var v: Vector2i = p as Vector2i
		pts.append(origin + _cell_pos(v))
	_line.points = pts
