extends Control

const TIME_LIMIT := 30.0
const COMBO_WINDOW := 0.8

@onready var _hud: Label = $UI/HUD
@onready var _btn: Button = $Center/Tap
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry
@onready var _pulse: ColorRect = $Pulse

var _score: int = 0
var _combo: int = 0
var _best_combo: int = 0
var _time_left: float = TIME_LIMIT
var _alive: bool = true
var _last_tap: float = -10.0

func _ready() -> void:
	_btn.pressed.connect(_on_tap)
	_retry.pressed.connect(_restart)
	_restart()

func _restart() -> void:
	_score = 0
	_combo = 0
	_best_combo = 0
	_time_left = TIME_LIMIT
	_alive = true
	_last_tap = -10.0
	_overlay.visible = false
	_btn.disabled = false
	_pulse.modulate.a = 0.0
	_update_hud()

func _process(delta: float) -> void:
	if not _alive:
		return
	_time_left -= delta
	if _time_left <= 0.0:
		_time_left = 0.0
		_end()
	_pulse.modulate.a = maxf(0.0, _pulse.modulate.a - delta * 2.5)
	_update_hud()

func _on_tap() -> void:
	if not _alive:
		return
	var now := Time.get_ticks_msec() / 1000.0
	if now - _last_tap <= COMBO_WINDOW:
		_combo += 1
	else:
		_combo = 1
	_last_tap = now
	_best_combo = maxi(_best_combo, _combo)
	_score += 1 + mini(_combo - 1, 9)
	_pulse.modulate.a = 0.45
	_btn.scale = Vector2(1.08, 1.08)
	get_tree().create_timer(0.08).timeout.connect(func() -> void: _btn.scale = Vector2.ONE)
	_update_hud()

func _update_hud() -> void:
	_hud.text = "分数 %d\n连击 %d（最高 %d）\n剩余 %.1fs" % [_score, _combo, _best_combo, _time_left]

func _end() -> void:
	_alive = false
	_btn.disabled = true
	_over_msg.text = "时间到\n分数 %d\n最高连击 %d" % [_score, _best_combo]
	_overlay.visible = true
