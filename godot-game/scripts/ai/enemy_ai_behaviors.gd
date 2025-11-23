extends Node
## EnemyAIBehaviors - Pre-built behavior trees for enemies
##
## Features:
## - Common enemy behavior patterns
## - Reusable behavior tree templates
## - Easy integration with enemy types

class_name EnemyAIBehaviors


## Create basic shooter AI
static func create_basic_shooter_ai(enemy: Node) -> BehaviorTree:
	var tree = BehaviorTree.new(enemy)

	# Root selector
	var root = BehaviorTree.BTSelector.new("Root")

	# Combat sequence
	var combat_seq = BehaviorTree.BTSequence.new("Combat")
	combat_seq.add_child(BehaviorTree.BTCondition.new(
		"Can See Player",
		func(t): return can_see_player(t.owner_entity)
	))
	combat_seq.add_child(BehaviorTree.BTAction.new(
		"Aim at Player",
		func(t): return aim_at_player(t.owner_entity)
	))
	combat_seq.add_child(BehaviorTree.BTAction.new(
		"Shoot",
		func(t): return shoot_at_player(t.owner_entity)
	))

	# Patrol sequence
	var patrol_seq = BehaviorTree.BTSequence.new("Patrol")
	patrol_seq.add_child(BehaviorTree.BTAction.new(
		"Pick Patrol Point",
		func(t): return pick_patrol_point(t)
	))
	patrol_seq.add_child(BehaviorTree.BTAction.new(
		"Move to Point",
		func(t): return move_to_patrol_point(t.owner_entity, t)
	))

	root.add_child(combat_seq)
	root.add_child(patrol_seq)

	tree.set_root(root)
	return tree


## Create flanking AI
static func create_flanking_ai(enemy: Node) -> BehaviorTree:
	var tree = BehaviorTree.new(enemy)

	var root = BehaviorTree.BTSelector.new("Root")

	# Attack sequence
	var attack_seq = BehaviorTree.BTSequence.new("Attack")
	attack_seq.add_child(BehaviorTree.BTCondition.new(
		"Has Line of Sight",
		func(t): return can_see_player(t.owner_entity)
	))
	attack_seq.add_child(BehaviorTree.BTCondition.new(
		"In Attack Range",
		func(t): return is_in_attack_range(t.owner_entity)
	))
	attack_seq.add_child(BehaviorTree.BTAction.new(
		"Strafe and Shoot",
		func(t): return strafe_and_shoot(t.owner_entity)
	))

	# Flank sequence
	var flank_seq = BehaviorTree.BTSequence.new("Flank")
	flank_seq.add_child(BehaviorTree.BTCondition.new(
		"Player Visible",
		func(t): return can_see_player(t.owner_entity)
	))
	flank_seq.add_child(BehaviorTree.BTAction.new(
		"Calculate Flank Position",
		func(t): return calculate_flank_position(t.owner_entity, t)
	))
	flank_seq.add_child(BehaviorTree.BTAction.new(
		"Move to Flank",
		func(t): return move_to_position(t.owner_entity, t)
	))

	# Approach sequence
	var approach_seq = BehaviorTree.BTSequence.new("Approach")
	approach_seq.add_child(BehaviorTree.BTAction.new(
		"Move Towards Player",
		func(t): return move_towards_player(t.owner_entity)
	))

	root.add_child(attack_seq)
	root.add_child(flank_seq)
	root.add_child(approach_seq)

	tree.set_root(root)
	return tree


## Create defensive AI (uses cover)
static func create_defensive_ai(enemy: Node) -> BehaviorTree:
	var tree = BehaviorTree.new(enemy)

	var root = BehaviorTree.BTSelector.new("Root")

	# Take cover when damaged
	var cover_seq = BehaviorTree.BTSequence.new("Take Cover")
	cover_seq.add_child(BehaviorTree.BTCondition.new(
		"Health Low",
		func(t): return is_health_low(t.owner_entity)
	))
	cover_seq.add_child(BehaviorTree.BTAction.new(
		"Find Cover",
		func(t): return find_cover_position(t.owner_entity, t)
	))
	cover_seq.add_child(BehaviorTree.BTAction.new(
		"Move to Cover",
		func(t): return move_to_position(t.owner_entity, t)
	))
	cover_seq.add_child(BehaviorTree.BTWait.new(2.0))

	# Peek and shoot from cover
	var peek_seq = BehaviorTree.BTSequence.new("Peek and Shoot")
	peek_seq.add_child(BehaviorTree.BTCondition.new(
		"In Cover",
		func(t): return t.has_value("in_cover")
	))
	peek_seq.add_child(BehaviorTree.BTCondition.new(
		"Can See Player",
		func(t): return can_see_player(t.owner_entity)
	))
	peek_seq.add_child(BehaviorTree.BTAction.new(
		"Shoot from Cover",
		func(t): return shoot_at_player(t.owner_entity)
	))
	peek_seq.add_child(BehaviorTree.BTWait.new(0.5))

	# Normal combat
	var combat_seq = BehaviorTree.BTSequence.new("Combat")
	combat_seq.add_child(BehaviorTree.BTCondition.new(
		"Can Attack",
		func(t): return can_see_player(t.owner_entity)
	))
	combat_seq.add_child(BehaviorTree.BTAction.new(
		"Attack Player",
		func(t): return shoot_at_player(t.owner_entity)
	))

	root.add_child(cover_seq)
	root.add_child(peek_seq)
	root.add_child(combat_seq)

	tree.set_root(root)
	return tree


## Create aggressive rushing AI
static func create_aggressive_ai(enemy: Node) -> BehaviorTree:
	var tree = BehaviorTree.new(enemy)

	var root = BehaviorTree.BTSelector.new("Root")

	# Melee range attack
	var melee_seq = BehaviorTree.BTSequence.new("Melee")
	melee_seq.add_child(BehaviorTree.BTCondition.new(
		"In Melee Range",
		func(t): return is_in_melee_range(t.owner_entity)
	))
	melee_seq.add_child(BehaviorTree.BTAction.new(
		"Melee Attack",
		func(t): return melee_attack(t.owner_entity)
	))

	# Rush player
	var rush_seq = BehaviorTree.BTSequence.new("Rush")
	rush_seq.add_child(BehaviorTree.BTCondition.new(
		"Can See Player",
		func(t): return can_see_player(t.owner_entity)
	))
	rush_seq.add_child(BehaviorTree.BTAction.new(
		"Sprint to Player",
		func(t): return sprint_to_player(t.owner_entity)
	))

	root.add_child(melee_seq)
	root.add_child(rush_seq)

	tree.set_root(root)
	return tree


## Create support AI (buffs allies, stays back)
static func create_support_ai(enemy: Node) -> BehaviorTree:
	var tree = BehaviorTree.new(enemy)

	var root = BehaviorTree.BTSelector.new("Root")

	# Buff allies
	var buff_seq = BehaviorTree.BTSequence.new("Buff Allies")
	buff_seq.add_child(BehaviorTree.BTCondition.new(
		"Allies Need Buff",
		func(t): return allies_need_buff(t.owner_entity)
	))
	buff_seq.add_child(BehaviorTree.BTAction.new(
		"Cast Buff",
		func(t): return cast_ally_buff(t.owner_entity)
	))
	buff_seq.add_child(BehaviorTree.BTWait.new(3.0))

	# Keep distance
	var distance_seq = BehaviorTree.BTSequence.new("Maintain Distance")
	distance_seq.add_child(BehaviorTree.BTCondition.new(
		"Too Close to Player",
		func(t): return is_too_close_to_player(t.owner_entity)
	))
	distance_seq.add_child(BehaviorTree.BTAction.new(
		"Retreat",
		func(t): return retreat_from_player(t.owner_entity)
	))

	# Ranged attack
	var attack_seq = BehaviorTree.BTSequence.new("Ranged Attack")
	attack_seq.add_child(BehaviorTree.BTCondition.new(
		"Can See Player",
		func(t): return can_see_player(t.owner_entity)
	))
	attack_seq.add_child(BehaviorTree.BTAction.new(
		"Shoot",
		func(t): return shoot_at_player(t.owner_entity)
	))

	root.add_child(buff_seq)
	root.add_child(distance_seq)
	root.add_child(attack_seq)

	tree.set_root(root)
	return tree


# ============================================================================
# CONDITION FUNCTIONS
# ============================================================================

static func can_see_player(enemy: Node) -> bool:
	if not enemy.has_method("can_see_target"):
		return false
	return enemy.can_see_target()


static func is_in_attack_range(enemy: Node) -> bool:
	var player = get_player()
	if not player:
		return false

	var distance = enemy.global_position.distance_to(player.global_position)
	return distance <= enemy.get("attack_range", 20.0)


static func is_in_melee_range(enemy: Node) -> bool:
	var player = get_player()
	if not player:
		return false

	var distance = enemy.global_position.distance_to(player.global_position)
	return distance <= enemy.get("melee_range", 3.0)


static func is_health_low(enemy: Node) -> bool:
	if not enemy.has_method("get_health_percentage"):
		return false
	return enemy.get_health_percentage() < 30.0


static func is_too_close_to_player(enemy: Node) -> bool:
	var player = get_player()
	if not player:
		return false

	var distance = enemy.global_position.distance_to(player.global_position)
	var min_distance = enemy.get("preferred_distance", 15.0)
	return distance < min_distance


static func allies_need_buff(enemy: Node) -> bool:
	# Check if nearby allies exist and could use buffs
	# TODO: Implement ally detection
	return false


# ============================================================================
# ACTION FUNCTIONS
# ============================================================================

static func aim_at_player(enemy: Node) -> BehaviorTree.NodeStatus:
	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	# Look at player
	enemy.look_at(player.global_position, Vector3.UP)
	return BehaviorTree.NodeStatus.SUCCESS


static func shoot_at_player(enemy: Node) -> BehaviorTree.NodeStatus:
	if not enemy.has_method("shoot"):
		return BehaviorTree.NodeStatus.FAILURE

	enemy.shoot()
	return BehaviorTree.NodeStatus.SUCCESS


static func strafe_and_shoot(enemy: Node) -> BehaviorTree.NodeStatus:
	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	# Move perpendicular to player while shooting
	var to_player = (player.global_position - enemy.global_position).normalized()
	var strafe_dir = Vector3(-to_player.z, 0, to_player.x)

	if randf() > 0.5:
		strafe_dir = -strafe_dir

	if enemy.has_method("set_movement_direction"):
		enemy.set_movement_direction(strafe_dir)

	if enemy.has_method("shoot"):
		enemy.shoot()

	return BehaviorTree.NodeStatus.RUNNING


static func move_towards_player(enemy: Node) -> BehaviorTree.NodeStatus:
	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	var direction = (player.global_position - enemy.global_position).normalized()

	if enemy.has_method("set_movement_direction"):
		enemy.set_movement_direction(direction)

	return BehaviorTree.NodeStatus.RUNNING


static func sprint_to_player(enemy: Node) -> BehaviorTree.NodeStatus:
	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	var direction = (player.global_position - enemy.global_position).normalized()

	if enemy.has_method("set_movement_direction"):
		enemy.set_movement_direction(direction)

	# Increase speed
	if enemy.has_method("set_sprint"):
		enemy.set_sprint(true)

	return BehaviorTree.NodeStatus.RUNNING


static func retreat_from_player(enemy: Node) -> BehaviorTree.NodeStatus:
	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	var direction = (enemy.global_position - player.global_position).normalized()

	if enemy.has_method("set_movement_direction"):
		enemy.set_movement_direction(direction)

	return BehaviorTree.NodeStatus.RUNNING


static func melee_attack(enemy: Node) -> BehaviorTree.NodeStatus:
	if not enemy.has_method("perform_melee_attack"):
		return BehaviorTree.NodeStatus.FAILURE

	enemy.perform_melee_attack()
	return BehaviorTree.NodeStatus.SUCCESS


static func cast_ally_buff(enemy: Node) -> BehaviorTree.NodeStatus:
	if not enemy.has_method("cast_buff"):
		return BehaviorTree.NodeStatus.FAILURE

	enemy.cast_buff()
	return BehaviorTree.NodeStatus.SUCCESS


static func pick_patrol_point(tree: BehaviorTree) -> BehaviorTree.NodeStatus:
	# Pick random point in area
	var patrol_point = Vector3(
		randf_range(-20, 20),
		0,
		randf_range(-20, 20)
	)

	tree.set_value("patrol_point", patrol_point)
	return BehaviorTree.NodeStatus.SUCCESS


static func move_to_patrol_point(enemy: Node, tree: BehaviorTree) -> BehaviorTree.NodeStatus:
	if not tree.has_value("patrol_point"):
		return BehaviorTree.NodeStatus.FAILURE

	var patrol_point = tree.get_value("patrol_point")
	var direction = (patrol_point - enemy.global_position).normalized()

	if enemy.has_method("set_movement_direction"):
		enemy.set_movement_direction(direction)

	# Check if reached
	if enemy.global_position.distance_to(patrol_point) < 2.0:
		return BehaviorTree.NodeStatus.SUCCESS

	return BehaviorTree.NodeStatus.RUNNING


static func calculate_flank_position(enemy: Node, tree: BehaviorTree) -> BehaviorTree.NodeStatus:
	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	# Calculate position to the side of player
	var to_enemy = (enemy.global_position - player.global_position).normalized()
	var flank_dir = Vector3(-to_enemy.z, 0, to_enemy.x)

	if randf() > 0.5:
		flank_dir = -flank_dir

	var flank_pos = player.global_position + (flank_dir * 10.0)

	tree.set_value("target_position", flank_pos)
	return BehaviorTree.NodeStatus.SUCCESS


static func find_cover_position(enemy: Node, tree: BehaviorTree) -> BehaviorTree.NodeStatus:
	# TODO: Implement proper cover finding with raycasts
	# For now, just move away from player

	var player = get_player()
	if not player:
		return BehaviorTree.NodeStatus.FAILURE

	var away = (enemy.global_position - player.global_position).normalized()
	var cover_pos = enemy.global_position + (away * 10.0)

	tree.set_value("target_position", cover_pos)
	tree.set_value("in_cover", true)
	return BehaviorTree.NodeStatus.SUCCESS


static func move_to_position(enemy: Node, tree: BehaviorTree) -> BehaviorTree.NodeStatus:
	if not tree.has_value("target_position"):
		return BehaviorTree.NodeStatus.FAILURE

	var target_pos = tree.get_value("target_position")
	var direction = (target_pos - enemy.global_position).normalized()

	if enemy.has_method("set_movement_direction"):
		enemy.set_movement_direction(direction)

	# Check if reached
	if enemy.global_position.distance_to(target_pos) < 2.0:
		return BehaviorTree.NodeStatus.SUCCESS

	return BehaviorTree.NodeStatus.RUNNING


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

static func get_player() -> Node:
	return get_tree().get_first_node_in_group("player") if Engine.is_editor_hint() == false else null
