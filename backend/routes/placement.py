from flask import Blueprint, request, jsonify
from models import items, containers, Item, log_action
from algorithms import find_optimal_placement

bp = Blueprint('placement', __name__, url_prefix='/api')

@bp.route('/placement', methods=['POST'])
def placement_recommendations():
    data = request.json
    
    # Process new items
    new_items = []
    for item_data in data.get('items', []):
        item_id = item_data.get('itemId')
        item = Item(
            item_id=item_id,
            name=item_data.get('name'),
            width=item_data.get('width'),
            depth=item_data.get('depth'),
            height=item_data.get('height'),
            mass=item_data.get('mass'),
            priority=item_data.get('priority'),
            expiry_date=item_data.get('expiryDate'),
            usage_limit=item_data.get('usageLimit'),
            preferred_zone=item_data.get('preferredZone')
        )
        items[item_id] = item
        new_items.append(item)
    
    # Process new containers
    for container_data in data.get('containers', []):
        container_id = container_data.get('containerId')
        if container_id not in containers:
            containers[container_id] = Container(
                container_id=container_id,
                zone=container_data.get('zone'),
                width=container_data.get('width'),
                depth=container_data.get('depth'),
                height=container_data.get('height')
            )
    
    # Find placements for new items
    placements = []
    rearrangements = []
    
    for item in new_items:
        container_list = list(containers.values())
        best_container, best_position = find_optimal_placement(item, container_list)
        
        if best_container and best_position:
            # Add item to container
            best_container.add_item(
                item.item_id, 
                best_position["startCoordinates"], 
                best_position["endCoordinates"]
            )
            
            # Update item position
            item.set_position(best_container.container_id, best_position)
            
            # Add to placements
            placements.append({
                "itemId": item.item_id,
                "containerId": best_container.container_id,
                "position": best_position
            })
            
            # Log the placement
            log_action(
                action_type="placement",
                user_id="system",
                item_id=item.item_id,
                container_id=best_container.container_id,
                details={"position": best_position}
            )
        else:
            # TODO: Implement rearrangement logic if no space is found
            pass
    
    return jsonify({
        "success": True,
        "placements": placements,
        "rearrangements": rearrangements
    })
