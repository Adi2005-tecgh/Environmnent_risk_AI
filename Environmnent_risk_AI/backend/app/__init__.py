from flask import Flask, jsonify
from flask_cors import CORS
import os
import logging

def create_app():
    # Initialize Flask app
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Import and register blueprints
    from .routes.risk import risk_bp
    from .routes.hotspot import hotspot_bp
    from .routes.gov_analytics import gov_bp
    from .routes.prediction import prediction_bp
    from .routes.auth import auth_bp

    app.register_blueprint(risk_bp, url_prefix='/api')
    app.register_blueprint(hotspot_bp, url_prefix='/api')
    app.register_blueprint(gov_bp, url_prefix='/api')
    app.register_blueprint(prediction_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')

    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "service": "AQI Backend AI"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    logger.info("🚀 AQI Backend Factory Initialized Successfully")
    return app
