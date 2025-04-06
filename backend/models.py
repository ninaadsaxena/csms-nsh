from datetime import datetime
import json
import uuid
from dateutil import parser

# In-memory database
containers = {}
items = {}
logs = []
current_date = datetime.now().isoformat()

class Container:
    def __init__(self, container_id, zone, width, depth, height):
        self.container_id = container_id
        self.zone = zone
        self.width = width
        self.depth = depth
        self.height = height
        self.occupied_spaces = []  # List of (item_id, start_coords, end_coords)
    
    def to_dict(self):
        return {
            "containerId": self.container_id,
            "zone": self.zone,
            "width": self.width,
            "depth": self.depth,
            "height": self.height
        }
    
    def is_space_available(self, start_coords, end_coords):
        """Check if the space is available for placement"""
        for item_id, item_start, item_end in self.occupied_spaces:
            # Check for overlap
            if not (end_coords["width"] <= item_start["width"] or 
                    start_coords["width"] >= item_end["width"] or
                    end_coords["depth"] <= item_start["depth"] or
                    start_coords["depth"] >= item_end["depth"] or
                    end_coords["height"] <= item_start["height"] or
                    start_coords["height"] >= item_end["height"]):
                return False
        return True
    
    def add_item(self, item_id, start_coords, end_coords):
        """Add an item to the container"""
        if self.is_space_available(start_coords, end_coords):
            self.occupied_spaces.append((item_id, start_coords, end_coords))
            return True
        return False
    
    def remove_item(self, item_id):
        """Remove an item from the container"""
        for i, (id, start, end) in enumerate(self.occupied_spaces):
            if id == item_id:
                self.occupied_spaces.pop(i)
                return True
        return False
    
    def get_item_position(self, item_id):
        """Get the position of an item in the container"""
        for id, start, end in self.occupied_spaces:
            if id == item_id:
                return {
                    "startCoordinates": start,
                    "endCoordinates": end
                }
        return None
    
    def get_items_blocking(self, item_id):
        """Get items blocking the retrieval path of an item"""
        target_position = self.get_item_position(item_id)
        if not target_position:
            return []
        
        start = target_position["startCoordinates"]
        end = target_position["endCoordinates"]
        
        blocking_items = []
        for id, item_start, item_end in self.occupied_spaces:
            if id == item_id:
                continue
                
            # Check if item is in front of target item (closer to open face)
            if (item_start["width"] <= end["width"] and item_end["width"] >= start["width"] and
                item_start["height"] <= end["height"] and item_end["height"] >= start["height"] and
                item_start["depth"] < start["depth"]):
                blocking_items.append(id)
                
        return blocking_items


class Item:
    def __init__(self, item_id, name, width, depth, height, mass, priority, expiry_date, usage_limit, preferred_zone):
        self.item_id = item_id
        self.name = name
        self.width = width
        self.depth = depth
        self.height = height
        self.mass = mass
        self.priority = priority
        self.expiry_date = expiry_date  # ISO format string or None
        self.usage_limit = usage_limit
        self.preferred_zone = preferred_zone
        self.uses_remaining = usage_limit
        self.container_id = None
        self.position = None
    
    def to_dict(self):
        return {
            "itemId": self.item_id,
            "name": self.name,
            "width": self.width,
            "depth": self.depth,
            "height": self.height,
            "mass": self.mass,
            "priority": self.priority,
            "expiryDate": self.expiry_date,
            "usageLimit": self.usage_limit,
            "preferredZone": self.preferred_zone,
            "usesRemaining": self.uses_remaining,
            "containerId": self.container_id,
            "position": self.position
        }
    
    def use_item(self):
        """Decrement the usage count when item is used"""
        if self.uses_remaining > 0:
            self.uses_remaining -= 1
            return True
        return False
    
    def is_waste(self, current_date_str):
        """Check if the item is waste (expired or out of uses)"""
        # Check if out of uses
        if self.uses_remaining <= 0:
            return True, "Out of Uses"
        
        # Check if expired
        if self.expiry_date and self.expiry_date != "N/A":
            current_date = parser.parse(current_date_str)
            expiry_date = parser.parse(self.expiry_date)
            if current_date > expiry_date:
                return True, "Expired"
        
        return False, ""
    
    def set_position(self, container_id, position):
        """Set the position of the item in a container"""
        self.container_id = container_id
        self.position = position


def log_action(action_type, user_id, item_id, container_id=None, details=None):
    """Log an action in the system"""
    log_entry = {
        "logId": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "actionType": action_type,
        "userId": user_id,
        "itemId": item_id,
        "containerId": container_id,
        "details": details or {}
    }
    logs.append(log_entry)
    return log_entry


def initialize_data():
    """Initialize with some sample data for testing"""
    # Add sample containers
    containers["contA"] = Container("contA", "Crew Quarters", 100, 85, 200)
    containers["contB"] = Container("contB", "Airlock", 50, 85, 200)
    containers["contC"] = Container("contC", "Laboratory", 200, 85, 200)
    
    # Add sample items
    items["001"] = Item("001", "Food Packet", 10, 10, 20, 5, 80, "2025-05-20", 30, "Crew Quarters")
    items["002"] = Item("002", "Oxygen Cylinder", 15, 15, 50, 30, 95, None, 100, "Airlock")
    items["003"] = Item("003", "First Aid Kit", 20, 20, 10, 2, 100, "2025-07-10", 5, "Medical Bay")

# Initialize data
initialize_data()
