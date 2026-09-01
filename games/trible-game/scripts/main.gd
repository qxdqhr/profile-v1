extends Control

const SIZE := 6
const GEM := 48.0
const GAP := 4.0
const TYPES := 5
const COLORS: Array[Color] = [
	Color(0.95, 0.3, 0.3),
	Color(0.3, 0.85, 0.4),
	Color(0.3, 0.5, 0.95),
	Color(0.95, 0.85, 0.25),
	Color(0.7, 0.4, 0.9),
]
const SCORE_EACH := 10
const TIME_LIMIT := 90

@onready var _board_ui: Control = $BoardWrap/Board
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry

var _grid: Array = [] ## int type
var _selected: Vector2i = Vector2i(-1, -1)
var _score: int = 0
var _time_left: int = TIME_LIMIT
var _busy: bool = false
var _alive: bool = true
var _buttons: Dictionary = {}
var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	var t := Timer.new()
	t.wait_time = 1.0
	t.autostart = true
	t.timeout.connect(_tick)
	add_child(t)
	_restart()

func _restart() -> void:
	_score = 0
	_time_left = TIME_LIMIT
	_alive = true
	_busy = false
	_selected = Vector2i(-1, -1)
	_overlay.visible = false
	_build_grid()
	_rebuild_ui()
	_update_hud()

func _tick() -> void:
	if not _alive:
		return
	_time_left -= 1
	_update_hud()
	if _time_left <= 0:
		_end_game()

func _update_hud() -> void:
	_hud.text = "分数 %d\n时间 %d\n点选相邻宝石交换" % [_score, _time_left]

func _build_grid() -> void:
	_grid.clear()
	for y in SIZE:
		var row: Array = []
		for x in SIZE:
			var t := _rand_type_no_match(x, y, row)
			row.append(t)
		_grid.append(row)

func _rand_type_no_match(x: int, y: int, current_row: Array) -> int:
	for _try in 20:
		var t: int = _rng.randi_range(0, TYPES - 1)
		var ok := true
		if x >= 2 and int(current_row[x - 1]) == t and int(current_row[x - 2]) == t:
			ok = false
		if y >= 2 and int((_grid[y - 1] as Array)[x]) == t and int((_grid[y - 2] as Array)[x]) == t:
			ok = false
		if ok:
			return t
	return _rng.randi_range(0, TYPES - 1)

func _rebuild_ui() -> void:
	for c in _board_ui.get_children():
		c.queue_free()
	_buttons.clear()
	var w := SIZE * GEM + (SIZE - 1) * GAP
	var h := SIZE * GEM + (SIZE - 1) * GAP
	_board_ui.custom_minimum_size = Vector2(w, h)
	_board_ui.size = Vector2(w, h)
	for y in SIZE:
		for x in SIZE:
			var t: int = int((_grid[y] as Array)[x])
			var btn := Button.new()
			btn.custom_minimum_size = Vector2(GEM, GEM)
			btn.size = Vector2(GEM, GEM)
			btn.position = Vector2(x * (GEM + GAP), y * (GEM + GAP))
			btn.text = ""
			var style := StyleBoxFlat.new()
			style.bg_color = COLORS[t]
			style.set_corner_radius_all(10)
			btn.add_theme_stylebox_override("normal", style)
			var hover := style.duplicate() as StyleBoxFlat
			hover.bg_color = hover.bg_color.lightened(0.12)
			btn.add_theme_stylebox_override("hover", hover)
			var cell := Vector2i(x, y)
			btn.pressed.connect(func() -> void: _on_cell(cell))
			_board_ui.add_child(btn)
			_buttons[cell] = btn
	_refresh_sel()

func _refresh_sel() -> void:
	for k in _buttons.keys():
		var cell: Vector2i = k as Vector2i
		var btn: Button = _buttons[cell] as Button
		var t: int = int((_grid[cell.y] as Array)[cell.x])
		var style := StyleBoxFlat.new()
		style.bg_color = COLORS[t]
		style.set_corner_radius_all(10)
		if cell == _selected:
			style.border_color = Color.WHITE
			style.set_border_width_all(3)
		btn.add_theme_stylebox_override("normal", style)

func _on_cell(cell: Vector2i) -> void:
	if not _alive or _busy:
		return
	if _selected.x < 0:
		_selected = cell
		_refresh_sel()
		return
	if _selected == cell:
		_selected = Vector2i(-1, -1)
		_refresh_sel()
		return
	var dx := absi(_selected.x - cell.x)
	var dy := absi(_selected.y - cell.y)
	if not ((dx == 1 and dy == 0) or (dx == 0 and dy == 1)):
		_selected = cell
		_refresh_sel()
		return
	_try_swap(_selected, cell)
	_selected = Vector2i(-1, -1)

func _try_swap(a: Vector2i, b: Vector2i) -> void:
	_swap_cells(a, b)
	var matches: Array = _find_matches()
	if matches.is_empty():
		_swap_cells(a, b)
		_rebuild_ui()
		return
	_busy = true
	_resolve_chain()

func _swap_cells(a: Vector2i, b: Vector2i) -> void:
	var ta: int = int((_grid[a.y] as Array)[a.x])
	var tb: int = int((_grid[b.y] as Array)[b.x])
	(_grid[a.y] as Array)[a.x] = tb
	(_grid[b.y] as Array)[b.x] = ta

func _find_matches() -> Array:
	var marked: Dictionary = {}
	for y in SIZE:
		var x := 0
		while x < SIZE:
			var t: int = int((_grid[y] as Array)[x])
			var run := 1
			while x + run < SIZE and int((_grid[y] as Array)[x + run]) == t:
				run += 1
			if run >= 3:
				for i in run:
					marked[Vector2i(x + i, y)] = true
			x += run
	for x in SIZE:
		var y := 0
		while y < SIZE:
			var t: int = int((_grid[y] as Array)[x])
			var run := 1
			while y + run < SIZE and int((_grid[y + run] as Array)[x]) == t:
				run += 1
			if run >= 3:
				for i in run:
					marked[Vector2i(x, y + i)] = true
			y += run
	return marked.keys()

func _resolve_chain() -> void:
	while true:
		var matches: Array = _find_matches()
		if matches.is_empty():
			break
		_score += matches.size() * SCORE_EACH
		for m in matches:
			var c: Vector2i = m as Vector2i
			(_grid[c.y] as Array)[c.x] = -1
		_collapse_and_fill()
		_update_hud()
	_busy = false
	_rebuild_ui()

func _collapse_and_fill() -> void:
	for x in SIZE:
		var stack: Array[int] = []
		for y in range(SIZE - 1, -1, -1):
			var v: int = int((_grid[y] as Array)[x])
			if v >= 0:
				stack.append(v)
		for y in range(SIZE - 1, -1, -1):
			if stack.is_empty():
				(_grid[y] as Array)[x] = _rng.randi_range(0, TYPES - 1)
			else:
				(_grid[y] as Array)[x] = stack.pop_front()

func _end_game() -> void:
	_alive = false
	_over_msg.text = "时间到\n分数 %d" % _score
	_overlay.visible = true
