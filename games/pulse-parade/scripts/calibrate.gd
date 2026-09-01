extends Control
## Simple latency calibration: tap on the flash + beep.

@onready var _pulse: ColorRect = $Pulse
@onready var _info: Label = $Info
@onready var _done: Button = $DoneButton

var _targets: Array[float] = []
var _samples: Array[float] = []
var _next_i: int = 0
var _waiting: bool = false
var _flash_until: float = 0.0
var _beep: AudioStreamPlayer

func _ready() -> void:
	_done.pressed.connect(func() -> void:
		get_tree().change_scene_to_file("res://scenes/title.tscn")
	)
	_beep = AudioStreamPlayer.new()
	add_child(_beep)
	_beep.stream = _make_beep()
	# Schedule 8 pulses every 1s after 1.5s lead-in.
	var t := 1.5
	for i in 8:
		_targets.append(t)
		t += 1.0
	_info.text = "看到闪光并听到哔声时立刻点按（共 8 次）"
	set_process(true)
	if not InputRouter.tapped.is_connected(_on_tap):
		InputRouter.tapped.connect(_on_tap)

func _exit_tree() -> void:
	if InputRouter.tapped.is_connected(_on_tap):
		InputRouter.tapped.disconnect(_on_tap)

func _process(_delta: float) -> void:
	var now := float(Time.get_ticks_msec()) / 1000.0
	if _pulse.visible and now >= _flash_until:
		_pulse.visible = false
	if _next_i >= _targets.size():
		return
	# Use wall clock since no song is playing.
	var start_sec := 0.0
	if not has_meta("t0"):
		set_meta("t0", now)
		start_sec = now
	else:
		start_sec = float(get_meta("t0"))
	var elapsed := now - start_sec
	if elapsed >= _targets[_next_i] and not _waiting:
		_waiting = true
		_pulse.visible = true
		_flash_until = now + 0.12
		_beep.play()
		set_meta("pulse_at", now)

func _on_tap(_at_ms: float) -> void:
	if not _waiting or _next_i >= _targets.size():
		return
	var pulse_at := float(get_meta("pulse_at"))
	var now := float(Time.get_ticks_msec()) / 1000.0
	var delta_ms := (now - pulse_at) * 1000.0
	_samples.append(delta_ms)
	_waiting = false
	_next_i += 1
	_info.text = "采样 %d/8  本次 %+0.0f ms" % [_next_i, delta_ms]
	if _next_i >= _targets.size():
		_finish()

func _finish() -> void:
	var avg := 0.0
	for s in _samples:
		avg += s
	avg /= float(_samples.size())
	# Player tapped late by avg ms → subtract that from song clock (negative offset).
	SaveData.audio_offset_ms = -avg
	SaveData.calibrated = true
	SaveData.save()
	_info.text = "完成。平均反应 %+0.0f ms，已写入偏移 %.0f ms\n点返回继续" % [avg, SaveData.audio_offset_ms]

func _make_beep() -> AudioStreamWAV:
	var sample_rate := 22050
	var duration := 0.08
	var freq := 880.0
	var n := int(sample_rate * duration)
	var data := PackedByteArray()
	data.resize(n * 2)
	for i in n:
		var t := float(i) / float(sample_rate)
		var env := 1.0 - t / duration
		var s := int(sin(TAU * freq * t) * 0.35 * env * 32767.0)
		data[i * 2] = s & 0xFF
		data[i * 2 + 1] = (s >> 8) & 0xFF
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = data
	return stream
