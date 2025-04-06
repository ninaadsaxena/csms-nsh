from flask import Blueprint, request, jsonify, Response
import csv
import io
from models import items, containers, Container, Item, log_action

bp = Blueprint('import_export', __name__, url_prefix='/api')

@bp.route('/import/items', methods=['POST'])
def import_items():
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "message": "No file provided"
        })
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            "success": False,
            "message": "No file selected"
        })
    
    # Process CSV
    items_imported = 0
    errors = []
    
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header
            try:
                item_id = row.get('Item ID')
                
                if not item_id:
                    errors.append({
                        "row": row_num,
                        "message": "Missing Item ID"
                    })
                    continue
                
                # Create new item
                item = Item(
                    item_id=item_id,
                    name=row.get('Name', ''),
                    width=int(row.get('Width (cm)', 0)),
                    depth=int(row.get('Depth (cm)', 0)),
                    height=int(row.get('Height (cm)', 0)),
                    mass=float(row.get('Mass (kg)', 0)),
                    priority=int(row.get('Priority (1-100)', 50)),
                    expiry_date=row.get('Expiry Date (ISO Format)', 'N/A'),
                    usage_limit=int(row.get('Usage Limit', 1)),
                    preferred_zone=row.get('Preferred Zone', '')
                )
                
                # Add to items dictionary
                items[item_id] = item
                items_imported += 1
                
            except Exception as e:
                errors.append({
                    "row": row_num,
                    "message": str(e)
                })
        
        # Log the import
        log_action(
            action_type="import_items",
            user_id="system",
            item_id=None,
            container_id=None,
            details={
                "itemsImported": items_imported,
                "errors": len(errors)
            }
        )
        
        return jsonify({
            "success": True,
            "itemsImported": items_imported,
            "errors": errors
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })

@bp.route('/import/containers', methods=['POST'])
def import_containers():
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "message": "No file provided"
        })
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            "success": False,
            "message": "No file selected"
        })
    
    # Process CSV
    containers_imported = 0
    errors = []
    
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header
            try:
                container_id = row.get('Container ID')
                
                if not container_id:
                    errors.append({
                        "row": row_num,
                        "message": "Missing Container ID"
                    })
                    continue
                
                # Create new container
                container = Container(
                    container_id=container_id,
                    zone=row.get('Zone', ''),
                    width=int(row.get('Width(cm)', 0)),
                    depth=int(row.get('Depth(cm)', 0)),
                    height=int(row.get('Height(height)', 0))
                )
                
                # Add to containers dictionary
                containers[container_id] = container
                containers_imported += 1
                
            except Exception as e:
                errors.append({
                    "row": row_num,
                    "message": str(e)
                })
        
        # Log the import
        log_action(
            action_type="import_containers",
            user_id="system",
            item_id=None,
            container_id=None,
            details={
                "containersImported": containers_imported,
                "errors": len(errors)
            }
        )
        
        return jsonify({
            "success": True,
            "containersImported": containers_imported,
            "errors": errors
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })

@bp.route('/export/arrangement', methods=['GET'])
def export_arrangement():
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Item ID', 'Container ID', 'Coordinates (W1,D1,H1),(W2,D2,H2)'])
    
    # Write data
    for item_id, item in items.items():
        if item.container_id and item.position:
            container_id = item.container_id
            start = item.position['startCoordinates']
            end = item.position['endCoordinates']
            
            coordinates = f"({start['width']},{start['depth']},{start['height']}),({end['width']},{end['depth']},{end['height']})"
            writer.writerow([item_id, container_id, coordinates])
    
    # Prepare response
    output.seek(0)
    
    # Log the export
    log_action(
        action_type="export_arrangement",
        user_id="system",
        item_id=None,
        container_id=None,
        details={
            "itemsExported": len(items)
        }
    )
    
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=arrangement.csv"}
    )
