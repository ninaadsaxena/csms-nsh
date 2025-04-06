from flask import Blueprint, request, jsonify
from models import items, containers, log_action
from algorithms import calculate_retrieval_steps

bp = Blueprint('search', __name__, url_prefix='/api')

@bp.route('/search', methods=['GET'])
def search_item():
    item_id = request.args.get('itemId')
    item_name = request.args.get('itemName')
    user_id = request.args.get('userId', 'unknown')
    
    # Find item by ID or name
    found_item = None
    if item_id and item_id in items:
        found_item = items[item_id]
    elif item_name:
        for item in items.values():
            if item.name.lower() == item_name.lower():
                found_item = item
                break
    
    if not found_item:
        return jsonify({
            "success": True,
            "found": False
        })
    
    # Get container and position
    container_id = found_item.container_id
    position = found_item.position
    
    if not container_id or not position:
        return jsonify({
            "success": True,
            "found": True,
            "item": found_item.to_dict(),
            "retrievalSteps": []
        })
    
    # Get container
    container = containers[container_id]
    
    # Calculate retrieval steps
    retrieval_steps = calculate_retrieval_steps(container, found_item.item_id)
    
    # Log the search
    log_action(
        action_type="search",
        user_id=user_id,
        item_id=found_item.item_id,
        container_id=container_id,
        details={"retrievalSteps": len(retrieval_steps)}
    )
    
    return jsonify({
        "success": True,
        "found": True,
        "item": {
            "itemId": found_item.item_id,
            "name": found_item.name,
            "containerId": container_id,
            "zone": container.zone,
            "position": position
        },
        "retrievalSteps": retrieval_steps
    })

@bp.route('/retrieve', methods=['POST'])
def retrieve_item():
    data = request.json
    item_id = data.get('itemId')
    user_id = data.get('userId', 'unknown')
    timestamp = data.get('timestamp')
    
    if not item_id or item_id not in items:
        return jsonify({
            "success": False,
            "message": "Item not found"
        })
    
    item = items[item_id]
    
    # Use the item (decrement usage count)
    item.use_item()
    
    # Log the retrieval
    log_action(
        action_type="retrieval",
        user_id=user_id,
        item_id=item_id,
        container_id=item.container_id,
        details={"timestamp": timestamp}
    )
    
    return jsonify({
        "success": True
    })

@bp.route('/place', methods=['POST'])
def place_item():
    data = request.json
    item_id = data.get('itemId')
    user_id = data.get('userId', 'unknown')
    timestamp = data.get('timestamp')
    container_id = data.get('containerId')
    position = data.get('position')
    
    if not item_id or item_id not in items:
        return jsonify({
            "success": False,
            "message": "Item not found"
        })
    
    if not container_id or container_id not in containers:
        return jsonify({
            "success": False,
            "message": "Container not found"
        })
    
    item = items[item_id]
    container = containers[container_id]
    
    # Remove item from old container if it exists
    if item.container_id and item.container_id in containers:
        old_container = containers[item.container_id]
        old_container.remove_item(item_id)
    
    # Add item to new container
    start_coords = position.get('startCoordinates')
    end_coords = position.get('endCoordinates')
    
    if container.add_item(item_id, start_coords, end_coords):
        # Update item position
        item.set_position(container_id, position)
        
        # Log the placement
        log_action(
            action_type="placement",
            user_id=user_id,
            item_id=item_id,
            container_id=container_id,
            details={"timestamp": timestamp, "position": position}
        )
        
        return jsonify({
            "success": True
        })
    else:
        return jsonify({
            "success": False,
            "message": "Space not available in container"
        })
