import React, { useState } from 'react';
import { X, Users, Truck, AlertTriangle, Clock, Shield, CheckCircle2, Send } from 'lucide-react';
import { generateDeploymentPlan } from '../api/api';

const DeploymentPanel = ({ violation, onClose, onDeploymentGenerated, onDeploy }) => {
  const [loading, setLoading] = useState(false);
  const [deploymentPlan, setDeploymentPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generateDeploymentPlan({
        violation_type: violation.violation_type,
        severity: violation.severity,
        location: violation.location,
        confidence: violation.confidence
      });
      
      setDeploymentPlan(response.data);
      onDeploymentGenerated(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate deployment plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = () => {
    if (deploymentPlan && onDeploy) {
      onDeploy(deploymentPlan);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getViolationIcon = (type) => {
    switch (type) {
      case 'fire_hazard': return '🔥';
      case 'industrial_smoke': return '🏭';
      case 'construction': return '🏗️';
      case 'vehicle_emissions': return '🚗';
      default: return '✅';
    }
  };

  const getViolationLabel = (type) => {
    const LABELS = {
      fire_hazard: "Fire Hazard",
      industrial_smoke: "Industrial Smoke Discharge",
      construction: "Construction Activity",
      vehicle_emissions: "Vehicle Emissions",
      no_violation: "No Clear Violation"
    };
    return LABELS[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getViolationIcon(violation.violation_type)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Deployment Plan</h2>
              <p className="text-sm text-gray-600">{getViolationLabel(violation.violation_type)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Violation Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Violation Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-medium">{violation.location}</p>
              </div>
              <div>
                <span className="text-gray-600">Severity:</span>
                <p className="font-medium capitalize">{violation.severity}</p>
              </div>
              <div>
                <span className="text-gray-600">Confidence:</span>
                <p className="font-medium">{Math.round(violation.confidence * 100)}%</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium capitalize">{violation.status}</p>
              </div>
            </div>
          </div>

          {/* Generate Plan Button */}
          {!deploymentPlan && (
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Generate Deployment Plan</span>
                </>
              )}
            </button>
          )}

          {/* Deploy Button */}
          {deploymentPlan && (
            <button
              onClick={handleDeploy}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Deploy Resources</span>
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={20} className="text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Deployment Plan Display */}
          {deploymentPlan && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={20} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">Deployment Plan Generated</h3>
              </div>

              {/* Priority Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(deploymentPlan.deployment_plan.priority)}`}>
                <AlertTriangle size={16} className="mr-1" />
                {deploymentPlan.deployment_plan.priority} PRIORITY
              </div>

              {/* Deployment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personnel */}
                {deploymentPlan.deployment_plan.personnel && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users size={18} className="text-blue-600" />
                      <h4 className="font-medium text-blue-900">Required Personnel</h4>
                    </div>
                    <p className="text-blue-800">{deploymentPlan.deployment_plan.personnel}</p>
                  </div>
                )}

                {/* Equipment */}
                {deploymentPlan.deployment_plan.equipment.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck size={18} className="text-green-600" />
                      <h4 className="font-medium text-green-900">Required Equipment</h4>
                    </div>
                    <ul className="text-green-800 space-y-1">
                      {deploymentPlan.deployment_plan.equipment.map((item, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Escalation Authority */}
                {deploymentPlan.deployment_plan.escalation_authority && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield size={18} className="text-orange-600" />
                      <h4 className="font-medium text-orange-900">Escalation Authority</h4>
                    </div>
                    <p className="text-orange-800">{deploymentPlan.deployment_plan.escalation_authority}</p>
                  </div>
                )}

                {/* Response Time */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock size={18} className="text-purple-600" />
                    <h4 className="font-medium text-purple-900">Response Time</h4>
                  </div>
                  <p className="text-purple-800">
                    {deploymentPlan.deployment_plan.response_time_hours === 0 
                      ? 'No response required' 
                      : `Within ${deploymentPlan.deployment_plan.response_time_hours} hours`
                    }
                  </p>
                </div>
              </div>

              {/* Monitoring Strategy */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Monitoring Strategy</h4>
                <p className="text-gray-700">{deploymentPlan.deployment_plan.monitoring_strategy}</p>
              </div>

              {/* Deployment Info */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Deployment ID: {deploymentPlan.deployment_id}</p>
                <p>Generated: {new Date(deploymentPlan.generated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeploymentPanel;
