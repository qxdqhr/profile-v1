extends Node2D
## Minimal suika: aim X, drop, merge same levels, danger-line game over.

const WALL := 10.0
const DROP_Y := 75.0
const DANGER_Y := 115.0
const DROP_COOLDOWN_MS := 650
const DANGER_HOLD_MS := 2500
const SAFE_AFTER_SPAWN_MS := 1200
const BOX_W := 360.0
const BOX_H := 640.0

@onready var _fruits: Node2D = $Fruits
@onready var _preview: Polygon2D = $Preview
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _danger: Line2D = $DangerLine

var _score: int = 0
var _next_lv: int = 0
var _current_lv: int = 0
var _drop_locked: bool = false
var _alive: bool = true
var _danger_since: int = -1
var _fruit_scene: PackedScene = preload("res://scenes/fruit.tscn")
var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	_overlay.visible = false
	_build_walls()
	_danger.points = PackedVector2Array([Vector2(WALL, DANGER_Y), Vector2(BOX_W - WALL, DANGER_Y)])
	_danger.default_color = Color(1.0, 0.25, 0.25, 0.7)
	_danger.width = 2.0
	_current_lv = FusionData.random_drop_lv()
	_next_lv = FusionData.random_drop_lv()
	_update_preview()
	_update_hud()

func _build_walls() -> void:
	_add_static_rect(Vector2(WALL * 0.5, BOX_H * 0.5), Vector2(WALL, BOX_H))
	_add_static_rect(Vector2(BOX_W - WALL * 0.5, BOX_H * 0.5), Vector2(WALL, BOX_H))
	_add_static_rect(Vector2(BOX_W * 0.5, BOX_H - WALL * 0.5), Vector2(BOX_W, WALL))
	# Ceiling to keep high merges from flying out
	_add_static_rect(Vector2(BOX_W * 0.5, WALL * 0.5), Vector2(BOX_W, WALL))

func _add_static_rect(pos: Vector2, size: Vector2) -> void:
	var body := StaticBody2D.new()
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = size
	shape.shape = rect
	body.position = pos
	body.add_child(shape)
	var mat := PhysicsMaterial.new()
	mat.friction = 0.4
	mat.bounce = 0.1
	body.physics_material_override = mat
	var vis := ColorRect.new()
	vis.size = size
	vis.position = -size * 0.5
	vis.color = Color(0.25, 0.35, 0.3)
	body.add_child(vis)
	$Walls.add_child(body)

func _restart() -> void:
	for c in _fruits.get_children():
		c.queue_free()
	_score = 0
	_alive = true
	_drop_locked = false
	_danger_since = -1
	_overlay.visible = false
	_current_lv = FusionData.random_drop_lv()
	_next_lv = FusionData.random_drop_lv()
	_update_preview()
	_update_hud()

func _update_preview() -> void:
	var r := FusionData.radius(_current_lv)
	_preview.color = FusionData.color(_current_lv)
	_preview.polygon = _circle_poly(r, 20)
	_preview.visible = _alive and not _drop_locked

func _circle_poly(r: float, n: int) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n:
		var a := TAU * float(i) / float(n)
		pts.append(Vector2(cos(a), sin(a)) * r)
	return pts

func _update_hud() -> void:
	_hud.text = "分数 %d\n下一颗 Lv%d" % [_score, _next_lv + 1]

func _unhandled_input(event: InputEvent) -> void:
	if not _alive:
		return
	if event is InputEventMouseMotion or event is InputEventScreenDrag:
		_aim_at(_pointer_x(event))
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_try_drop()
	if event is InputEventScreenTouch and event.pressed:
		_aim_at(event.position.x)
		_try_drop()

func _pointer_x(event: InputEvent) -> float:
	if event is InputEventMouse:
		return (event as InputEventMouse).position.x
	if event is InputEventScreenDrag:
		return (event as InputEventScreenDrag).position.x
	return _preview.position.x

func _aim_at(x: float) -> void:
	var r := FusionData.radius(_current_lv)
	var min_x := WALL + r
	var max_x := BOX_W - WALL - r
	_preview.position = Vector2(clampf(x, min_x, max_x), DROP_Y)

func _try_drop() -> void:
	if _drop_locked or not _alive:
		return
	_drop_locked = true
	_preview.visible = false
	var fruit := _spawn_fruit(_current_lv, _preview.position)
	fruit.linear_velocity = Vector2(0, 80)
	_current_lv = _next_lv
	_next_lv = FusionData.random_drop_lv()
	_update_hud()
	get_tree().create_timer(DROP_COOLDOWN_MS / 1000.0).timeout.connect(func() -> void:
		if _alive:
			_drop_locked = false
			_update_preview()
			_aim_at(_preview.position.x)
	)

func _spawn_fruit(lv: int, pos: Vector2) -> RigidBody2D:
	var fruit: RigidBody2D = _fruit_scene.instantiate()
	_fruits.add_child(fruit)
	fruit.global_position = pos
	fruit.setup(lv)
	fruit.merge_wanted.connect(_on_merge_wanted)
	return fruit

func _on_merge_wanted(a: RigidBody2D, b: RigidBody2D) -> void:
	if not _alive:
		return
	if a == null or b == null or not is_instance_valid(a) or not is_instance_valid(b):
		return
	if a.merging or b.merging:
		return
	if a.level != b.level or a.level >= FusionData.MAX_LV:
		return
	a.merging = true
	b.merging = true
	var mid := (a.global_position + b.global_position) * 0.5
	var new_lv: int = a.level + 1
	a.queue_free()
	b.queue_free()
	# Defer spawn one frame so physics settles
	await get_tree().physics_frame
	if not _alive:
		return
	var neu := _spawn_fruit(new_lv, mid)
	neu.linear_velocity = Vector2.ZERO
	_score += FusionData.score(new_lv)
	_update_hud()

func _physics_process(_delta: float) -> void:
	if not _alive:
		return
	var now := Time.get_ticks_msec()
	var danger := false
	for c in _fruits.get_children():
		if not c.has_method("top_y"):
			continue
		if now - c.born_msec < SAFE_AFTER_SPAWN_MS:
			continue
		if c.top_y() < DANGER_Y and c.linear_velocity.length() < 40.0:
			danger = true
			break
	if danger:
		if _danger_since < 0:
			_danger_since = now
		elif now - _danger_since >= DANGER_HOLD_MS:
			_game_over()
	else:
		_danger_since = -1

func _game_over() -> void:
	_alive = false
	_preview.visible = false
	_over_msg.text = "游戏结束\n分数 %d" % _score
	_overlay.visible = true
