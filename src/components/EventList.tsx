import React, { useState, useEffect } from 'react';
import { eventsService, Event } from '../api/events';

interface EventListProps {
  onEventSelect?: (event: Event) => void;
  selectedEventId?: string;
}

const EventList: React.FC<EventListProps> = ({ onEventSelect, selectedEventId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await eventsService.getEvents();
        setEvents(eventData);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isEventActive = (event: Event) => {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    return now >= eventStart && now <= eventEnd;
  };

  const isEventUpcoming = (event: Event) => {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    return now < eventStart;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="alert alert-info">
        No events found. Events will appear here once they are created in Jotform.
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        Events
      </h2>
      
      <div className="grid grid-cols-1">
        {events.map((event) => {
          const isActive = isEventActive(event);
          const isUpcoming = isEventUpcoming(event);
          const isSelected = selectedEventId === event._id;
          
          return (
            <div
              key={event._id}
              className={`card ${isSelected ? 'selected-event' : ''}`}
              style={{
                cursor: onEventSelect ? 'pointer' : 'default',
                border: isSelected ? '2px solid var(--primary-color)' : undefined,
              }}
              onClick={() => onEventSelect && onEventSelect(event)}
            >
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="card-title">{event.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isActive && (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: 'rgba(72, 187, 120, 0.1)',
                          color: 'var(--success-color)',
                        }}
                      >
                        Active
                      </span>
                    )}
                    {isUpcoming && (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: 'rgba(107, 115, 255, 0.1)',
                          color: 'var(--primary-color)',
                        }}
                      >
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Start Time:</strong>
                    <br />
                    <span style={{ color: 'var(--text-primary)' }}>
                      {formatDateTime(event.startTime)}
                    </span>
                  </div>
                  
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>End Time:</strong>
                    <br />
                    <span style={{ color: 'var(--text-primary)' }}>
                      {formatDateTime(event.endTime)}
                    </span>
                  </div>
                  
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Form ID:</strong>
                    <br />
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {event.formId}
                    </span>
                  </div>
                </div>
              </div>
              
              {onEventSelect && (
                <div className="card-footer">
                  <button
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-full`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect(event);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select Event'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventList;