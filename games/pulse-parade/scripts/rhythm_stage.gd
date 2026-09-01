extends Control

@onready var _hud: Label = $HUD
@onready var _feedback: Label = $Feedback
@onready var _beat: ColorRect = $BeatCue
@onready var _tap_hint: Label = $TapHint

var _engine: Node
var _metronome: AudioStreamPlayer
var _hit_sfx: AudioStreamPlayer
var _chart: ChartData
var _feedback_ttl: float = 0.0
var _lead_beats_played: int = -1

func _ready() -> void:
	_tap_hint.text = "点按屏幕 / Space / Z"
	_feedback.text = ""
	_engine = preload("res://scripts/rhythm_engine.gd").new()
	add_child(_engine)
	_engine.note_hit.connect(_on_hit)
	_engine.note_missed.connect(_on_miss)
	_engine.chart_completed.connect(_on_completed)

	_metronome = AudioStreamPlayer.new()
	_hit_sfx = AudioStreamPlayer.new()
	add_child(_metronome)
	add_child(_hit_sfx)
	_metronome.stream = _make_tone(660.0, 0.05, 0.25)
	_hit_sfx.stream = _make_tone(990.0, 0.04, 0.3)

	_chart = ChartData.from_json_path("res://resources/charts/demo_tap.json")
	if _chart.notes.is_empty():
		_chart = ChartData.make_demo(120.0, 8, 4)

	# No music bed yet: drive clock with system-time fallback + known length.
	AudioClock.play_stream(null, 0.0, _chart.duration_ms / 1000.0)
	_engine.start(_chart)
	_update_hud()

func _process(delta: float) -> void:
	if _feedback_ttl > 0.0:
		_feedback_ttl -= delta
		if _feedback_ttl <= 0.0:
			_feedback.text = ""
	_update_beat_cue()
	# Poll clock so fallback length can emit song_finished.
	AudioClock.get_song_time_ms()

func _update_beat_cue() -> void:
	var beat_ms := 60000.0 / maxf(_chart.bpm, 1.0)
	var t := AudioClock.get_song_time_ms()
	var beat_i := int(floor(t / beat_ms))
	var phase := fposmod(t, beat_ms) / beat_ms
	var pulse := 1.0 - clampf(phase * 4.0, 0.0, 1.0)
	_beat.modulate.a = 0.15 + pulse * 0.55
	if beat_i != _lead_beats_played and phase < 0.05:
		_lead_beats_played = beat_i
		_metronome.play()

func _on_hit(grade: Judgement.Grade, _index: int, delta_ms: float) -> void:
	_hit_sfx.play()
	_show_feedback("%s  %+0.0fms" % [Judgement.grade_name(grade), delta_ms], _grade_color(grade))
	_update_hud()

func _on_miss(_index: int) -> void:
	_show_feedback("MISS", Color(1.0, 0.35, 0.35))
	_update_hud()

func _on_completed(stats: Dictionary) -> void:
	# Stash for result scene.
	get_tree().set_meta("last_result", stats)
	get_tree().change_scene_to_file("res://scenes/result.tscn")

func _update_hud() -> void:
	var c: Dictionary = _engine._counts
	_hud.text = "PERF %d  GR %d  OK %d  MISS %d   COMBO %d" % [
		int(c.get("perfect", 0)),
		int(c.get("great", 0)),
		int(c.get("ok", 0)),
		int(c.get("miss", 0)),
		int(_engine._combo),
	]

func _show_feedback(text: String, color: Color) -> void:
	_feedback.text = text
	_feedback.modulate = color
	_feedback_ttl = 0.45

func _grade_color(grade: Judgement.Grade) -> Color:
	match grade:
		Judgement.Grade.PERFECT:
			return Color(1.0, 0.92, 0.35)
		Judgement.Grade.GREAT:
			return Color(0.45, 0.95, 0.55)
		Judgement.Grade.OK:
			return Color(0.55, 0.75, 1.0)
		_:
			return Color(1.0, 0.4, 0.4)

func _make_tone(freq: float, duration: float, amp: float) -> AudioStreamWAV:
	var sample_rate := 22050
	var n := int(sample_rate * duration)
	var data := PackedByteArray()
	data.resize(n * 2)
	for i in n:
		var t := float(i) / float(sample_rate)
		var env := 1.0 - t / duration
		var s := int(sin(TAU * freq * t) * amp * env * 32767.0)
		data[i * 2] = s & 0xFF
		data[i * 2 + 1] = (s >> 8) & 0xFF
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = data
	return stream
