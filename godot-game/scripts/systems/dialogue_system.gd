extends Node
## DialogueSystem - NPC dialogue and conversation management
##
## Features:
## - Branching dialogues
## - Choice-based responses
## - Dialogue conditions (quest state, items, etc.)
## - Character portraits
## - Voice line triggers

signal dialogue_started(dialogue_id: String)
signal dialogue_ended(dialogue_id: String)
signal dialogue_line_shown(speaker: String, text: String, choices: Array)
signal choice_selected(choice_id: String, next_node: String)

# Dialogue state
var current_dialogue: Dictionary = {}
var current_node_id: String = ""
var dialogue_active: bool = false
var dialogue_history: Array[String] = []

# NPCs and their dialogues
const DIALOGUES: Dictionary = {
	# Shop keeper
	"shop_intro": {
		"start_node": "greeting",
		"nodes": {
			"greeting": {
				"speaker": "Quartermaster",
				"text": "Welcome to the armory, soldier. Need some firepower?",
				"choices": [
					{"text": "Show me what you've got", "next": "show_weapons"},
					{"text": "What do you recommend?", "next": "recommendation"},
					{"text": "Just browsing", "next": "browsing"},
					{"text": "I'll come back later", "next": "end"}
				]
			},
			"show_weapons": {
				"speaker": "Quartermaster",
				"text": "Here's our current inventory. All top-quality gear.",
				"action": "open_shop",
				"next": "end"
			},
			"recommendation": {
				"speaker": "Quartermaster",
				"text": "For your combat style? I'd say grab the shotgun for close quarters, or the rapid-fire if you like spray and pray.",
				"choices": [
					{"text": "Tell me more about the shotgun", "next": "shotgun_info"},
					{"text": "What about the rapid-fire?", "next": "rapid_fire_info"},
					{"text": "Show me the full inventory", "next": "show_weapons"}
				]
			},
			"shotgun_info": {
				"speaker": "Quartermaster",
				"text": "The shotgun? Devastating at close range. Multiple pellets mean you don't need perfect aim. Just point and boom.",
				"next": "show_weapons"
			},
			"rapid_fire_info": {
				"speaker": "Quartermaster",
				"text": "Rapid-fire is all about volume. High rate of fire, manageable recoil. Great for suppressing groups.",
				"next": "show_weapons"
			},
			"browsing": {
				"speaker": "Quartermaster",
				"text": "Take your time. Let me know if you need anything.",
				"next": "end"
			},
			"end": {
				"speaker": "Quartermaster",
				"text": "Stay safe out there.",
				"end_dialogue": true
			}
		}
	},

	# Mission briefing
	"mission_brief_level3": {
		"start_node": "intro",
		"nodes": {
			"intro": {
				"speaker": "Command",
				"text": "Intel suggests a high-value target in the underground facility. We call it the Guardian.",
				"next": "details"
			},
			"details": {
				"speaker": "Command",
				"text": "It's unlike anything we've encountered. Multiple attack phases. Expects you to fail.",
				"choices": [
					{"text": "What's the mission objective?", "next": "objective"},
					{"text": "What should I expect?", "next": "expect"},
					{"text": "I'm ready. Let's go.", "next": "ready"}
				]
			},
			"objective": {
				"speaker": "Command",
				"text": "Simple: eliminate the Guardian. But don't underestimate it. This thing has taken down entire squads.",
				"next": "expect"
			},
			"expect": {
				"speaker": "Command",
				"text": "Expect heavy resistance. The Guardian can summon reinforcements, has area attacks, and gets more aggressive as it takes damage.",
				"choices": [
					{"text": "Any weaknesses?", "next": "weakness"},
					{"text": "I'm ready", "next": "ready"}
				]
			},
			"weakness": {
				"speaker": "Command",
				"text": "We've observed it has a vulnerability during its summon phase. That's your window. Strike hard and fast.",
				"next": "ready"
			},
			"ready": {
				"speaker": "Command",
				"text": "Good luck out there. We're counting on you.",
				"action": "start_level",
				"end_dialogue": true
			}
		}
	},

	# Random NPC chatter
	"guard_idle": {
		"start_node": "random",
		"nodes": {
			"random": {
				"speaker": "Guard",
				"text": "Keep moving. Nothing to see here.",
				"random_variants": [
					"Perimeter is secure.",
					"All quiet on this sector.",
					"Stay alert. Command says there's been activity.",
					"I've got a bad feeling about this place."
				],
				"end_dialogue": true
			}
		}
	},

	# Tutorial / Helper NPC
	"tutorial_npc": {
		"start_node": "help",
		"nodes": {
			"help": {
				"speaker": "Training Officer",
				"text": "Need some tips, rookie?",
				"choices": [
					{"text": "How do I aim better?", "next": "aiming"},
					{"text": "What's the combo system?", "next": "combo"},
					{"text": "Tell me about weapons", "next": "weapons"},
					{"text": "I'm good, thanks", "next": "end"}
				]
			},
			"aiming": {
				"speaker": "Training Officer",
				"text": "Keep your crosshair on target. Some weapons have recoil, so fire in bursts. And remember: headshots deal critical damage.",
				"choices": [
					{"text": "Anything else?", "next": "help"},
					{"text": "That helps, thanks", "next": "end"}
				]
			},
			"combo": {
				"speaker": "Training Officer",
				"text": "Chain kills within 3 seconds to build your combo multiplier. Higher combos mean more points and better rewards. Don't let the chain break!",
				"choices": [
					{"text": "Got it. What else?", "next": "help"},
					{"text": "Thanks", "next": "end"}
				]
			},
			"weapons": {
				"speaker": "Training Officer",
				"text": "Each weapon has strengths. Pistol is reliable. Shotgun for close range. Rapid-fire for groups. Grappling hook pulls enemies or you to them.",
				"choices": [
					{"text": "More tips?", "next": "help"},
					{"text": "Understood", "next": "end"}
				]
			},
			"end": {
				"speaker": "Training Officer",
				"text": "Go show them what you're made of!",
				"end_dialogue": true
			}
		}
	},

	# Post-boss dialogue
	"boss_defeated": {
		"start_node": "victory",
		"condition": {"quest": "main_4", "state": "completed"},
		"nodes": {
			"victory": {
				"speaker": "Command",
				"text": "Outstanding work! The Guardian is down. Intel was right to send you.",
				"next": "debrief"
			},
			"debrief": {
				"speaker": "Command",
				"text": "We're analyzing the data from that encounter. Whatever these things are, they're not random threats.",
				"choices": [
					{"text": "What do you mean?", "next": "mystery"},
					{"text": "What's next?", "next": "next_mission"}
				]
			},
			"mystery": {
				"speaker": "Command",
				"text": "These entities... they're coordinated. Intelligent. Someone or something is directing them. We need to find out who.",
				"next": "next_mission"
			},
			"next_mission": {
				"speaker": "Command",
				"text": "Rest up. We'll have new orders soon. This fight is far from over.",
				"end_dialogue": true
			}
		}
	}
}


## Start dialogue
func start_dialogue(dialogue_id: String) -> bool:
	if dialogue_id not in DIALOGUES:
		return false

	# Check conditions
	var dialogue_data = DIALOGUES[dialogue_id]
	if dialogue_data.has("condition"):
		if not check_condition(dialogue_data["condition"]):
			return false

	current_dialogue = dialogue_data.duplicate(true)
	current_node_id = current_dialogue["start_node"]
	dialogue_active = true
	dialogue_history.clear()

	dialogue_started.emit(dialogue_id)

	# Show first line
	show_current_node()

	return true


## Show current dialogue node
func show_current_node() -> void:
	if current_node_id.is_empty() or current_node_id not in current_dialogue["nodes"]:
		end_dialogue()
		return

	var node = current_dialogue["nodes"][current_node_id]

	# Handle random variants
	var text = node["text"]
	if node.has("random_variants"):
		var variants = node["random_variants"]
		text = variants[randi() % variants.size()]

	# Get choices
	var choices: Array = []
	if node.has("choices"):
		choices = node["choices"]

	# Emit dialogue line
	dialogue_line_shown.emit(node["speaker"], text, choices)

	# Add to history
	dialogue_history.append(current_node_id)

	# Handle actions
	if node.has("action"):
		execute_action(node["action"])

	# Auto-advance if no choices
	if choices.is_empty() and not node.get("end_dialogue", false):
		if node.has("next"):
			# Wait a moment then advance
			await get_tree().create_timer(2.0).timeout
			advance_to_node(node["next"])
		else:
			end_dialogue()
	elif node.get("end_dialogue", false):
		# Wait a moment then end
		await get_tree().create_timer(1.5).timeout
		end_dialogue()


## Advance to next node
func advance_to_node(next_node_id: String) -> void:
	if not dialogue_active:
		return

	current_node_id = next_node_id
	show_current_node()


## Select choice
func select_choice(choice_index: int) -> void:
	if not dialogue_active or current_node_id.is_empty():
		return

	var node = current_dialogue["nodes"][current_node_id]

	if not node.has("choices") or choice_index >= node["choices"].size():
		return

	var choice = node["choices"][choice_index]

	choice_selected.emit(choice.get("id", ""), choice["next"])

	# Advance to next node
	advance_to_node(choice["next"])


## End dialogue
func end_dialogue() -> void:
	if not dialogue_active:
		return

	var dialogue_id = ""  # Could track this if needed

	dialogue_active = false
	current_dialogue.clear()
	current_node_id = ""

	dialogue_ended.emit(dialogue_id)

	print("[Dialogue] Ended")


## Check condition
func check_condition(condition: Dictionary) -> bool:
	# Check quest state
	if condition.has("quest"):
		var quest_system = get_node_or_null("/root/QuestSystem")
		if quest_system:
			var quest_state = quest_system.get_quest_state(condition["quest"])
			var required_state = condition.get("state", "completed")

			match required_state:
				"available":
					return quest_state == quest_system.QuestState.AVAILABLE
				"active":
					return quest_state == quest_system.QuestState.ACTIVE
				"completed":
					return quest_state == quest_system.QuestState.COMPLETED
				_:
					return false

	# Check item possession
	if condition.has("has_item"):
		# TODO: Check inventory
		pass

	# Check currency
	if condition.has("currency_min"):
		var game_manager = get_node_or_null("/root/GameManager")
		if game_manager:
			return game_manager.current_currency >= condition["currency_min"]

	return true


## Execute action
func execute_action(action: String) -> void:
	match action:
		"open_shop":
			var game_manager = get_node_or_null("/root/GameManager")
			if game_manager:
				game_manager.open_shop()

		"start_level":
			var game_manager = get_node_or_null("/root/GameManager")
			if game_manager:
				game_manager.start_next_level()

		"give_reward":
			# TODO: Give reward
			pass

		_:
			print("[Dialogue] Unknown action: %s" % action)


## Get available dialogues for NPC
func get_npc_dialogues(npc_id: String) -> Array[String]:
	var available: Array[String] = []

	for dialogue_id in DIALOGUES:
		var dialogue = DIALOGUES[dialogue_id]

		# Check if dialogue has condition
		if dialogue.has("condition"):
			if not check_condition(dialogue["condition"]):
				continue

		# Check if dialogue is for this NPC (could add npc_id field to dialogue data)
		available.append(dialogue_id)

	return available


## Check if dialogue is active
func is_dialogue_active() -> bool:
	return dialogue_active


## Get current speaker
func get_current_speaker() -> String:
	if not dialogue_active or current_node_id.is_empty():
		return ""

	var node = current_dialogue["nodes"].get(current_node_id, {})
	return node.get("speaker", "")


## Skip to end of dialogue (if allowed)
func skip_dialogue() -> void:
	if not dialogue_active:
		return

	# Find end node
	for node_id in current_dialogue["nodes"]:
		var node = current_dialogue["nodes"][node_id]
		if node.get("end_dialogue", false):
			current_node_id = node_id
			show_current_node()
			return

	# No end node found, just end it
	end_dialogue()
