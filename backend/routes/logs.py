from flask import Blueprint, request, jsonify
from models import logs
from dateutil import parser

bp = Blueprint('logs', __name__, url_prefix='/api')

@bp.route('/logs', methods=['GET'])
def get_logs():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    item_id = request.args.get('itemId')
    user_id = request.args.get('userId')
    action_type = request.args.get('actionType')
    
    filtered_logs = logs
    
    # Filter by date range
    if start_date:
        start_date = parser.parse(start_date)
        filtered_logs = [log for log in filtered_logs if parser.parse(log['timestamp']) >= start_date]
