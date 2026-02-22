from flask import Flask, send_from_directory
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app)
    @app.route("/")
    def home():
        return {
            "status": "success",
            "message": "AQI ML Backend is running 🚀"
        }
    
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Register Blueprints
    from .routes.predict import predict_bp
    from .routes.risk import risk_bp
    from .routes.anomaly import anomaly_bp
    from .routes.hotspot import hotspot_bp
    from .routes.complaints import complaints_bp
    from .routes.gov_analytics import gov_analytics_bp
    from .routes.transparency_routes import transparency_bp
    from .routes.auth import auth_bp
    
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(risk_bp, url_prefix='/api')
    app.register_blueprint(anomaly_bp, url_prefix='/api')
    app.register_blueprint(hotspot_bp, url_prefix='/api')
    app.register_blueprint(complaints_bp, url_prefix='/api')
    app.register_blueprint(gov_analytics_bp, url_prefix='/api')
    app.register_blueprint(transparency_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
        
    return app

