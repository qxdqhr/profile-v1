extends Node2D

enum HookState { SWING, EXTEND, RETRACT }

const ORIGIN := Vector2(180, 55)
const MIN_LEN := 40.0
const MAX_LEN := 520.0
const TARGET_SCORE := 200
const TIME_LIMIT := 60

const ITEMS := [
	{"type": "gold", "value": 100, "weight": 1.0, "color": Color(1.0, 0.84, 0.0), "size": Vector2(30, 30)},
	{"type": "stone", "value": 20, "weight": 2.0, "color": Color(0.5, 0.5, 0.52), "size": Vector2(40, 40)},
	{"type": "diamond", "value": 200, "weight": 0.5, "color": Color(0.2, 0.95, 0.95), "size": Vector2(20, 20)},
]

@onready var _hook_line: Line2D = $HookLine
@onready var _hook_head: Polygon2D = $HookHead
@onready var _items_root: Node2D = $Items
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry

var _angle_deg: float = 90.0
var _angle_speed: float = 2.0
var _hook_len: float = MIN_LEN
var _state: HookState = HookState.SWING
var _score: int = 0
var _time_left: int = TIME_LIMIT
var _alive: bool = true
var _caught: Area2D = null
var _rng := RandomNumberGenerator.new()
var _items: Array[Area2D] = []
var _timer: Timer = null

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	_timer = Timer.new()
	_timer.wait_time = 1.0
	_timer.autostart = true
	_timer.timeout.connect(_on_timer_tick)
	add_child(_timer)
	_restart()

func _restart() -> void:
	for c in _items_root.get_children():
		c.queue_free()
	_items.clear()
	_score = 0
	_time_left = TIME_LIMIT
	_alive = true
	_state = HookState.SWING
	_hook_len = MIN_LEN
	_angle_deg = 90.0
	_angle_speed = 2.0
	_caught = null
	_overlay.visible = false
	_spawn_items()
	_update_hud()

func _spawn_items() -> void:
	var count := 12
	for i in count:
		var cfg: Dictionary = ITEMS[_rng.randi_range(0, ITEMS.size() - 1)]
		var area := Area2D.new()
		var shape := CollisionShape2D.new()
		var rect := RectangleShape2D.new()
		var sz: Vector2 = cfg["size"] as Vector2
		rect.size = sz
		shape.shape = rect
		area.add_child(shape)
		var vis := ColorRect.new()
		vis.size = sz
		vis.position = -sz * 0.5
		vis.color = cfg["color"] as Color
		vis.mouse_filter = Control.MOUSE_FILTER_IGNORE
		area.add_child(vis)
		var px := _rng.randf_range(60, 300)
		var py := _rng.randf_range(180, 560)
		area.position = Vector2(px, py)
		area.set_meta("value", int(cfg["value"]))
		area.set_meta("weight", float(cfg["weight"]))
		area.set_meta("visible_flag", true)
		_items_root.add_child(area)
		_items.append(area)

func _update_hud() -> void:
	_hud.text = "分数 %d / %d\n时间 %d\n点击发射钩子" % [_score, TARGET_SCORE, _time_left]

func _process(delta: float) -> void:
	if not _alive:
		return
	match _state:
		HookState.SWING:
			_angle_deg += _angle_speed
			if _angle_deg >= 135.0 or _angle_deg <= 45.0:
				_angle_speed = -_angle_speed
		HookState.EXTEND:
			var extend_speed := 280.0
			_hook_len = minf(_hook_len + extend_speed * delta, MAX_LEN)
			if _hook_len >= MAX_LEN:
				_state = HookState.RETRACT
			else:
				_check_hit()
		HookState.RETRACT:
			var weight := 1.0
			if _caught != null and is_instance_valid(_caught):
				weight = float(_caught.get_meta("weight", 1.0))
			var retract_speed := 180.0 / weight
			_hook_len = maxf(_hook_len - retract_speed * delta, MIN_LEN)
			if _caught != null and is_instance_valid(_caught):
				_caught.global_position = _hook_tip()
			if _hook_len <= MIN_LEN:
				if _caught != null and is_instance_valid(_caught):
					_score += int(_caught.get_meta("value", 0))
					_caught.queue_free()
					_items.erase(_caught)
					_caught = null
					_update_hud()
					if _score >= TARGET_SCORE:
						_win()
				_state = HookState.SWING
	_update_hook_visual()

func _hook_tip() -> Vector2:
	var rad := deg_to_rad(_angle_deg)
	return ORIGIN + Vector2(cos(rad), sin(rad)) * _hook_len

func _update_hook_visual() -> void:
	var tip := _hook_tip()
	_hook_line.points = PackedVector2Array([ORIGIN, tip])
	_hook_head.position = tip

func _check_hit() -> void:
	var tip := _hook_tip()
	for area in _items:
		if not is_instance_valid(area):
			continue
		if not bool(area.get_meta("visible_flag", true)):
			continue
		var shape_node := area.get_child(0) as CollisionShape2D
		var rect_shape := shape_node.shape as RectangleShape2D
		var sz: Vector2 = rect_shape.size
		var rect := Rect2(area.global_position - sz * 0.5, sz)
		if rect.has_point(tip):
			_caught = area
			area.set_meta("visible_flag", false)
			(area.get_child(1) as ColorRect).visible = false
			(area.get_child(0) as CollisionShape2D).disabled = true
			_state = HookState.RETRACT
			break

func _unhandled_input(event: InputEvent) -> void:
	if not _alive or _state != HookState.SWING:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_state = HookState.EXTEND
	if event is InputEventScreenTouch and event.pressed:
		_state = HookState.EXTEND
	if event is InputEventKey and event.pressed and event.keycode == KEY_SPACE:
		_state = HookState.EXTEND

func _on_timer_tick() -> void:
	if not _alive:
		return
	_time_left -= 1
	_update_hud()
	if _time_left <= 0:
		_game_over(false)

func _win() -> void:
	_alive = false
	_over_msg.text = "过关！\n分数 %d" % _score
	_overlay.visible = true

func _game_over(won: bool) -> void:
	_alive = false
	if won:
		_over_msg.text = "过关！\n分数 %d" % _score
	else:
		_over_msg.text = "时间到\n分数 %d（目标 %d）" % [_score, TARGET_SCORE]
	_overlay.visible = true