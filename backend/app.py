from flask import Flask, jsonify
from flask_cors import CORS
import os

from routes import placement, search, waste, simulation, import_export, logs

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(placement.bp)
app.register_blueprint(search.bp)
app.register_blueprint(waste.bp)
app.register_blueprint(simulation.bp)
app.register_blueprint(import_export.bp)
app.register_blueprint(logs.bp)

@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "Cargo Stowage Management System API is running"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
