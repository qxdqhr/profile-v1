extends Control

const TILE := 48.0
const COLOR_WALL := Color(0.35, 0.38, 0.45)
const COLOR_FLOOR := Color(0.18, 0.2, 0.26)
const COLOR_TARGET := Color(0.85, 0.55, 0.25, 0.55)
const COLOR_BOX := Color(0.55, 0.4, 0.25)
const COLOR_BOX_OK := Color(0.35, 0.75, 0.45)
const COLOR_PLAYER := Color(0.4, 0.65, 0.95)

@onready var _board: Control = $BoardWrap/Board
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _next: Button = $UI/Overlay/VBox/Next

var _level_idx: int = 0
var _map: Array = []
var _player: Vector2i = Vector2i.ZERO
var _won: bool = false

func _ready() -> void:
	_retry.pressed.connect(_on_retry)
	_next.pressed.connect(_on_next)
	_load_level(0)

func _load_level(idx: int) -> void:
	_level_idx = idx
	_map = PushLevels.clone_map(idx)
	_player = PushLevels.find_player(_map)
	_won = false
	_overlay.visible = false
	_next.visible = false
	_rebuild()
	_update_hud()

func _update_hud() -> void:
	_hud.text = "关卡 %d / %d\n方向键 / 滑动移动 · R 重开" % [_level_idx + 1, PushLevels.level_count()]

func _rebuild() -> void:
	for c in _board.get_children():
		c.queue_free()
	var rows := _map.size()
	var cols := 0
	if rows > 0:
		cols = (_map[0] as Array).size()
	var w := cols * TILE
	var h := rows * TILE
	_board.custom_minimum_size = Vector2(w, h)
	_board.size = Vector2(w, h)
	for y in rows:
		var row: Array = _map[y]
		for x in row.size():
			var t: int = int(row[x])
			var px := x * TILE
			var py := y * TILE
			if t == 1:
				_add_rect(px, py, COLOR_WALL)
			elif t == 3 or t == 5 or t == 6:
				_add_rect(px, py, COLOR_FLOOR)
				_add_rect(px + 8, py + 8, COLOR_TARGET, TILE - 16)
			else:
				_add_rect(px, py, COLOR_FLOOR)
			if t == 2:
				_add_rect(px + 4, py + 4, COLOR_BOX, TILE - 8)
			elif t == 5:
				_add_rect(px + 4, py + 4, COLOR_BOX_OK, TILE - 8)
			if t == 4 or t == 6:
				_add_rect(px + 6, py + 6, COLOR_PLAYER, TILE - 12)

func _add_rect(x: float, y: float, color: Color, size: float = TILE) -> void:
	var r := ColorRect.new()
	r.position = Vector2(x, y)
	r.size = Vector2(size, size)
	r.color = color
	_board.add_child(r)

func _unhandled_input(event: InputEvent) -> void:
	if _won:
		return
	if event is InputEventKey and event.pressed:
		var key_event := event as InputEventKey
		if key_event.keycode == KEY_R:
			_load_level(_level_idx)
			return
		var dir := Vector2i.ZERO
		match key_event.keycode:
			KEY_UP, KEY_W:
				dir = Vector2i(0, -1)
			KEY_DOWN, KEY_S:
				dir = Vector2i(0, 1)
			KEY_LEFT, KEY_A:
				dir = Vector2i(-1, 0)
			KEY_RIGHT, KEY_D:
				dir = Vector2i(1, 0)
			_:
				return
		_try_move(dir)
	if event is InputEventScreenTouch:
		var te := event as InputEventScreenTouch
		if te.pressed:
			_touch_start = te.position
		else:
			_try_swipe(te.position)

var _touch_start := Vector2.ZERO

func _try_swipe(end: Vector2) -> void:
	var delta := end - _touch_start
	if delta.length() < 24.0:
		return
	var dir := Vector2i.ZERO
	if absf(delta.x) > absf(delta.y):
		dir = Vector2i(1, 0) if delta.x > 0 else Vector2i(-1, 0)
	else:
		dir = Vector2i(0, 1) if delta.y > 0 else Vector2i(0, -1)
	_try_move(dir)

func _try_move(dir: Vector2i) -> void:
	var result: Dictionary = PushLevels.try_move(_map, _player, dir)
	if not bool(result.get("ok", false)):
		return
	_map = result["map"] as Array
	_player = result["player"] as Vector2i
	_rebuild()
	if PushLevels.all_boxes_on_target(_map):
		_won = true
		if _level_idx + 1 >= PushLevels.level_count():
			_over_msg.text = "全部通关！"
			_next.visible = false
		else:
			_over_msg.text = "关卡完成！"
			_next.visible = true
		_overlay.visible = true

func _on_retry() -> void:
	_load_level(_level_idx)

func _on_next() -> void:
	if _level_idx + 1 < PushLevels.level_count():
		_load_level(_level_idx + 1)
	else:
		_load_level(0)
