from flask import Blueprint, request, jsonify
from models import items, containers, log_action, current_date
from algorithms import simulate_day

bp = Blueprint('simulation', __name__, url_prefix='/api')

@bp.route('/simulate/day', methods=['POST'])
def simulate_one_day():
    data = request.json
    items_used = data.get('itemsUsed', [])
    
    new_date, changes = simulate_day(items_used)
    
    # Log the simulation
    log_action(
        action_type="simulation",
        user_id="system",
        item_id=None,
        container_id=None,
        details={
            "newDate": new_date,
            "itemsUsed": len(items_used),
            "itemsExpired": len(changes["itemsExpired"]),
            "itemsOutOfUses": len(changes["itemsOutOfUses"])
        }
    )
    
    return jsonify({
        "success": True,
        "newDate": new_date,
        "changes": changes
    })
