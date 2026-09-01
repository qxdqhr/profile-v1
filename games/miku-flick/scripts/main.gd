extends Control
## Minimal Miku Flick — kana key + flick direction rhythm MVP.

enum Status { READY, PLAYING, PAUSED, ENDED }

const W := 360.0
const H := 640.0
const HIT_Y := 420.0
const TOP_Y := 120.0

var _notes: Array = []
var _status: Status = Status.READY
var _score: Dictionary = {}
var _now_ms: int = 0
var _start_usec: int = 0
var _paused_accum: int = 0
var _pause_at: int = 0
var _feedback: String = "点击开始，然后在假名键上滑动"

var _pointer_kana: String = ""
var _pointer_start: Vector2 = Vector2.ZERO
var _kana_buttons: Array[Button] = []

@onready var _lane: Control = $Lane
@onready var _hud: Label = $UI/HUD
@onready var _feedback_label: Label = $UI/Feedback
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _start_btn: Button = $UI/Overlay/VBox/StartBtn
@onready var _retry_btn: Button = $UI/Overlay/VBox/RetryBtn
@onready var _kana_row: HBoxContainer = $UI/KanaRow

func _ready() -> void:
	custom_minimum_size = Vector2(W, H)
	size = Vector2(W, H)
	_start_btn.pressed.connect(_on_start)
	_retry_btn.pressed.connect(_on_retry)
	_overlay.visible = true
	_over_msg.text = "Miku Flick\nGodot 最简"
	_start_btn.visible = true
	_retry_btn.visible = false
	_build_kana_keys()
	_reset_chart()
	_lane.draw.connect(_draw_lane)

func _build_kana_keys() -> void:
	for k in FlickConfig.KANA_KEYS:
		var b := Button.new()
		b.text = k
		b.custom_minimum_size = Vector2(32, 40)
		b.focus_mode = Control.FOCUS_NONE
		b.gui_input.connect(_on_kana_gui_input.bind(k))
		_kana_row.add_child(b)
		_kana_buttons.append(b)

func _reset_chart() -> void:
	_notes = FlickLogic.build_phrase_chart()
	_score = FlickLogic.initial_score()
	_now_ms = 0
	_status = Status.READY
	_update_ui()

func _on_start() -> void:
	_notes = FlickLogic.build_phrase_chart()
	_score = FlickLogic.initial_score()
	_now_ms = 0
	_start_usec = Time.get_ticks_usec()
	_paused_accum = 0
	_status = Status.PLAYING
	_overlay.visible = false
	_feedback = "开始！按音符在对应假名键上滑动"
	_update_ui()

func _on_retry() -> void:
	_reset_chart()
	_overlay.visible = true
	_over_msg.text = "Miku Flick\nGodot 最简"
	_start_btn.visible = true
	_retry_btn.visible = false

func _process(_delta: float) -> void:
	if _status != Status.PLAYING:
		return
	_now_ms = int((Time.get_ticks_usec() - _start_usec) / 1000) - _paused_accum
	var missed: Array = FlickLogic.sweep_missed(_notes, _now_ms)
	for r in missed:
		_score = FlickLogic.apply_score(_score, r)
		_feedback = "Miss"
	if _all_judged():
		_status = Status.ENDED
		_overlay.visible = true
		_over_msg.text = "谱面结束\n分数 %d  MaxCombo %d" % [int(_score.score), int(_score.max_combo)]
		_start_btn.visible = false
		_retry_btn.visible = true
	_lane.queue_redraw()
	_update_ui()

func _all_judged() -> bool:
	for n in _notes:
		if not n.judged:
			return false
	return true

func _on_kana_gui_input(event: InputEvent, kana: String) -> void:
	if _status != Status.PLAYING:
		return
	if event is InputEventMouseButton:
		var e := event as InputEventMouseButton
		if e.button_index != MOUSE_BUTTON_LEFT:
			return
		if e.pressed:
			_pointer_kana = kana
			_pointer_start = e.position
		elif _pointer_kana == kana:
			var dir: String = FlickLogic.detect_flick(_pointer_start.x, _pointer_start.y, e.position.x, e.position.y)
			if dir.is_empty():
				_feedback = "滑动距离不足"
			else:
				_submit(kana, dir)
			_pointer_kana = ""
	elif event is InputEventScreenTouch:
		var e := event as InputEventScreenTouch
		if e.pressed:
			_pointer_kana = kana
			_pointer_start = e.position
		elif _pointer_kana == kana:
			var dir2: String = FlickLogic.detect_flick(_pointer_start.x, _pointer_start.y, e.position.x, e.position.y)
			if dir2.is_empty():
				_feedback = "滑动距离不足"
			else:
				_submit(kana, dir2)
			_pointer_kana = ""

func _submit(kana: String, direction: String) -> void:
	var result: Dictionary = FlickLogic.judge_input(_notes, kana, direction, _now_ms)
	_score = FlickLogic.apply_score(_score, result)
	if result.ok:
		var g: String = str(result.grade)
		var gt := "Perfect" if g == "perfect" else ("Great" if g == "great" else "Good")
		_feedback = "%s %s%s" % [gt, kana, FlickConfig.arrow(direction)]
	else:
		var expected: Variant = _next_note()
		if expected != null:
			var ex: Dictionary = expected
			_feedback = "Miss 预期 %s%s" % [ex.kana, FlickConfig.arrow(str(ex.direction))]
		else:
			_feedback = "Miss"
	_lane.queue_redraw()
	_update_ui()

func _next_note() -> Variant:
	for n in _notes:
		if not n.judged:
			return n
	return null

func _update_ui() -> void:
	_hud.text = "分数 %d  连击 %d  Max %d\nP:%d G:%d B:%d M:%d" % [
		int(_score.score), int(_score.combo), int(_score.max_combo),
		int(_score.perfect), int(_score.great), int(_score.good), int(_score.miss),
	]
	_feedback_label.text = _feedback

func _draw_lane() -> void:
	var c := _lane
	# Hit line
	c.draw_line(Vector2(16, HIT_Y), Vector2(W - 16, HIT_Y), Color(0.2, 0.7, 0.95), 3.0)
	for n in _notes:
		if n.judged:
			continue
		var delta := int(n.time_ms) - _now_ms
		if delta > FlickConfig.PREVIEW_WINDOW_MS or delta < -FlickConfig.MISS_MS:
			continue
		var t := float(delta) / FlickConfig.SCROLL_WINDOW_MS
		var y := HIT_Y - t * (HIT_Y - TOP_Y)
		var x := W * 0.5
		var col := Color(0.98, 0.45, 0.75) if delta >= -FlickConfig.GOOD_MS else Color(0.6, 0.6, 0.65, 0.5)
		c.draw_circle(Vector2(x, y), 22, col)
		c.draw_string(ThemeDB.fallback_font, Vector2(x - 10, y + 6), str(n.kana), HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color.WHITE)
		c.draw_string(ThemeDB.fallback_font, Vector2(x + 14, y + 6), FlickConfig.arrow(str(n.direction)), HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color(0.9, 1, 1))
