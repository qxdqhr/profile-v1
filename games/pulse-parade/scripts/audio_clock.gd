extends Node
## Audio-driven song clock. Song time is the source of truth for notes.

signal song_started
signal song_finished

var _player: AudioStreamPlayer
var _playing: bool = false
var _length_sec: float = 0.0
var _started_at_usec: int = 0
var _paused_song_time: float = 0.0
var _use_system_fallback: bool = false

func _ready() -> void:
	_player = AudioStreamPlayer.new()
	_player.name = "SongPlayer"
	_player.bus = "Master"
	add_child(_player)
	_player.finished.connect(_on_player_finished)

func play_stream(stream: AudioStream, from_sec: float = 0.0, fallback_length_sec: float = 0.0) -> void:
	_player.stream = stream
	_length_sec = stream.get_length() if stream != null else 0.0
	if _length_sec <= 0.0 and fallback_length_sec > 0.0:
		_length_sec = fallback_length_sec
	_use_system_fallback = stream == null or (stream != null and stream.get_length() <= 0.0)
	_playing = true
	_started_at_usec = Time.get_ticks_usec()
	_paused_song_time = from_sec
	if stream != null:
		_player.play(from_sec)
	song_started.emit()

func stop() -> void:
	_playing = false
	_player.stop()

func is_playing() -> bool:
	return _playing

func get_song_time_sec() -> float:
	if not _playing:
		return _paused_song_time
	var pos: float
	if _use_system_fallback or not _player.playing:
		var elapsed := float(Time.get_ticks_usec() - _started_at_usec) / 1_000_000.0
		pos = _paused_song_time + elapsed
	else:
		# Prefer playback position; fall back if driver reports 0 at start.
		pos = _player.get_playback_position() + AudioServer.get_time_since_last_mix()
		pos -= AudioServer.get_output_latency()
	pos += SaveData.audio_offset_ms / 1000.0
	pos = maxf(pos, 0.0)
	if _length_sec > 0.0 and pos >= _length_sec:
		_playing = false
		_paused_song_time = _length_sec
		song_finished.emit()
		return _length_sec
	return pos

func get_song_time_ms() -> float:
	return get_song_time_sec() * 1000.0

func get_length_sec() -> float:
	if _length_sec > 0.0:
		return _length_sec
	return 0.0

func _on_player_finished() -> void:
	_playing = false
	_paused_song_time = _length_sec
	song_finished.emit()
