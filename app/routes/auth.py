"""
Authentication Route
Handles government portal login. Hackathon-grade: uses hardcoded credentials.
"""

from flask import Blueprint, jsonify, request
import hashlib
import hmac
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

# ─── Authorised accounts (extend as needed) ───────────────────────────────────
# Passwords stored as SHA-256 hex digests (never plain-text in production)
GOVERNMENT_USERS = {
    "admin@aeronova.gov.in": {
        "password_hash": hashlib.sha256(b"Gov@12345").hexdigest(),
        "role": "government",
        "name": "System Administrator",
    },
    "officer@mef.gov.in": {
        "password_hash": hashlib.sha256(b"Officer@2026").hexdigest(),
        "role": "government",
        "name": "Environmental Officer",
    },
}

# Simple deterministic token (not JWT – hackathon level)
SECRET = b"aeronova-government-secret-2026"


def _make_token(email: str, role: str) -> str:
    """Generate a reproducible HMAC-based session token."""
    msg = f"{email}:{role}".encode()
    return hmac.new(SECRET, msg, digestmod=hashlib.sha256).hexdigest()


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    body = request.get_json(silent=True) or {}
    email    = (body.get('email') or '').strip().lower()
    password = (body.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = GOVERNMENT_USERS.get(email)

    if not user:
        logger.warning(f"[AUTH] Unknown email attempted: {email}")
        return jsonify({'error': 'Invalid credentials. Access restricted.'}), 401

    input_hash = hashlib.sha256(password.encode()).hexdigest()
    if not hmac.compare_digest(user['password_hash'], input_hash):
        logger.warning(f"[AUTH] Wrong password for: {email}")
        return jsonify({'error': 'Invalid credentials. Access restricted.'}), 401

    token = _make_token(email, user['role'])
    logger.info(f"[AUTH] Successful login: {email}")

    return jsonify({
        'token': token,
        'role': user['role'],
        'name': user['name'],
        'email': email,
    }), 200


@auth_bp.route('/auth/verify', methods=['GET'])
def verify():
    """Lightweight token verification endpoint."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'valid': False}), 401

    token = auth_header[7:]
    # Validate against all known users
    for email, user in GOVERNMENT_USERS.items():
        expected = _make_token(email, user['role'])
        if hmac.compare_digest(expected, token):
            return jsonify({
                'valid': True,
                'role': user['role'],
                'name': user['name'],
                'email': email,
            }), 200

    return jsonify({'valid': False}), 401
