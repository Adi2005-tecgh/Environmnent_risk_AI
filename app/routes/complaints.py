from flask import Blueprint, request, jsonify
import os
import uuid
import random
from datetime import datetime
from werkzeug.utils import secure_filename
from ..config import Config
from .transparency_routes import add_transparency_record

# Test model loading on import
try:
    print("🧪 Testing model loader import...")
    from ..model_loader import model_loader
    test_model = model_loader.get_fire_smoke_model()
    print("✅ Model loader test successful")
except Exception as e:
    print(f"❌ Model loader test failed: {e}")
    import traceback
    traceback.print_exc()

complaints_bp = Blueprint('complaints', __name__)

# In-memory storage for reports (in production, use a database)
reports_storage = []

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@complaints_bp.route('/reports', methods=['GET'])
def get_reports():
    """Get all citizen reports"""
    try:
        print("GET /api/reports - Fetching all reports")
        print(f"Current reports in storage: {len(reports_storage)}")
        
        return jsonify({
            'status': 'success',
            'count': len(reports_storage),
            'reports': reports_storage
        }), 200
        
    except Exception as e:
        print(f"Error in get_reports: {str(e)}")
        return jsonify({'error': str(e)}), 500


@complaints_bp.route('/acknowledgements', methods=['GET'])
def get_acknowledgements():
    """Return all acknowledgements, optionally filtered by reporter_name"""
    try:
        reporter = request.args.get('reporter_name')
        acks = []
        for r in reports_storage:
            ack = r.get('acknowledgement')
            if ack:
                if reporter and r.get('reporter_name') != reporter:
                    continue
                acks.append({
                    'report_id': r.get('id'),
                    'reporter_name': r.get('reporter_name'),
                    'acknowledgement': ack
                })

        return jsonify({
            'status': 'success',
            'count': len(acks),
            'acknowledgements': acks
        }), 200
    except Exception as e:
        print(f"Error in get_acknowledgements: {e}")
        return jsonify({'error': str(e)}), 500

@complaints_bp.route('/reports/<report_id>/status', methods=['PUT'])
def update_report_status(report_id):
    """Update report status"""
    try:
        print(f"PUT /api/reports/{report_id}/status - Updating status")
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'Status field is required'}), 400
        
        new_status = data['status']
        valid_statuses = ['pending', 'reviewed', 'action_taken', 'escalated']
        
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        
        # Find and update the report
        for report in reports_storage:
            if report.get('id') == report_id:
                report['status'] = new_status

                # If approved/action_taken, create an acknowledgement message
                if new_status == 'action_taken':
                    reporter = report.get('reporter_name', 'Anonymous')
                    # Count verified (action_taken) reports by this reporter
                    verified_count = sum(1 for r in reports_storage if r.get('reporter_name') == reporter and r.get('status') == 'action_taken')

                    # Determine contribution level
                    if verified_count >= 5:
                        level_title = 'Climate Sentinel'
                    elif verified_count >= 2:
                        level_title = 'Green Guardian'
                    else:
                        level_title = 'Eco Contributor'

                    # Get deployment information from report
                    violation_type = report.get('violation_type', 'environmental violation')
                    location = report.get('location', 'reported location')
                    
                    # Compose official acknowledgement with deployment details (formal, <=3 sentences)
                    message = (
                        f"On behalf of the Environmental Monitoring Authority, we formally acknowledge and thank {reporter} for their verified contribution to protecting our environment. "
                        f"Your responsible report (ID: {report_id}) regarding {violation_type} at {location} has been successfully addressed with deployed resources. "
                        f"🌱 You have successfully reported {verified_count} verified environmental alerts.\n"
                        f"🌍 Contribution Status: {level_title}\n"
                        f"🚀 Status: Action Completed - Resources Deployed"
                    )

                    report['acknowledgement'] = {
                        'message': message,
                        'sent_at': datetime.utcnow().isoformat() + 'Z',
                        'deployment_completed': True,
                        'violation_type': violation_type,
                        'location': location
                    }

                    # Log to transparency registry with deployment details
                    initial = report.get('aqi', 180)
                    if isinstance(initial, str): initial = 180
                    # Simulate an improvement
                    reduction = random.randint(15, 45)
                    final = max(40, initial - reduction)
                    
                    add_transparency_record(
                        initial_aqi=initial,
                        ai_recommendation=report.get('ai_recommendation', 'Inspection'),
                        gov_action=f"Resources Deployed: {violation_type} at {location} - Action Completed",
                        final_aqi=final,
                        compliance=100
                    )

                    print(f"Acknowledgement created for report {report_id}: {report['acknowledgement']}")

                print(f"Updated report {report_id} status to {new_status}")
                return jsonify({
                    'status': 'success',
                    'message': f'Report status updated to {new_status}',
                    'report_id': report_id,
                    'new_status': new_status,
                    'acknowledgement': report.get('acknowledgement')
                }), 200
        
        return jsonify({'error': 'Report not found'}), 404
        
    except Exception as e:
        print(f"Error in update_report_status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@complaints_bp.route('/test_hybrid', methods=['GET'])
def test_hybrid_classification():
    """Test hybrid classification system"""
    try:
        print("🧪 HYBRID SYSTEM TEST STARTED")
        
        # Test 1: Fire description + fire image should match
        result1 = model_loader.classify_hybrid_violation('test_image.jpg', 'factory fire smoke')
        print(f"Test 1 - Fire + Fire Image: {result1}")
        
        # Test 2: Smoke description + smoke image should match
        result2 = model_loader.classify_hybrid_violation('test_image.jpg', 'smoke from factory')
        print(f"Test 2 - Smoke + Smoke Image: {result2}")
        
        # Test 3: No keywords + non-hazard image should use text only
        result3 = model_loader.classify_hybrid_violation('test_image.jpg', 'clear day')
        print(f"Test 3 - No keywords + Clean Image: {result3}")
        
        # Test 4: Contradictory description should reduce confidence
        result4 = model_loader.classify_hybrid_violation('test_image.jpg', 'clean air but fire detected')
        print(f"Test 4 - Contradiction + Fire Image: {result4}")
        
        print("🧪 HYBRID SYSTEM TEST COMPLETED")
        return jsonify({
            'status': 'success',
            'tests': [
                {
                    'description': 'factory fire smoke',
                    'expected': 'fire_hazard with high confidence',
                    'actual': result1,
                    'passed': result1['violation_type'] == 'fire_hazard' and result1['confidence'] > 0.8
                },
                {
                    'description': 'smoke from factory',
                    'expected': 'industrial_smoke with high confidence',
                    'actual': result2,
                    'passed': result2['violation_type'] == 'industrial_smoke' and result2['confidence'] > 0.8
                },
                {
                    'description': 'clear day',
                    'expected': 'no_violation with low confidence',
                    'actual': result3,
                    'passed': result3['violation_type'] == 'no Clear Violation' and result3['confidence'] < 0.3
                },
                {
                    'description': 'clean air but fire detected',
                    'expected': 'fire_hazard with reduced confidence',
                    'actual': result4,
                    'passed': result4['violation_type'] == 'fire_hazard' and result4['confidence'] < 0.8
                }
            ]
        })
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
@complaints_bp.route('/violations/deployment-plan', methods=['POST'])
def generate_deployment_plan():
    """Generate intelligent deployment plan based on violation type and severity"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['violation_type', 'severity', 'location', 'confidence']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        violation_type = data['violation_type']
        severity = data['severity']
        location = data['location']
        confidence = data['confidence']
        
        print(f"🚀 GENERATING DEPLOYMENT PLAN: {violation_type} - {severity} at {location}")
        
        # Rule-based deployment engine
        deployment_rules = {
            'fire_hazard': {
                'action_required': True,
                'personnel': 'Fire Response Team',
                'equipment': ['Fire Unit', 'Air Monitoring Drone'],
                'escalation_authority': 'District Level',
                'response_time_hours': 2,
                'monitoring_strategy': 'Real-time air quality monitoring with thermal imaging',
                'priority': 'CRITICAL'
            },
            'industrial_smoke': {
                'action_required': True,
                'personnel': 'Environmental Inspection Unit',
                'equipment': ['Mobile Air Monitoring Van', 'Gas Analyzer'],
                'escalation_authority': 'City Pollution Control',
                'response_time_hours': 6,
                'monitoring_strategy': 'Continuous emission monitoring with periodic sampling',
                'priority': 'HIGH'
            },
            'construction': {
                'action_required': True,
                'personnel': 'Compliance Inspection Officer',
                'equipment': ['Dust Monitoring Sensors', 'Noise Level Meter'],
                'escalation_authority': 'Municipal Authority',
                'response_time_hours': 12,
                'monitoring_strategy': 'Dust and noise level monitoring during construction hours',
                'priority': 'MEDIUM'
            },
            'vehicle_emissions': {
                'action_required': True,
                'personnel': 'Traffic Emission Squad',
                'equipment': ['Portable Emission Scanner', 'Breathalyzer'],
                'escalation_authority': 'Traffic Department',
                'response_time_hours': 5,
                'monitoring_strategy': 'Random vehicle emission checks at hotspot locations',
                'priority': 'MEDIUM'
            },
            'no_violation': {
                'action_required': False,
                'message': 'No deployment required.',
                'personnel': None,
                'equipment': [],
                'escalation_authority': None,
                'response_time_hours': 0,
                'monitoring_strategy': 'Routine monitoring only',
                'priority': 'LOW'
            }
        }
        
        # Get deployment plan for violation type
        if violation_type not in deployment_rules:
            return jsonify({'error': f'Invalid violation type: {violation_type}'}), 400
        
        plan = deployment_rules[violation_type]
        
        # Adjust response time based on severity
        if severity.lower() == 'severe' and plan['action_required']:
            plan['response_time_hours'] = max(1, plan['response_time_hours'] // 2)
            plan['priority'] = 'CRITICAL'
        elif severity.lower() == 'high' and plan['action_required']:
            plan['response_time_hours'] = max(2, plan['response_time_hours'] * 0.75)
        
        # Add confidence-based adjustments
        if confidence < 0.5 and plan['action_required']:
            plan['monitoring_strategy'] += ' (Enhanced verification required)'
        
        # Generate deployment ID
        deployment_id = f"DEPLOY-{uuid.uuid4().hex[:8].upper()}"
        
        response = {
            'deployment_id': deployment_id,
            'violation_type': violation_type,
            'severity': severity,
            'location': location,
            'confidence': confidence,
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'deployment_plan': plan
        }
        
        print(f"✅ DEPLOYMENT PLAN GENERATED: {deployment_id}")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error generating deployment plan: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@complaints_bp.route('/report_violation', methods=['POST'])
def report_violation():
    """Submit a new violation report"""
    try:
        print("POST /api/report_violation - Processing new report")
        print(f"🔍 DEBUG - Request files: {list(request.files.keys())}")
        print(f"🔍 DEBUG - Request form: {dict(request.form)}")
        print(f"🔍 DEBUG - Request content type: {request.content_type}")
        
        # Check if an image was uploaded
        if 'image' not in request.files:
            print("❌ DEBUG - No 'image' key in request.files")
            return jsonify({'error': 'No image part in the request'}), 400
            
        file = request.files['image']
        print(f"🔍 DEBUG - File object: {file}")
        print(f"🔍 DEBUG - File filename: '{file.filename}'")
        
        if file.filename == '':
            print("❌ DEBUG - Empty filename")
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            # Generate a unique filename to prevent collisions
            ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            filename = secure_filename(unique_filename)
            
            # Ensure upload folder exists
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            print(f"🔍 DEBUG - Upload folder: {Config.UPLOAD_FOLDER}")
            
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            print(f"🔍 DEBUG - Saving file to: {filepath}")
            file.save(filepath)
            print(f"✅ DEBUG - File saved successfully")
            
            # Additional metadata from form
            reporter_name = request.form.get('name', 'Anonymous')
            description = request.form.get('description', '')
            location = request.form.get('location', 'Unknown')
            
            print(f"🔍 DEBUG - Form data - name: '{reporter_name}', location: '{location}', description: '{description}'")
            
            # Real ML classification
            print(f"🔍 HYBRID CLASSIFICATION: Processing {filename}")
            print(f"📝 User name: '{reporter_name}'")
            print(f"📍 Location: '{location}'")
            print(f"📝 Description: '{description}'")
            
            # Hybrid classification using text + YOLO
            classification = model_loader.classify_hybrid_violation(filepath, description)
            
            print(f"🔍 DEBUG - Classification result: {classification}")
            
            if not classification:
                print(f"❌ Hybrid classification failed for: {filepath}")
                return jsonify({'error': 'Failed to classify image'}), 500
            
            # Create report object and store it
            report_id = uuid.uuid4().hex[:8].upper()
            new_report = {
                'id': report_id,
                'violation_type': classification['violation_type'],
                'severity': classification['severity'],
                'confidence': classification['confidence'],
                'location': location,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'image_url': f"/uploads/{filename}",
                'reporter_name': reporter_name,
                'description': description,
                'status': 'pending',
                'ai_recommendation': classification['action_required'],
                # Add hybrid classification metadata
                'text_classification': classification.get('text_classification', {}),
                'yolo_detection': classification.get('yolo_detection', {}),
                'fusion_logic': classification.get('fusion_logic', 'text_primary_yolo_secondary')
            }
            
            # Store the report
            reports_storage.append(new_report)
            print(f"✅ DEBUG - Stored new report: {report_id}")
            print(f"✅ DEBUG - Total reports in storage: {len(reports_storage)}")
            
            response_data = {
                'id': report_id,
                'violation_type': classification['violation_type'],
                'severity': classification['severity'],
                'confidence': classification['confidence'],
                'location': location,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'status': 'success',
                'message': 'Violation reported successfully',
                'complaint_id': report_id
            }
            
            print(f"✅ DEBUG - Response data: {response_data}")
            return jsonify(response_data), 200
        
        print("❌ DEBUG - File type not allowed")
        return jsonify({'error': 'File type not allowed'}), 400

    except Exception as e:
        print(f"❌ ERROR in report_violation: {str(e)}")
        import traceback
        print("❌ FULL STACK TRACE:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
