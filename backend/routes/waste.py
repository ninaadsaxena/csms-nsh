from flask import Blueprint, request, jsonify
from models import items, containers, log_action
from algorithms import identify_waste_items, create_waste_return_plan

bp = Blueprint('waste', __name__, url_prefix='/api/waste')

@bp.route('/identify', methods=['GET'])
def identify_waste():
    waste_items = identify_waste_items()
    
    return jsonify({
        "success": True,
        "wasteItems": waste_items
    })

@bp.route('/return-plan', methods=['POST'])
def waste_return_plan():
    data = request.json
    undocking_container_id = data.get('undockingContainerId')
    undocking_date = data.get('undockingDate')
    max_weight = data.get('maxWeight', float('inf'))
    
    if not undocking_container_id or undocking_container_id not in containers:
        return jsonify({
            "success": False,
            "message": "Undocking container not found"
        })
    
    return_plan, retrieval_steps, return_manifest = create_waste_return_plan(
        undocking_container_id, max_weight
    )
    
    # Log the return plan
    log_action(
        action_type="waste_return_plan",
        user_id="system",
        item_id=None,
        container_id=undocking_container_id,
        details={
            "undockingDate": undocking_date,
            "itemCount": len(return_manifest["returnItems"]),
            "totalWeight": return_manifest["totalWeight"]
        }
    )
    
    return jsonify({
        "success": True,
        "returnPlan": return_plan,
        "retrievalSteps": retrieval_steps,
        "returnManifest": return_manifest
    })

@bp.route('/complete-undocking', methods=['POST'])
def complete_undocking():
    data = request.json
    undocking_container_id = data.get('undockingContainerId')
    timestamp = data.get('timestamp')
    
    if not undocking_container_id or undocking_container_id not in containers:
        return jsonify({
            "success": False,
            "message": "Undocking container not found"
        })
    
    # Get all items in the undocking container
    items_to_remove = []
    for item_id, item in items.items():
        if item.container_id == undocking_container_id:
            items_to_remove.append(item_id)
    
    # Remove items
    for item_id in items_to_remove:
        del items[item_id]
    
    # Clear the container
    containers[undocking_container_id].occupied_spaces = []
    
    # Log the undocking
    log_action(
        action_type="undocking",
        user_id="system",
        item_id=None,
        container_id=undocking_container_id,
        details={
            "timestamp": timestamp,
            "itemsRemoved": len(items_to_remove)
        }
    )
    
    return jsonify({
        "success": True,
        "itemsRemoved": len(items_to_remove)
    })
