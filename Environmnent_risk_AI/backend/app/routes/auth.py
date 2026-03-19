from flask import Blueprint, request, jsonify
import logging
import uuid

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

# Mock database of government users for demo
DEMO_USERS = {
    "admin@aeronova.gov.in": {
        "password": "Gov@12345",
        "role": "government",
        "name": "System Administrator"
    },
    "officer@mef.gov.in": {
        "password": "Officer@2026",
        "role": "government",
        "name": "Field Officer"
    }
}

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """
    Mock authentication for the Government Portal.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        logger.info(f"Login attempt for: {email}")
        
        user = DEMO_USERS.get(email)
        
        if user and user['password'] == password:
            # Successful login
            response = {
                "token": str(uuid.uuid4()),  # Mock session token
                "role": user['role'],
                "name": user['name'],
                "email": email,
                "status": "success"
            }
            logger.info(f"✅ Successful login: {email} (Role: {user['role']})")
            return jsonify(response), 200
        else:
            # Failed login
            logger.warning(f"❌ Failed login attempt: {email}")
            return jsonify({"error": "Invalid credentials. Access restricted."}), 401
            
    except Exception as e:
        logger.error(f"Error in auth route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
