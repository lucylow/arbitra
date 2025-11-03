import React, { useEffect, useState } from 'react';
import type { Dispute } from '../../types';

interface TimelineEvent {
  id: string;
  type: 'created' | 'evidence' | 'analysis' | 'decision' | 'settled' | 'appealed';
  title: string;
  description: string;
  timestamp: Date;
  actor?: string;
}

interface DisputeTimelineProps {
  dispute: Dispute;
}

export const DisputeTimeline: React.FC<DisputeTimelineProps> = ({ dispute }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const timelineEvents: TimelineEvent[] = [
      {
        id: '1',
        type: 'created',
        title: 'Dispute Created',
        description: 'Dispute was initiated and submitted to Arbitra',
        timestamp: new Date(Number(dispute.createdAt) / 1e6),
        actor: dispute.claimant.toString()
      }
    ];

    // Add events based on status
    if (dispute.status !== 'Pending') {
      timelineEvents.push({
        id: '2',
        type: 'evidence',
        title: 'Evidence Submission Started',
        description: 'Evidence collection phase began',
        timestamp: new Date(Number(dispute.updatedAt) / 1e6)
      });
    }

    if (['UnderReview', 'Decided', 'Settled', 'Appealed', 'Closed'].includes(dispute.status)) {
      timelineEvents.push({
        id: '3',
        type: 'analysis',
        title: 'AI Analysis Complete',
        description: 'AI-powered analysis has been completed',
        timestamp: new Date(Number(dispute.updatedAt) / 1e6)
      });
    }

    if (['Decided', 'Appealed', 'Closed'].includes(dispute.status)) {
      timelineEvents.push({
        id: '4',
        type: 'decision',
        title: 'Decision Rendered',
        description: dispute.decision || 'Arbitrator has rendered a decision',
        timestamp: new Date(Number(dispute.updatedAt) / 1e6),
        actor: dispute.arbitrator?.toString()
      });
    }

    if (dispute.status === 'Closed') {
      timelineEvents.push({
        id: '5',
        type: 'settled',
        title: 'Dispute Settled',
        description: 'Dispute has been resolved and closed',
        timestamp: new Date(Number(dispute.updatedAt) / 1e6)
      });
    }

    if (dispute.status === 'Appealed') {
      timelineEvents.push({
        id: '6',
        type: 'appealed',
        title: 'Decision Appealed',
        description: 'The decision has been appealed',
        timestamp: new Date(Number(dispute.updatedAt) / 1e6)
      });
    }

    setEvents(timelineEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }, [dispute]);

  const getEventIcon = (type: TimelineEvent['type']) => {
    const icons = {
      created: '📝',
      evidence: '📁',
      analysis: '🤖',
      decision: '⚖️',
      settled: '✅',
      appealed: '🔄'
    };
    return icons[type];
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    const colors = {
      created: 'bg-blue-500',
      evidence: 'bg-yellow-500',
      analysis: 'bg-purple-500',
      decision: 'bg-orange-500',
      settled: 'bg-green-500',
      appealed: 'bg-red-500'
    };
    return colors[type];
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Dispute Timeline</h3>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative flex items-start">
              {/* Icon */}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 ${getEventColor(event.type)} rounded-full flex items-center justify-center text-white text-sm`}>
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                  <time className="text-xs text-gray-500">
                    {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                  </time>
                </div>
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                {event.actor && (
                  <p className="mt-1 text-xs text-gray-400 font-mono">
                    By: {event.actor.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

