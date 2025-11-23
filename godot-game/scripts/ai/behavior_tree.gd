extends Node
## BehaviorTree - Flexible AI behavior tree system
##
## Features:
## - Composable behavior nodes
## - Selector, Sequence, and Decorator patterns
## - Condition checking
## - Action execution
## - Blackboard for shared data

class_name BehaviorTree

enum NodeStatus {
	SUCCESS,
	FAILURE,
	RUNNING
}

var root_node: BTNode = null
var blackboard: Dictionary = {}
var owner_entity: Node = null

var is_active: bool = true
var tick_rate: float = 0.1  # Update every 0.1 seconds
var time_since_last_tick: float = 0.0


func _init(p_owner: Node) -> void:
	owner_entity = p_owner


func _process(delta: float) -> void:
	if not is_active or not root_node:
		return

	time_since_last_tick += delta

	if time_since_last_tick >= tick_rate:
		time_since_last_tick = 0.0
		tick()


## Tick the behavior tree
func tick() -> NodeStatus:
	if not root_node:
		return NodeStatus.FAILURE

	return root_node.execute(self)


## Set root node
func set_root(node: BTNode) -> void:
	root_node = node


## Get blackboard value
func get_value(key: String, default = null):
	return blackboard.get(key, default)


## Set blackboard value
func set_value(key: String, value) -> void:
	blackboard[key] = value


## Check if blackboard has key
func has_value(key: String) -> bool:
	return key in blackboard


## Clear blackboard
func clear_blackboard() -> void:
	blackboard.clear()


## Base behavior tree node class
class BTNode:
	var node_name: String = "BTNode"

	func execute(tree: BehaviorTree) -> NodeStatus:
		return NodeStatus.FAILURE


## Selector node - tries children until one succeeds
class BTSelector extends BTNode:
	var children: Array[BTNode] = []

	func _init(p_name: String = "Selector") -> void:
		node_name = p_name

	func add_child(child: BTNode) -> void:
		children.append(child)

	func execute(tree: BehaviorTree) -> NodeStatus:
		for child in children:
			var status = child.execute(tree)

			if status == NodeStatus.SUCCESS:
				return NodeStatus.SUCCESS

			if status == NodeStatus.RUNNING:
				return NodeStatus.RUNNING

		return NodeStatus.FAILURE


## Sequence node - tries children until one fails
class BTSequence extends BTNode:
	var children: Array[BTNode] = []

	func _init(p_name: String = "Sequence") -> void:
		node_name = p_name

	func add_child(child: BTNode) -> void:
		children.append(child)

	func execute(tree: BehaviorTree) -> NodeStatus:
		for child in children:
			var status = child.execute(tree)

			if status == NodeStatus.FAILURE:
				return NodeStatus.FAILURE

			if status == NodeStatus.RUNNING:
				return NodeStatus.RUNNING

		return NodeStatus.SUCCESS


## Condition node - checks a condition
class BTCondition extends BTNode:
	var condition_func: Callable

	func _init(p_name: String, p_condition: Callable) -> void:
		node_name = p_name
		condition_func = p_condition

	func execute(tree: BehaviorTree) -> NodeStatus:
		if condition_func.call(tree):
			return NodeStatus.SUCCESS
		return NodeStatus.FAILURE


## Action node - performs an action
class BTAction extends BTNode:
	var action_func: Callable

	func _init(p_name: String, p_action: Callable) -> void:
		node_name = p_name
		action_func = p_action

	func execute(tree: BehaviorTree) -> NodeStatus:
		return action_func.call(tree)


## Inverter decorator - inverts child result
class BTInverter extends BTNode:
	var child: BTNode

	func _init(p_child: BTNode) -> void:
		node_name = "Inverter"
		child = p_child

	func execute(tree: BehaviorTree) -> NodeStatus:
		var status = child.execute(tree)

		if status == NodeStatus.SUCCESS:
			return NodeStatus.FAILURE
		elif status == NodeStatus.FAILURE:
			return NodeStatus.SUCCESS

		return status


## Repeater decorator - repeats child N times or until failure
class BTRepeater extends BTNode:
	var child: BTNode
	var max_repeats: int = -1  # -1 = infinite
	var current_repeats: int = 0

	func _init(p_child: BTNode, p_max_repeats: int = -1) -> void:
		node_name = "Repeater"
		child = p_child
		max_repeats = p_max_repeats

	func execute(tree: BehaviorTree) -> NodeStatus:
		while max_repeats == -1 or current_repeats < max_repeats:
			var status = child.execute(tree)

			if status == NodeStatus.FAILURE:
				current_repeats = 0
				return NodeStatus.FAILURE

			if status == NodeStatus.RUNNING:
				return NodeStatus.RUNNING

			current_repeats += 1

			if max_repeats != -1 and current_repeats >= max_repeats:
				current_repeats = 0
				return NodeStatus.SUCCESS

		return NodeStatus.SUCCESS


## Succeeder decorator - always returns success
class BTSucceeder extends BTNode:
	var child: BTNode

	func _init(p_child: BTNode) -> void:
		node_name = "Succeeder"
		child = p_child

	func execute(tree: BehaviorTree) -> NodeStatus:
		child.execute(tree)
		return NodeStatus.SUCCESS


## Wait node - waits for duration
class BTWait extends BTNode:
	var wait_time: float
	var timer: float = 0.0
	var is_waiting: bool = false

	func _init(p_wait_time: float) -> void:
		node_name = "Wait"
		wait_time = p_wait_time

	func execute(tree: BehaviorTree) -> NodeStatus:
		if not is_waiting:
			is_waiting = true
			timer = 0.0

		timer += tree.tick_rate

		if timer >= wait_time:
			is_waiting = false
			timer = 0.0
			return NodeStatus.SUCCESS

		return NodeStatus.RUNNING
