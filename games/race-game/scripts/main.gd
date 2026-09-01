extends Node2D

const W := 360.0
const H := 640.0
const LANES := 4
const CAR_W := 36.0
const CAR_H := 52.0
const OBS_W := 40.0
const OBS_H := 40.0
const COIN_R := 12.0
const MIN_Y := 80.0
const MAX_Y := 520.0
const VERT_SPEED := 10.0
const BASE_SPEED := 180.0
const MAX_SPEED := 420.0
const SPEED_UP_EVERY := 12.0
const SPEED_UP_RATE := 28.0
const SPAWN_BASE := 1.4
const SPAWN_MIN := 0.7
const COIN_EVERY := 2.8

@onready var _car: ColorRect = $Car
@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _obstacles: Node2D = $Obstacles
@onready var _coins: Node2D = $Coins
@onready var _lanes_vis: Node2D = $Lanes

var _lane: int = 1
var _car_y: float = MAX_Y
var _speed: float = BASE_SPEED
var _spawn_iv: float = SPAWN_BASE
var _spawn_cd: float = 0.0
var _coin_cd: float = 1.0
var _score: int = 0
var _score_acc: float = 0.0
var _speed_timer: float = 0.0
var _alive: bool = true
var _rng := RandomNumberGenerator.new()
var _lane_xs: Array[float] = []

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	_build_lanes()
	_restart()

func _build_lanes() -> void:
	_lane_xs.clear()
	var spacing := W / float(LANES + 1)
	for i in LANES:
		_lane_xs.append(spacing * float(i + 1))
	for x in _lane_xs:
		var line := ColorRect.new()
		line.color = Color(1, 1, 1, 0.12)
		line.size = Vector2(2, H)
		line.position = Vector2(x - 1, 0)
		_lanes_vis.add_child(line)

func _restart() -> void:
	for c in _obstacles.get_children():
		c.queue_free()
	for c in _coins.get_children():
		c.queue_free()
	_lane = 1
	_car_y = MAX_Y
	_speed = BASE_SPEED
	_spawn_iv = SPAWN_BASE
	_spawn_cd = 0.5
	_coin_cd = 1.5
	_score = 0
	_score_acc = 0.0
	_speed_timer = 0.0
	_alive = true
	_overlay.visible = false
	_place_car()
	_update_hud()

func _lane_x(i: int) -> float:
	return _lane_xs[clampi(i, 0, LANES - 1)]

func _place_car() -> void:
	_car.size = Vector2(CAR_W, CAR_H)
	_car.position = Vector2(_lane_x(_lane) - CAR_W * 0.5, _car_y - CAR_H * 0.5)
	_car.color = Color(0.3, 0.75, 0.45)

func _update_hud() -> void:
	_hud.text = "分数 %d\n速度 %.0f\n←→ 换道 · ↑↓ 前后 · 点屏左右半边换道" % [_score, _speed]

func _process(delta: float) -> void:
	if not _alive:
		return
	_score_acc += delta * (_speed / BASE_SPEED)
	if _score_acc >= 1.0:
		_score += int(_score_acc)
		_score_acc = 0.0
		_update_hud()
	_speed_timer += delta
	if _speed_timer >= SPEED_UP_EVERY:
		_speed_timer = 0.0
		_speed = minf(MAX_SPEED, _speed + SPEED_UP_RATE)
		_spawn_iv = maxf(SPAWN_MIN, _spawn_iv - 0.08)
		_update_hud()
	_spawn_cd -= delta
	if _spawn_cd <= 0.0:
		_spawn_obstacle()
		_spawn_cd = _spawn_iv
	_coin_cd -= delta
	if _coin_cd <= 0.0:
		_spawn_coin()
		_coin_cd = COIN_EVERY
	_move_entities(delta)
	_check_collisions()

func _spawn_obstacle() -> void:
	var lane := _rng.randi_range(0, LANES - 1)
	var rect := ColorRect.new()
	rect.size = Vector2(OBS_W, OBS_H)
	rect.color = Color(0.85, 0.35, 0.3)
	rect.position = Vector2(_lane_x(lane) - OBS_W * 0.5, -OBS_H)
	rect.set_meta("lane", lane)
	_obstacles.add_child(rect)

func _spawn_coin() -> void:
	var lane := _rng.randi_range(0, LANES - 1)
	var poly := Polygon2D.new()
	poly.color = Color(1.0, 0.84, 0.2)
	var pts := PackedVector2Array()
	for i in 8:
		var a := TAU * float(i) / 8.0
		pts.append(Vector2(cos(a), sin(a)) * COIN_R)
	poly.polygon = pts
	poly.position = Vector2(_lane_x(lane), -COIN_R)
	poly.set_meta("lane", lane)
	poly.set_meta("collected", false)
	_coins.add_child(poly)

func _move_entities(delta: float) -> void:
	var dy := _speed * delta
	for c in _obstacles.get_children():
		var r := c as ColorRect
		r.position.y += dy
		if r.position.y > H:
			r.queue_free()
	for c in _coins.get_children():
		var p := c as Polygon2D
		if bool(p.get_meta("collected", false)):
			continue
		p.position.y += dy
		if p.position.y > H:
			p.queue_free()

func _check_collisions() -> void:
	var car_rect := Rect2(_car.position, _car.size)
	for c in _obstacles.get_children():
		var r := c as ColorRect
		if car_rect.intersects(Rect2(r.position, r.size)):
			_game_over()
			return
	for c in _coins.get_children():
		var p := c as Polygon2D
		if bool(p.get_meta("collected", false)):
			continue
		var coin_rect := Rect2(p.position - Vector2(COIN_R, COIN_R), Vector2(COIN_R * 2, COIN_R * 2))
		if car_rect.intersects(coin_rect):
			p.set_meta("collected", true)
			p.queue_free()
			_score += 10
			_update_hud()

func _game_over() -> void:
	_alive = false
	_over_msg.text = "撞车！\n分数 %d" % _score
	_overlay.visible = true

func _unhandled_input(event: InputEvent) -> void:
	if not _alive:
		return
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_LEFT, KEY_A:
				_lane = maxi(0, _lane - 1)
			KEY_RIGHT, KEY_D:
				_lane = mini(LANES - 1, _lane + 1)
			KEY_UP, KEY_W:
				_car_y = maxf(MIN_Y, _car_y - VERT_SPEED * 4.0)
			KEY_DOWN, KEY_S:
				_car_y = minf(MAX_Y, _car_y + VERT_SPEED * 4.0)
			_:
				return
		_place_car()
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if event.position.x < W * 0.5:
			_lane = maxi(0, _lane - 1)
		else:
			_lane = mini(LANES - 1, _lane + 1)
		_place_car()
	if event is InputEventScreenTouch and event.pressed:
		if event.position.x < W * 0.5:
			_lane = maxi(0, _lane - 1)
		else:
			_lane = mini(LANES - 1, _lane + 1)
		_place_car()
