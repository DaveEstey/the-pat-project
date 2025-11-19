extends Area3D
## HazardBase - Base class for environmental hazards
##
## Features:
## - Damage dealing
## - Activation patterns
## - Warning indicators
## - Can damage player and/or enemies

class_name HazardBase

signal hazard_activated()
signal hazard_deactivated()
signal entity_damaged(entity: Node3D, damage: float)

@export var damage_per_second: float = 10.0
@export var affects_player: bool = true
@export var affects_enemies: bool = false
@export var is_active: bool = true
@export var warning_time: float = 0.5  # Warning before activation

var entities_in_hazard: Array[Node3D] = []


func _ready() -> void:
	add_to_group("hazard")

	# Set collision layers
	collision_layer = 1  # World layer
	if affects_player:
		collision_mask |= 2   # Player layer
	if affects_enemies:
		collision_mask |= 4   # Enemy layer

	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)


func _process(delta: float) -> void:
	if not is_active:
		return

	# Deal damage to entities in hazard
	for entity in entities_in_hazard:
		if entity and is_instance_valid(entity):
			deal_damage(entity, damage_per_second * delta)


func _on_body_entered(body: Node) -> void:
	if should_affect(body):
		entities_in_hazard.append(body)


func _on_body_exited(body: Node) -> void:
	entities_in_hazard.erase(body)


## Check if hazard should affect this entity
func should_affect(entity: Node) -> bool:
	if affects_player and entity.is_in_group("player"):
		return true
	if affects_enemies and entity.is_in_group("enemy"):
		return true
	return false


## Deal damage to entity
func deal_damage(entity: Node3D, amount: float) -> void:
	if entity.has_method("take_damage"):
		entity.take_damage(amount)
		entity_damaged.emit(entity, amount)


## Activate hazard
func activate() -> void:
	is_active = true
	hazard_activated.emit()


## Deactivate hazard
func deactivate() -> void:
	is_active = false
	hazard_deactivated.emit()


## Toggle hazard
func toggle() -> void:
	if is_active:
		deactivate()
	else:
		activate()
