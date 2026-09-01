extends Control

const PLOTS := 6
const GROW_NEED := 3.0 ## watering progress to mature
const COLORS := {
	"empty": Color(0.45, 0.35, 0.25),
	"seed": Color(0.55, 0.7, 0.35),
	"grow": Color(0.4, 0.85, 0.45),
	"ready": Color(0.95, 0.75, 0.3),
}

@onready var _hud: Label = $UI/HUD
@onready var _plots: GridContainer = $Center/Plots
@onready var _seed_btn: Button = $UI/Actions/Seed
@onready var _water_btn: Button = $UI/Actions/Water
@onready var _harvest_btn: Button = $UI/Actions/Harvest

var _money: int = 20
var _harvests: int = 0
var _selected: int = 0
var _states: Array[String] = [] ## empty|seed|grow|ready
var _progress: Array[float] = []
var _buttons: Array[Button] = []

func _ready() -> void:
	_plots.columns = 3
	_seed_btn.pressed.connect(func() -> void: _act("seed"))
	_water_btn.pressed.connect(func() -> void: _act("water"))
	_harvest_btn.pressed.connect(func() -> void: _act("harvest"))
	_states.clear()
	_progress.clear()
	_buttons.clear()
	for i in PLOTS:
		_states.append("empty")
		_progress.append(0.0)
		var b := Button.new()
		b.custom_minimum_size = Vector2(96, 96)
		var idx := i
		b.pressed.connect(func() -> void: _select(idx))
		_plots.add_child(b)
		_buttons.append(b)
	_select(0)
	_refresh()

func _select(i: int) -> void:
	_selected = i
	_refresh()

func _act(kind: String) -> void:
	var s: String = _states[_selected]
	match kind:
		"seed":
			if s == "empty" and _money >= 5:
				_money -= 5
				_states[_selected] = "seed"
				_progress[_selected] = 0.0
		"water":
			if s == "seed" or s == "grow":
				_progress[_selected] += 1.0
				if _progress[_selected] >= GROW_NEED:
					_states[_selected] = "ready"
					_progress[_selected] = GROW_NEED
				else:
					_states[_selected] = "grow"
		"harvest":
			if s == "ready":
				_money += 18
				_harvests += 1
				_states[_selected] = "empty"
				_progress[_selected] = 0.0
	_refresh()

func _refresh() -> void:
	_hud.text = "金币 %d  收获 %d\n选地块后：播种5币 / 浇水 / 收获+18\n当前地块 #%d · %s" % [_money, _harvests, _selected + 1, _label(_states[_selected])]
	for i in PLOTS:
		var style := StyleBoxFlat.new()
		var st: String = _states[i]
		style.bg_color = COLORS[st]
		style.set_corner_radius_all(12)
		if i == _selected:
			style.border_color = Color.WHITE
			style.set_border_width_all(3)
		_buttons[i].add_theme_stylebox_override("normal", style)
		_buttons[i].text = _short(st)

func _label(s: String) -> String:
	match s:
		"empty":
			return "空地"
		"seed":
			return "已播种"
		"grow":
			return "生长中"
		"ready":
			return "可收获"
		_:
			return s

func _short(s: String) -> String:
	match s:
		"empty":
			return "空"
		"seed":
			return "种"
		"grow":
			return "长"
		"ready":
			return "熟"
		_:
			return "?"
