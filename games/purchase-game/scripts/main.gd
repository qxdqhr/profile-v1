extends Control

const INIT_LIFE := 3
const INIT_MONEY := 100
const ROUND_TIME := 30.0

const PRODUCTS := [
	{"name": "源石锭礼包", "kind": "money", "cost": 20, "value": 30},
	{"name": "高价零食", "kind": "money", "cost": 35, "value": 25},
	{"name": "神秘折扣券", "kind": "money", "cost": 15, "value": 40},
	{"name": "危险实验", "kind": "life", "cost": 0, "value": 50},
	{"name": "陷阱盲盒", "kind": "life", "cost": 10, "value": 60},
	{"name": "安全理财", "kind": "money", "cost": 25, "value": 35},
]

@onready var _hud: Label = $UI/HUD
@onready var _card: Label = $Center/VBox/Card
@onready var _buy: Button = $Center/VBox/Buy
@onready var _skip: Button = $Center/VBox/Skip
@onready var _overlay: ColorRect = $UI/Overlay
@onready var _over_msg: Label = $UI/Overlay/VBox/Msg
@onready var _retry: Button = $UI/Overlay/VBox/Retry

var _life: int = INIT_LIFE
var _money: int = INIT_MONEY
var _score: int = 0
var _buys: int = 0
var _time_left: float = ROUND_TIME
var _alive: bool = true
var _product: Dictionary = {}
var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_buy.pressed.connect(_on_buy)
	_skip.pressed.connect(_on_skip)
	_retry.pressed.connect(_restart)
	_restart()

func _restart() -> void:
	_life = INIT_LIFE
	_money = INIT_MONEY
	_score = 0
	_buys = 0
	_time_left = ROUND_TIME
	_alive = true
	_overlay.visible = false
	_buy.disabled = false
	_skip.disabled = false
	_roll_product()
	_update_ui()

func _process(delta: float) -> void:
	if not _alive:
		return
	_time_left -= delta
	_update_ui()
	if _time_left <= 0.0:
		_end("时间到")

func _roll_product() -> void:
	_product = PRODUCTS[_rng.randi_range(0, PRODUCTS.size() - 1)].duplicate()

func _update_ui() -> void:
	_hud.text = "生命 %d  源石锭 %d\n分数 %d  已购 %d\n倒计时 %.1fs" % [_life, _money, _score, _buys, maxf(0.0, _time_left)]
	var kind: String = str(_product.get("kind", "money"))
	var tip := "谋财（扣钱）" if kind == "money" else "害命（扣生命）"
	_card.text = "%s\n%s\n花费 %d · 价值 %d" % [str(_product.get("name", "")), tip, int(_product.get("cost", 0)), int(_product.get("value", 0))]

func _on_buy() -> void:
	if not _alive:
		return
	var kind: String = str(_product.get("kind", "money"))
	var cost: int = int(_product.get("cost", 0))
	var value: int = int(_product.get("value", 0))
	if kind == "money":
		if _money < cost:
			return
		_money -= cost
		_score += value + int(_money / 20)
	else:
		_life -= 1
		_money = maxi(0, _money - cost)
		_score += value + (INIT_LIFE - _life) * 10
	_buys += 1
	if _life <= 0:
		_end("生命耗尽")
		return
	_roll_product()
	_update_ui()

func _on_skip() -> void:
	if not _alive:
		return
	_roll_product()
	_update_ui()

func _end(reason: String) -> void:
	_alive = false
	_buy.disabled = true
	_skip.disabled = true
	_over_msg.text = "%s\n总分 %d\n购买 %d 次" % [reason, _score, _buys]
	_overlay.visible = true
