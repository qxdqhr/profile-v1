extends RefCounted
class_name ChartData
## Pure-tap chart loaded from JSON.

var title: String = ""
var bpm: float = 120.0
var offset_ms: float = 0.0
var duration_ms: float = 0.0
## Absolute note times in milliseconds from song start.
var notes: Array[float] = []

static func from_json_path(path: String) -> ChartData:
	var chart := ChartData.new()
	if not FileAccess.file_exists(path):
		push_error("Chart missing: %s" % path)
		return chart
	var f := FileAccess.open(path, FileAccess.READ)
	var data: Variant = JSON.parse_string(f.get_as_text())
	if typeof(data) != TYPE_DICTIONARY:
		push_error("Invalid chart JSON: %s" % path)
		return chart
	chart.title = str(data.get("title", "Untitled"))
	chart.bpm = float(data.get("bpm", 120.0))
	chart.offset_ms = float(data.get("offset_ms", 0.0))
	chart.duration_ms = float(data.get("duration_ms", 0.0))
	chart.notes.clear()
	var raw_notes: Variant = data.get("notes", [])
	if typeof(raw_notes) == TYPE_ARRAY:
		for n in raw_notes:
			chart.notes.append(float(n) + chart.offset_ms)
	chart.notes.sort()
	return chart

## Build a metronome-style tap chart when no audio is present.
static func make_demo(bpm: float = 120.0, bars: int = 8, beats_per_bar: int = 4) -> ChartData:
	var chart := ChartData.new()
	chart.title = "Demo Tap"
	chart.bpm = bpm
	chart.offset_ms = 0.0
	var beat_ms := 60000.0 / bpm
	var count := bars * beats_per_bar
	for i in count:
		# Skip first 2 beats as lead-in without notes, then tap every beat.
		if i < 2:
			continue
		chart.notes.append(float(i) * beat_ms)
	chart.duration_ms = float(count) * beat_ms + 500.0
	return chart
