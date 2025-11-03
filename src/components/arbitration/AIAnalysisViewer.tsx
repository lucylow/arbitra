import React from 'react';
import type { AIAnalysis } from '../../types';

interface AIAnalysisViewerProps {
  analysis: AIAnalysis;
}

export const AIAnalysisViewer: React.FC<AIAnalysisViewerProps> = ({ analysis }) => {
  const confidencePercentage = Math.round(analysis.confidence * 100);
  const confidenceColor = confidencePercentage >= 80 ? 'green' : confidencePercentage >= 60 ? 'yellow' : 'red';

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">AI Analysis Report</h3>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            confidenceColor === 'green' ? 'bg-green-100 text-green-800' :
            confidenceColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {confidencePercentage}% Confidence
          </span>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          {analysis.summary}
        </p>
      </div>

      {/* Key Points */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points</h4>
        <ul className="space-y-2">
          {analysis.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm text-gray-600">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">AI Recommendation</h4>
        <p className="text-sm text-blue-800">{analysis.recommendation}</p>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500">
        Generated: {new Date(Number(analysis.timestamp) / 1e6).toLocaleString()}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This AI analysis is for informational purposes only and should be used as a tool to assist arbitrators. 
          The final decision rests with the assigned arbitrator and is not bound by this analysis.
        </p>
      </div>
    </div>
  );
};

