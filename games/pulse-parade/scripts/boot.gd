extends Control

func _ready() -> void:
	call_deferred("_go_title")

func _go_title() -> void:
	get_tree().change_scene_to_file("res://scenes/title.tscn")
