extends Node2D
## Flappy core loop with procedural shapes (no third-party art).

const GROUND_H := 96.0
const BIRD_X := 110.0
const PIPE_W := 64.0
const COIN_R := 12.0

@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_label: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _home: Button = $UI/Overlay/VBox/Home
@onready var _bird: CharacterBody2D = $Bird
@onready var _bird_visual: Polygon2D = $Bird/Visual
@onready var _pipes: Node2D = $Pipes
@onready var _coins: Node2D = $Coins
@onready var _ground: ColorRect = $Ground
@onready var _sky: ColorRect = $Sky

var _vy: float = 0.0
var _alive: bool = false
var _started: bool = false
var _score: int = 0
var _dist_since_spawn: float = 0.0
var _cfg: Dictionary = {}
var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_cfg = GameConfig.get_diff()
	_overlay.visible = false
	_retry.pressed.connect(_restart)
	_home.pressed.connect(func() -> void:
		get_tree().change_scene_to_file("res://scenes/title.tscn")
	)
	_sky.color = Color(0.45, 0.72, 0.95)
	_ground.color = Color(0.35, 0.7, 0.35)
	_ground.position = Vector2(0, 720.0 - GROUND_H)
	_ground.size = Vector2(405, GROUND_H)
	_reset_bird()
	_update_hud()
	_hud.text = "点按 / 空格 起飞\n%s" % str(_cfg["label"])

func _restart() -> void:
	get_tree().reload_current_scene()

func _reset_bird() -> void:
	_bird.position = Vector2(BIRD_X, 320)
	_vy = 0.0
	_alive = true
	_started = false
	_score = 0
	_dist_since_spawn = 9999.0
	for c in _pipes.get_children():
		c.queue_free()
	for c in _coins.get_children():
		c.queue_free()
	_bird_visual.color = _cfg["color"]
	var s: float = float(_cfg["hitbox_scale"])
	_bird_visual.scale = Vector2(s, s)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("flap") or (event is InputEventScreenTouch and event.pressed):
		_flap()
		get_viewport().set_input_as_handled()

func _flap() -> void:
	if not _alive:
		return
	if not _started:
		_started = true
		_hud.text = "0"
	_vy = float(_cfg["flap_impulse"])

func _physics_process(delta: float) -> void:
	if not _alive:
		return
	if not _started:
		_bird.position.y = 320.0 + sin(Time.get_ticks_msec() / 220.0) * 8.0
		return

	_vy = minf(_vy + float(_cfg["gravity"]) * delta, float(_cfg["max_fall"]))
	_bird.position.y += _vy * delta

	var speed: float = float(_cfg["pipe_speed"])
	_dist_since_spawn += speed * delta
	if _dist_since_spawn >= float(_cfg["spawn_distance"]):
		_dist_since_spawn = 0.0
		_spawn_pipe_pair()

	for p in _pipes.get_children():
		p.position.x -= speed * delta
		if p.get_meta("scored", false) == false and p.position.x + PIPE_W < BIRD_X:
			p.set_meta("scored", true)
			_score += GameConfig.PIPE_SCORE
			_update_hud()
		if p.position.x < -PIPE_W - 20.0:
			p.queue_free()

	for c in _coins.get_children():
		c.position.x -= speed * delta
		if c.position.x < -40.0:
			c.queue_free()
			continue
		if _bird.position.distance_to(c.position) < 28.0:
			_score += GameConfig.COIN_SCORE
			_update_hud()
			c.queue_free()

	if _collides():
		_die()

func _spawn_pipe_pair() -> void:
	var gap: float = float(_cfg["pipe_gap"])
	var playable_h := 720.0 - GROUND_H
	var margin := 40.0
	var gap_y := _rng.randf_range(margin + gap * 0.5, playable_h - margin - gap * 0.5)
	var x := 420.0

	var pair := Node2D.new()
	pair.position = Vector2(x, 0)
	pair.set_meta("scored", false)
	pair.set_meta("gap_y", gap_y)
	pair.set_meta("gap", gap)
	_pipes.add_child(pair)

	var top := ColorRect.new()
	top.color = Color(0.22, 0.55, 0.28)
	top.size = Vector2(PIPE_W, gap_y - gap * 0.5)
	top.position = Vector2(0, 0)
	pair.add_child(top)

	var bot := ColorRect.new()
	bot.color = Color(0.22, 0.55, 0.28)
	var bot_top := gap_y + gap * 0.5
	bot.position = Vector2(0, bot_top)
	bot.size = Vector2(PIPE_W, playable_h - bot_top)
	pair.add_child(bot)

	# Cap accents
	for y in [gap_y - gap * 0.5 - 12.0, bot_top]:
		var cap := ColorRect.new()
		cap.color = Color(0.18, 0.45, 0.22)
		cap.position = Vector2(-4, y)
		cap.size = Vector2(PIPE_W + 8, 12)
		pair.add_child(cap)

	if _rng.randf() < 0.45:
		var coin := Polygon2D.new()
		coin.color = Color(1.0, 0.85, 0.2)
		coin.polygon = PackedVector2Array([
			Vector2(0, -COIN_R), Vector2(COIN_R, 0), Vector2(0, COIN_R), Vector2(-COIN_R, 0)
		])
		coin.position = Vector2(x + PIPE_W * 0.5, gap_y)
		_coins.add_child(coin)

func _collides() -> bool:
	var playable_h := 720.0 - GROUND_H
	var r := 18.0 * float(_cfg["hitbox_scale"])
	if _bird.position.y - r < 0.0 or _bird.position.y + r > playable_h:
		return true
	for p in _pipes.get_children():
		var gap_y: float = float(p.get_meta("gap_y"))
		var gap: float = float(p.get_meta("gap"))
		var px: float = p.position.x
		if _bird.position.x + r < px or _bird.position.x - r > px + PIPE_W:
			continue
		var top_h := gap_y - gap * 0.5
		var bot_y := gap_y + gap * 0.5
		if _bird.position.y - r < top_h or _bird.position.y + r > bot_y:
			return true
	return false

func _die() -> void:
	_alive = false
	var rec: Dictionary = SaveData.record(GameConfig.current_id, _score)
	_overlay.visible = true
	var msg := "得分 %d\n最佳 %d" % [_score, int(rec["best"])]
	if bool(rec["is_new"]):
		msg += "\n新纪录!"
	_over_label.text = msg

func _update_hud() -> void:
	if _started and _alive:
		_hud.text = str(_score)
