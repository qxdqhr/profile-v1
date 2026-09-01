extends Node
## Routes keyboard / mouse / touch into a single tap signal.

signal tapped(at_ms: float)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("tap"):
		_emit_tap()
		get_viewport().set_input_as_handled()
		return
	if event is InputEventScreenTouch and event.pressed:
		_emit_tap()
		get_viewport().set_input_as_handled()

func _emit_tap() -> void:
	tapped.emit(AudioClock.get_song_time_ms())
