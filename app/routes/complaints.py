from flask import Blueprint, request, jsonify
import os
import uuid
from werkzeug.utils import secure_filename
from ..config import Config

complaints_bp = Blueprint('complaints', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@complaints_bp.route('/report_violation', methods=['POST'])
def report_violation():
    try:
        # Check if an image was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image part in the request'}), 400
            
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            # Generate a unique filename to prevent collisions
            ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            filename = secure_filename(unique_filename)
            
            # Ensure upload folder exists
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Additional metadata from form
            reporter_name = request.form.get('name', 'Anonymous')
            description = request.form.get('description', '')
            location = request.form.get('location', 'Unknown')
            
            # Dummy classification as requested
            dummy_classification = {
                'violation_type': 'Industrial Smoke Discharge',
                'confidence': 0.89,
                'severity': 'High',
                'action_required': 'Immediate Inspection'
            }
            
            return jsonify({
                'status': 'success',
                'message': 'Violation reported successfully',
                'complaint_id': uuid.uuid4().hex[:8].upper(),
                'saved_as': filename,
                'classification': dummy_classification,
                'details': {
                    'reporter': reporter_name,
                    'location': location,
                    'description': description
                }
            }), 201
        
        return jsonify({'error': 'File type not allowed'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500
