extends Node
## Hit windows in milliseconds relative to note time.

enum Grade { PERFECT, GREAT, OK, MISS }

const WINDOW_PERFECT_MS := 40.0
const WINDOW_GREAT_MS := 80.0
const WINDOW_OK_MS := 120.0
const WINDOW_MISS_MS := 160.0

signal graded(grade: Grade, delta_ms: float)

func grade_delta(delta_ms: float) -> Grade:
	var abs_d := absf(delta_ms)
	if abs_d <= WINDOW_PERFECT_MS:
		return Grade.PERFECT
	if abs_d <= WINDOW_GREAT_MS:
		return Grade.GREAT
	if abs_d <= WINDOW_OK_MS:
		return Grade.OK
	return Grade.MISS

func grade_name(grade: Grade) -> String:
	match grade:
		Grade.PERFECT:
			return "PERFECT"
		Grade.GREAT:
			return "GREAT"
		Grade.OK:
			return "OK"
		_:
			return "MISS"
