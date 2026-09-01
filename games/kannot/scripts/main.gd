extends Node2D

const LANES := 4
const HIT_Y := 540.0
const NOTE_SPEED := 280.0
const PERFECT := 28.0
const GOOD := 55.0
const SONG_LEN := 45.0

@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _notes_root: Node2D = $Notes
@onready var _hit_line: ColorRect = $HitLine

var _lane_xs: Array[float] = []
var _score: int = 0
var _combo: int = 0
var _elapsed: float = 0.0
var _spawn_cd: float = 0.0
var _alive: bool = true
var _rng := RandomNumberGenerator.new()
var _lane_btns: Array[Button] = []

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	var spacing := 360.0 / float(LANES + 1)
	for i in LANES:
		_lane_xs.append(spacing * float(i + 1))
		var b := Button.new()
		b.text = str(i + 1)
		b.size = Vector2(70, 56)
		b.position = Vector2(_lane_xs[i] - 35, 575)
		var lane := i
		b.pressed.connect(func() -> void: _hit(lane))
		$UI.add_child(b)
		_lane_btns.append(b)
	_hit_line.position = Vector2(0, HIT_Y - 2)
	_hit_line.size = Vector2(360, 4)
	_restart()

func _restart() -> void:
	for c in _notes_root.get_children():
		c.queue_free()
	_score = 0
	_combo = 0
	_elapsed = 0.0
	_spawn_cd = 0.6
	_alive = true
	_overlay.visible = false
	_update_hud()

func _process(delta: float) -> void:
	if not _alive:
		return
	_elapsed += delta
	_spawn_cd -= delta
	if _spawn_cd <= 0.0 and _elapsed < SONG_LEN - 2.0:
		_spawn_note()
		_spawn_cd = _rng.randf_range(0.35, 0.85)
	for c in _notes_root.get_children():
		var n := c as ColorRect
		n.position.y += NOTE_SPEED * delta
		if n.position.y > HIT_Y + 80.0:
			_combo = 0
			n.queue_free()
			_update_hud()
	if _elapsed >= SONG_LEN:
		_end()

func _spawn_note() -> void:
	var lane := _rng.randi_range(0, LANES - 1)
	var r := ColorRect.new()
	r.size = Vector2(48, 20)
	r.color = Color(0.95, 0.75, 0.35)
	r.position = Vector2(_lane_xs[lane] - 24, -24)
	r.set_meta("lane", lane)
	_notes_root.add_child(r)

func _hit(lane: int) -> void:
	if not _alive:
		return
	var best: ColorRect = null
	var best_dist := 9999.0
	for c in _notes_root.get_children():
		var n := c as ColorRect
		if int(n.get_meta("lane")) != lane:
			continue
		var cy := n.position.y + 10.0
		var d := absf(cy - HIT_Y)
		if d < best_dist:
			best_dist = d
			best = n
	if best == null or best_dist > GOOD:
		_combo = 0
		_update_hud()
		return
	if best_dist <= PERFECT:
		_score += 100
		_combo += 1
	else:
		_score += 50
		_combo += 1
	_score += mini(_combo, 20)
	best.queue_free()
	_update_hud()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_1, KEY_D:
				_hit(0)
			KEY_2, KEY_F:
				_hit(1)
			KEY_3, KEY_J:
				_hit(2)
			KEY_4, KEY_K:
				_hit(3)

func _update_hud() -> void:
	_hud.text = "分数 %d  连击 %d\n剩余 %.0fs\n1–4 / 点按钮" % [_score, _combo, maxf(0.0, SONG_LEN - _elapsed)]

func _end() -> void:
	_alive = false
	_over_msg.text = "结束\n分数 %d" % _score
	_overlay.visible = true
