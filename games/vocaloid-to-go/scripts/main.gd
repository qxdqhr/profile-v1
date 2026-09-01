extends Control

const WORDS := ["みく", "みく", "に", "して", "あげる", "うた", "おと", "ほし", "そら", "ゆめ", "あい", "とき"]
const CHOICES := 4
const ROUNDS := 12
const ROUND_TIME := 4.0

@onready var _hud: Label = $UI/HUD
@onready var _prompt: Label = $Center/VBox/Prompt
@onready var _choices: VBoxContainer = $Center/VBox/Choices
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry

var _score: int = 0
var _combo: int = 0
var _round: int = 0
var _target: String = ""
var _time_left: float = ROUND_TIME
var _alive: bool = true
var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	_restart()

func _restart() -> void:
	_score = 0
	_combo = 0
	_round = 0
	_alive = true
	_overlay.visible = false
	_next_round()

func _process(delta: float) -> void:
	if not _alive:
		return
	_time_left -= delta
	_update_hud()
	if _time_left <= 0.0:
		_combo = 0
		_advance(false)

func _next_round() -> void:
	_round += 1
	if _round > ROUNDS:
		_end()
		return
	_time_left = ROUND_TIME
	_target = WORDS[_rng.randi_range(0, WORDS.size() - 1)]
	_prompt.text = "点选：%s" % _target
	for c in _choices.get_children():
		c.queue_free()
	var opts: Array[String] = [_target]
	while opts.size() < CHOICES:
		var w: String = WORDS[_rng.randi_range(0, WORDS.size() - 1)]
		if not opts.has(w):
			opts.append(w)
	opts.shuffle()
	for w in opts:
		var b := Button.new()
		b.text = w
		b.custom_minimum_size = Vector2(220, 48)
		var word := w
		b.pressed.connect(func() -> void: _pick(word))
		_choices.add_child(b)
	_update_hud()

func _pick(word: String) -> void:
	if not _alive:
		return
	if word == _target:
		_combo += 1
		_score += 50 + mini(_combo, 10) * 5
		_advance(true)
	else:
		_combo = 0
		_advance(false)

func _advance(_ok: bool) -> void:
	_next_round()

func _update_hud() -> void:
	_hud.text = "分数 %d  连击 %d\n第 %d / %d  剩余 %.1fs" % [_score, _combo, mini(_round, ROUNDS), ROUNDS, maxf(0.0, _time_left)]

func _end() -> void:
	_alive = false
	_over_msg.text = "冲关结束\n分数 %d" % _score
	_overlay.visible = true
