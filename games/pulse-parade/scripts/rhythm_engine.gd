extends Node
## Runs a pure-tap chart against AudioClock + Judgement.

signal note_hit(grade: Judgement.Grade, note_index: int, delta_ms: float)
signal note_missed(note_index: int)
signal chart_completed(stats: Dictionary)

var chart: ChartData
var _next_index: int = 0
var _combo: int = 0
var _max_combo: int = 0
var _counts := {
	"perfect": 0,
	"great": 0,
	"ok": 0,
	"miss": 0,
}
var _active: bool = false

func start(p_chart: ChartData) -> void:
	chart = p_chart
	_next_index = 0
	_combo = 0
	_max_combo = 0
	_counts = {"perfect": 0, "great": 0, "ok": 0, "miss": 0}
	_active = true
	if not InputRouter.tapped.is_connected(_on_tapped):
		InputRouter.tapped.connect(_on_tapped)
	if not AudioClock.song_finished.is_connected(_on_song_finished):
		AudioClock.song_finished.connect(_on_song_finished)

func stop() -> void:
	_active = false
	if InputRouter.tapped.is_connected(_on_tapped):
		InputRouter.tapped.disconnect(_on_tapped)

func force_finish() -> void:
	if not _active:
		return
	while chart != null and _next_index < chart.notes.size():
		_register_miss(_next_index)
		_next_index += 1
	_finish()

func _process(_delta: float) -> void:
	if not _active or chart == null:
		return
	var now := AudioClock.get_song_time_ms()
	while _next_index < chart.notes.size():
		var note_t: float = chart.notes[_next_index]
		if now - note_t > Judgement.WINDOW_MISS_MS:
			_register_miss(_next_index)
			_next_index += 1
		else:
			break
	if chart.duration_ms > 0.0 and now >= chart.duration_ms and _next_index >= chart.notes.size():
		_finish()

func _on_tapped(at_ms: float) -> void:
	if not _active or chart == null:
		return
	if _next_index >= chart.notes.size():
		return
	var note_t: float = chart.notes[_next_index]
	var delta := at_ms - note_t
	if absf(delta) > Judgement.WINDOW_MISS_MS:
		# Too early — ignore (player spam). Late notes become miss via _process.
		if delta < 0.0:
			return
		_register_miss(_next_index)
		_next_index += 1
		return
	var grade := Judgement.grade_delta(delta)
	if grade == Judgement.Grade.MISS:
		_register_miss(_next_index)
	else:
		_register_hit(grade, _next_index, delta)
	_next_index += 1

func _register_hit(grade: Judgement.Grade, index: int, delta_ms: float) -> void:
	match grade:
		Judgement.Grade.PERFECT:
			_counts["perfect"] += 1
		Judgement.Grade.GREAT:
			_counts["great"] += 1
		Judgement.Grade.OK:
			_counts["ok"] += 1
		_:
			pass
	_combo += 1
	_max_combo = maxi(_max_combo, _combo)
	Judgement.graded.emit(grade, delta_ms)
	note_hit.emit(grade, index, delta_ms)

func _register_miss(index: int) -> void:
	_counts["miss"] += 1
	_combo = 0
	Judgement.graded.emit(Judgement.Grade.MISS, 0.0)
	note_missed.emit(index)

func _on_song_finished() -> void:
	while _next_index < chart.notes.size():
		_register_miss(_next_index)
		_next_index += 1
	_finish()

func _finish() -> void:
	if not _active:
		return
	_active = false
	var total := 0
	for k in _counts.keys():
		total += int(_counts[k])
	var hit := int(_counts["perfect"]) + int(_counts["great"]) + int(_counts["ok"])
	var accuracy := 0.0 if total == 0 else float(hit) / float(total)
	var rank := "C"
	if accuracy >= 0.95 and int(_counts["miss"]) == 0:
		rank = "S"
	elif accuracy >= 0.85:
		rank = "A"
	elif accuracy >= 0.70:
		rank = "B"
	chart_completed.emit({
		"counts": _counts.duplicate(),
		"combo": _max_combo,
		"accuracy": accuracy,
		"rank": rank,
		"title": chart.title if chart else "",
	})
