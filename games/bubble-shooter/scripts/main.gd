extends Node2D
## Minimal bubble shooter — dual-track Godot port of PhaserBubbleShooter.

enum Status { READY, SHOOTING, WON, LOST }

var _grid: Array = []
var _status: Status = Status.READY
var _score: int = 0
var _aim_angle: float = -PI * 0.5
var _current_color: int = 0
var _next_color: int = 0
var _projectile: Dictionary = {}
var _rng := RandomNumberGenerator.new()

@onready var _hud: Label = $UI/HUD
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry

func _ready() -> void:
	_rng.randomize()
	_retry.pressed.connect(_restart)
	_overlay.visible = false
	_restart()

func _restart() -> void:
	_grid = BubbleGrid.create_initial(_rng)
	_status = Status.READY
	_score = 0
	_aim_angle = -PI * 0.5
	_current_color = BubbleGrid.random_playable_color(_grid, _rng)
	_next_color = BubbleGrid.pick_next_color(_grid, _current_color, _rng)
	_projectile.clear()
	_overlay.visible = false
	_update_hud()
	queue_redraw()

func _update_hud() -> void:
	var st: String = "待发射"
	match _status:
		Status.SHOOTING:
			st = "发射中"
		Status.WON:
			st = "胜利"
		Status.LOST:
			st = "失败"
	_hud.text = "分数 %d\n当前 Lv%d  下一 Lv%d\n%s" % [
		_score,
		_current_color + 1,
		_next_color + 1,
		st,
	]

func _unhandled_input(event: InputEvent) -> void:
	if _status != Status.READY:
		return
	var shooter: Vector2 = BubbleConfig.shooter_pos()
	if event is InputEventMouseMotion:
		var e := event as InputEventMouseMotion
		_aim_angle = BubbleGrid.clamp_aim(atan2(e.position.y - shooter.y, e.position.x - shooter.x))
		queue_redraw()
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_shoot()
	if event is InputEventScreenTouch and event.pressed:
		var e := event as InputEventScreenTouch
		_aim_angle = BubbleGrid.clamp_aim(atan2(e.position.y - shooter.y, e.position.x - shooter.x))
		_shoot()

func _shoot() -> void:
	if _status != Status.READY:
		return
	var colors: Array = BubbleGrid.collect_colors(_grid)
	if not colors.is_empty():
		if _current_color not in colors:
			_current_color = BubbleGrid.random_playable_color(_grid, _rng)
		if _next_color not in colors:
			_next_color = BubbleGrid.random_playable_color(_grid, _rng)
	var shooter2: Vector2 = BubbleConfig.shooter_pos()
	_projectile = {
		"x": shooter2.x,
		"y": shooter2.y - BubbleConfig.RADIUS,
		"vx": cos(_aim_angle) * BubbleConfig.LAUNCH_SPEED,
		"vy": sin(_aim_angle) * BubbleConfig.LAUNCH_SPEED,
		"color": _current_color,
	}
	_status = Status.SHOOTING
	_update_hud()

func _process(delta: float) -> void:
	if _status != Status.SHOOTING or _projectile.is_empty():
		return
	var dt := minf(delta, 0.05)
	var bw := BubbleConfig.board_width()
	var r := BubbleConfig.RADIUS
	var nx: float = float(_projectile["x"]) + float(_projectile["vx"]) * dt
	var ny: float = float(_projectile["y"]) + float(_projectile["vy"]) * dt
	var nvx: float = float(_projectile["vx"])

	if nx <= r:
		nx = r
		nvx = absf(nvx)
	elif nx >= bw - r:
		nx = bw - r
		nvx = -absf(nvx)

	if ny <= BubbleConfig.TOP_OFFSET + r:
		_settle(nx, BubbleConfig.TOP_OFFSET + r, BubbleGrid.nearest_slot(nx, ny))
	else:
		var hit: Variant = BubbleGrid.find_collision(nx, ny, _grid)
		if hit != null:
			_settle(nx, ny, hit)
		else:
			_projectile["x"] = nx
			_projectile["y"] = ny
			_projectile["vx"] = nvx
	queue_redraw()

func _settle(x: float, y: float, preferred: Variant) -> void:
	if _projectile.is_empty():
		return
	var attach: Variant = BubbleGrid.find_attach_slot(x, y, _grid, preferred)
	if attach == null:
		_projectile.clear()
		_status = Status.LOST
		_over_msg.text = "无法附着\n分数 %d" % _score
		_overlay.visible = true
		_update_hud()
		queue_redraw()
		return
	var slot: Dictionary = attach
	if _grid[slot.row][slot.col] >= 0:
		_projectile.clear()
		_status = Status.LOST
		_over_msg.text = "无法附着\n分数 %d" % _score
		_overlay.visible = true
		_update_hud()
		queue_redraw()
		return

	_grid[slot.row][slot.col] = int(_projectile["color"])
	var resolved: Dictionary = BubbleGrid.resolve_matches(_grid, slot)
	_grid = resolved["grid"] as Array
	if int(resolved["removed"]) > 0:
		_score += int(resolved["matched"]) * 10 + int(resolved["dropped"]) * 15

	if not BubbleGrid.has_any(_grid):
		_status = Status.WON
		_over_msg.text = "清盘胜利！\n分数 %d" % _score
		_overlay.visible = true
	elif BubbleGrid.reached_danger(_grid):
		_status = Status.LOST
		_over_msg.text = "触底失败\n分数 %d" % _score
		_overlay.visible = true
	else:
		_status = Status.READY

	_projectile.clear()
	_current_color = _next_color
	_next_color = BubbleGrid.pick_next_color(_grid, _current_color, _rng)
	_update_hud()
	queue_redraw()

func _draw() -> void:
	var bw := BubbleConfig.board_width()
	var bh := BubbleConfig.board_height()
	draw_rect(Rect2(0, 0, bw, bh), Color(0.93, 0.96, 0.99))
	draw_rect(Rect2(0, BubbleConfig.TOP_OFFSET, bw, bh - BubbleConfig.TOP_OFFSET - 40), Color(0.86, 0.91, 0.96))

	# Danger zone hint
	var danger_y: float = BubbleConfig.TOP_OFFSET + BubbleConfig.RADIUS + float(BubbleConfig.ROWS - 2) * BubbleConfig.row_step() - BubbleConfig.RADIUS
	draw_line(Vector2(4, danger_y), Vector2(bw - 4, danger_y), Color(1, 0.3, 0.3, 0.35), 2.0)

	for row in BubbleConfig.ROWS:
		for col in BubbleConfig.COLS:
			var idx: int = _grid[row][col]
			if idx < 0:
				continue
			_draw_bubble(BubbleConfig.bubble_pos(row, col), BubbleConfig.color_for(idx))

	var shooter := BubbleConfig.shooter_pos()
	if _status == Status.READY:
		_draw_bubble(Vector2(shooter.x, shooter.y - BubbleConfig.RADIUS), BubbleConfig.color_for(_current_color))
		_draw_bubble(Vector2(shooter.x + 36, shooter.y - 8), BubbleConfig.color_for(_next_color), BubbleConfig.RADIUS * 0.55)
		# Aim guide
		var px := shooter.x
		var py := shooter.y - BubbleConfig.RADIUS
		var vx := cos(_aim_angle)
		var vy := sin(_aim_angle)
		for i in 6:
			px += vx * BubbleConfig.RADIUS * 0.9
			py += vy * BubbleConfig.RADIUS * 0.9
			if px < BubbleConfig.RADIUS or px > bw - BubbleConfig.RADIUS:
				vx = -vx
				px += vx * BubbleConfig.RADIUS * 0.9
			if py < BubbleConfig.TOP_OFFSET + BubbleConfig.RADIUS:
				break
			draw_circle(Vector2(px, py), 2.5, Color(0.2, 0.25, 0.33, 0.55))

	if not _projectile.is_empty():
		_draw_bubble(Vector2(float(_projectile["x"]), float(_projectile["y"])), BubbleConfig.color_for(int(_projectile["color"])))

func _draw_bubble(center: Vector2, color: Color, radius: float = BubbleConfig.RADIUS) -> void:
	draw_circle(center, radius, color)
	draw_circle(center + Vector2(-radius * 0.32, -radius * 0.36), radius * 0.35, Color(1, 1, 1, 0.22))
	draw_arc(center, radius, 0, TAU, 24, Color(0.2, 0.25, 0.33, 0.22), 1.0)
