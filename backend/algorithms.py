import numpy as np
from datetime import datetime
from dateutil import parser
from models import items, containers, current_date

def find_optimal_placement(item, available_containers):
    """Find the optimal placement for an item using 3D bin packing algorithm"""
    best_container = None
    best_position = None
    best_score = float('-inf')
    
    # Sort containers by zone preference first
    sorted_containers = sorted(
        available_containers, 
        key=lambda c: 0 if c.zone == item.preferred_zone else 1
    )
    
    for container in sorted_containers:
        # Skip if container is too small for the item
        if (container.width < item.width or 
            container.depth < item.depth or 
            container.height < item.height):
            continue
        
        # Try different orientations
        orientations = [
            (item.width, item.depth, item.height),
            (item.width, item.height, item.depth),
            (item.depth, item.width, item.height),
            (item.depth, item.height, item.width),
            (item.height, item.width, item.depth),
            (item.height, item.depth, item.width)
        ]
        
        for width, depth, height in orientations:
            # Skip if this orientation doesn't fit
            if (container.width < width or 
                container.depth < depth or 
                container.height < height):
                continue
            
            # Find the best position using bottom-left-front rule
            for x in range(container.width - width + 1):
                for y in range(container.depth - depth + 1):
                    for z in range(container.height - height + 1):
                        start_coords = {"width": x, "depth": y, "height": z}
                        end_coords = {"width": x + width, "depth": y + depth, "height": z + height}
                        
                        if container.is_space_available(start_coords, end_coords):
                            # Calculate score based on priority and zone preference
                            score = item.priority
                            
                            # Bonus for preferred zone
                            if container.zone == item.preferred_zone:
                                score += 50
                            
                            # Bonus for accessibility (closer to open face)
                            score -= y * 0.5  # Less depth means more accessible
                            
                            if score > best_score:
                                best_score = score
                                best_container = container
                                best_position = {
                                    "startCoordinates": start_coords,
                                    "endCoordinates": end_coords
                                }
    
    return best_container, best_position

def calculate_retrieval_steps(container, item_id):
    """Calculate steps needed to retrieve an item"""
    blocking_items = container.get_items_blocking(item_id)
    
    # Generate retrieval steps
    retrieval_steps = []
    step_number = 1
    
    for blocking_id in blocking_items:
        # Step to remove blocking item
        retrieval_steps.append({
            "step": step_number,
            "action": "remove",
            "itemId": blocking_id,
            "itemName": items[blocking_id].name
        })
        step_number += 1
        
        # Step to set aside blocking item
        retrieval_steps.append({
            "step": step_number,
            "action": "setAside",
            "itemId": blocking_id,
            "itemName": items[blocking_id].name
        })
        step_number += 1
    
    # Step to retrieve target item
    retrieval_steps.append({
        "step": step_number,
        "action": "retrieve",
        "itemId": item_id,
        "itemName": items[item_id].name
    })
    step_number += 1
    
    # Steps to place back blocking items in reverse order
    for blocking_id in reversed(blocking_items):
        retrieval_steps.append({
            "step": step_number,
            "action": "placeBack",
            "itemId": blocking_id,
            "itemName": items[blocking_id].name
        })
        step_number += 1
    
    return retrieval_steps

def identify_waste_items():
    """Identify items that are waste (expired or out of uses)"""
    waste_items = []
    
    for item_id, item in items.items():
        is_waste, reason = item.is_waste(current_date)
        if is_waste:
            waste_items.append({
                "itemId": item_id,
                "name": item.name,
                "reason": reason,
                "containerId": item.container_id,
                "position": item.position
            })
    
    return waste_items

def create_waste_return_plan(undocking_container_id, max_weight):
    """Create a plan for returning waste items"""
    waste_items_list = identify_waste_items()
    waste_item_ids = [item["itemId"] for item in waste_items_list]
    
    # Sort waste items by priority (lower priority first)
    sorted_waste = sorted(
        [(item_id, items[item_id]) for item_id in waste_item_ids],
        key=lambda x: x[1].priority
    )
    
    return_plan = []
    retrieval_steps = []
    return_manifest = {
        "undockingContainerId": undocking_container_id,
        "undockingDate": current_date,
        "returnItems": [],
        "totalVolume": 0,
        "totalWeight": 0
    }
    
    step_number = 1
    total_weight = 0
    
    for item_id, item in sorted_waste:
        # Check if adding this item exceeds weight limit
        if total_weight + item.mass > max_weight:
            continue
        
        # Add to return plan
        return_plan.append({
            "step": step_number,
            "itemId": item_id,
            "itemName": item.name,
            "fromContainer": item.container_id,
            "toContainer": undocking_container_id
        })
        step_number += 1
        
        # Calculate retrieval steps if needed
        if item.container_id:
            container = containers[item.container_id]
            item_retrieval_steps = calculate_retrieval_steps(container, item_id)
            retrieval_steps.extend(item_retrieval_steps)
        
        # Add to manifest
        return_manifest["returnItems"].append({
            "itemId": item_id,
            "name": item.name,
            "reason": "Expired" if item.expiry_date and parser.parse(current_date) > parser.parse(item.expiry_date) else "Out of Uses"
        })
        
        # Update totals
        volume = item.width * item.depth * item.height
        return_manifest["totalVolume"] += volume
        return_manifest["totalWeight"] += item.mass
        total_weight += item.mass
    
    return return_plan, retrieval_steps, return_manifest

def simulate_day(items_used):
    """Simulate a day passing in the system"""
    global current_date
    
    # Advance the date by one day
    current_date_obj = parser.parse(current_date)
    current_date_obj = current_date_obj.replace(day=current_date_obj.day + 1)
    current_date = current_date_obj.isoformat()
    
    changes = {
        "itemsUsed": [],
        "itemsExpired": [],
        "itemsOutOfUses": []
    }
    
    # Process used items
    for item_id in items_used:
        if item_id in items:
            item = items[item_id]
            old_uses = item.uses_remaining
            item.use_item()
            
            changes["itemsUsed"].append({
                "itemId": item_id,
                "name": item.name,
                "usesRemaining": item.uses_remaining
            })
            
            # Check if item is now out of uses
            if old_uses > 0 and item.uses_remaining <= 0:
                changes["itemsOutOfUses"].append({
                    "itemId": item_id,
                    "name": item.name
                })
    
    # Check for newly expired items
    for item_id, item in items.items():
        if item.expiry_date and item.expiry_date != "N/A":
            expiry_date = parser.parse(item.expiry_date)
            if current_date_obj > expiry_date:
                # Item is expired
                changes["itemsExpired"].append({
                    "itemId": item_id,
                    "name": item.name,
                    "expiryDate": item.expiry_date
                })
    
    return current_date, changes
