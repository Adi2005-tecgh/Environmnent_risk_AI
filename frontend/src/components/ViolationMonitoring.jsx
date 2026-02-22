import React, { useState, useEffect } from 'react';
import { getCitizenReports, updateReportStatus } from '../api/api';
import DeploymentPanel from './DeploymentPanel';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Shield, 
  Clock, 
  MapPin, 
  Users,
  Truck,
  CheckCircle2,
  X,
  TrendingUp,
  Send
} from 'lucide-react';

const ViolationMonitoring = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [deploymentPanel, setDeploymentPanel] = useState(null);
  const [escalationConfirm, setEscalationConfirm] = useState(null);
  const [deployedReports, setDeployedReports] = useState(new Set());
  const [notification, setNotification] = useState(null);

  // Standardized violation type labels
  const VIOLATION_LABELS = {
    fire_hazard: "Fire Hazard",
    industrial_smoke: "Industrial Smoke Discharge", 
    construction: "Construction Activity",
    vehicle_emissions: "Vehicle Emissions",
    no_violation: "No Clear Violation"
  };

  const VIOLATION_ICONS = {
    fire_hazard: "🔥",
    industrial_smoke: "🏭",
    construction: "🏗️",
    vehicle_emissions: "🚗",
    no_violation: "✅"
  };

  const VIOLATION_COLORS = {
    fire_hazard: "red",
    industrial_smoke: "orange",
    construction: "yellow", 
    vehicle_emissions: "blue",
    no_violation: "green"
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getCitizenReports();
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      fetchReports(); // Refresh reports
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleEscalate = (report) => {
    setEscalationConfirm(report);
  };

  const confirmEscalate = async () => {
    if (escalationConfirm) {
      try {
        await updateReportStatus(escalationConfirm.id, 'escalated');
        fetchReports(); // Refresh reports
        setEscalationConfirm(null);
      } catch (error) {
        console.error('Error escalating report:', error);
      }
    }
  };

  const handleDeploy = async (deploymentData) => {
    try {
      console.log('Deploying resources:', deploymentData);
      
      // Mark report as deployed
      setDeployedReports(prev => new Set([...prev, deploymentData.violation_type]));
      
      // Update report status to action_taken - use the original report ID
      const reportId = deploymentPanel.id; // Use the report ID from the panel
      await updateReportStatus(reportId, 'action_taken');
      
      // Show success notification
      setNotification({
        type: 'success',
        title: '🚀 Resources Deployed Successfully!',
        message: `Deployment ID: ${deploymentData.deployment_id}\nPersonnel: ${deploymentData.deployment_plan.personnel}\nEquipment: ${deploymentData.deployment_plan.equipment.join(', ')}\n\nCitizen will receive confirmation notification.`,
        deploymentData: deploymentData
      });
      
      // Close deployment panel
      setDeploymentPanel(null);
      
      // Refresh reports to show updated status
      fetchReports();
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error deploying resources:', error);
      setNotification({
        type: 'error',
        title: '❌ Deployment Failed',
        message: 'Failed to deploy resources. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleGenerateDeployment = (report) => {
    setDeploymentPanel(report);
  };

  const handleDeploymentGenerated = (deploymentData) => {
    console.log('Deployment plan generated:', deploymentData);
    // You can update state or show notification here
  };

  // Group reports by violation type
  const groupedReports = reports.reduce((groups, report) => {
    const type = report.violation_type || 'no_violation';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(report);
    return groups;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'action_taken': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading violation reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Violation Monitoring</h2>
          <p className="text-gray-600 mt-1">
            {reports.length} total reports across {Object.keys(groupedReports).length} categories
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <TrendingUp size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Violation Categories */}
      <div className="space-y-4">
        {Object.entries(groupedReports).map(([violationType, categoryReports]) => {
          const isExpanded = expandedCategories[violationType];
          const count = categoryReports.length;
          const icon = VIOLATION_ICONS[violationType];
          const label = VIOLATION_LABELS[violationType];
          const color = VIOLATION_COLORS[violationType];

          return (
            <div key={violationType} className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Category Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(violationType)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-600">{count} report{count !== 1 ? 's' : ''}</p>
                                   </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Count Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800`}>
                    {count}
                  </span>
                  
                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* Reports List */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {categoryReports.map((report) => (
                      <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          {/* Report Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-lg">{icon}</span>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {VIOLATION_LABELS[report.violation_type]}
                                </h4>
                                <p className="text-sm text-gray-600">ID: {report.id}</p>
                              </div>
                            </div>

                            {/* Report Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="text-gray-600">{report.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-gray-600">
                                  {new Date(report.timestamp || report.created_at).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TrendingUp size={14} className="text-gray-400" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                                  {report.severity}
                                </span>
                              </div>
                            </div>

                            {/* AI Confidence */}
                            <div className="mt-3 flex items-center space-x-4">
                              <span className="text-sm text-gray-600">AI Confidence:</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(report.confidence * 100).toFixed(0)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {(report.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            {report.description && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{report.description}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="ml-4 space-y-2">
                            {/* Status Badge */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </span>

                            {/* Action Buttons - Only for real violations */}
                            {report.violation_type !== 'no_violation' && (
                              <div className="space-y-2">
                                {/* Status-based button logic */}
                                {report.status === 'action_taken' || deployedReports.has(report.id) ? (
                                  <button
                                    disabled
                                    className="w-full px-3 py-1 bg-green-100 text-green-800 text-sm rounded border border-green-200 flex items-center justify-center space-x-1 cursor-not-allowed"
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>Deployed</span>
                                  </button>
                                ) : deploymentPanel && deploymentPanel.id === report.id ? (
                                  <button
                                    onClick={() => handleDeploy(deploymentPanel)}
                                    className="w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                                  >
                                    <Send size={14} />
                                    <span>Deploy Now</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleGenerateDeployment(report)}
                                    className="w-full px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-1"
                                  >
                                    <Shield size={14} />
                                    <span>Generate Plan</span>
                                  </button>
                                )}
                                
                                {/* Escalate Button - Only show if not already escalated */}
                                {report.status !== 'escalated' && report.status !== 'action_taken' && (
                                  <button
                                    onClick={() => handleEscalate(report)}
                                    className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                  >
                                    Escalate
                                  </button>
                                )}
                              </div>
                            )}

                            {/* No Violation Status */}
                            {report.violation_type === 'no_violation' && (
                              <div className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  <CheckCircle2 size={12} className="mr-1" />
                                  No Action Required
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Violation Reports</h3>
          <p className="text-gray-600">No citizen reports have been submitted yet.</p>
        </div>
      )}

      {/* Deployment Panel */}
      {deploymentPanel && (
        <DeploymentPanel
          violation={deploymentPanel}
          onClose={() => setDeploymentPanel(null)}
          onDeploymentGenerated={handleDeploymentGenerated}
          onDeploy={handleDeploy}
        />
      )}

      {/* Escalation Confirmation Dialog */}
      {escalationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Escalation</h3>
                <p className="text-sm text-gray-600">Report ID: {escalationConfirm.id}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to escalate this violation report?
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">
                  {VIOLATION_LABELS[escalationConfirm.violation_type]}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {escalationConfirm.location}
                </p>
                <p className="text-sm text-gray-600">
                  Severity: <span className="font-medium capitalize">{escalationConfirm.severity}</span>
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEscalationConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEscalate}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle size={16} />
                <span>Escalate Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <AlertTriangle size={20} className="text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                <p className="text-sm whitespace-pre-line">{notification.message}</p>
                {notification.deploymentData && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Actions Taken:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Personnel deployed: {notification.deploymentData.deployment_plan.personnel}</li>
                      <li>• Equipment deployed: {notification.deploymentData.deployment_plan.equipment.join(', ')}</li>
                      <li>• Response time: Within {notification.deploymentData.deployment_plan.response_time_hours} hours</li>
                      <li>• Citizen notified: Yes</li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationMonitoring;
