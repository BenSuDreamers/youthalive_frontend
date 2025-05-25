import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GuestSearch from '../components/GuestSearch';
import { Event, eventsService } from '../api/events';

const SearchPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (eventId) {
        try {
          const events = await eventsService.getEvents();
          const event = events.find(e => e._id === eventId);
          if (event) {
            setCurrentEvent(event);
          }
        } catch (error) {
          console.error('Failed to load event:', error);
        }
      }
      setIsLoading(false);
    };

    loadEvent();
  }, [eventId]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              ← Dashboard
            </button>
            <h1 className="logo">Guest Search</h1>
          </div>
          <nav className="nav-menu">
            <span style={{ color: 'var(--text-secondary)' }}>
              {user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {currentEvent && (
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {currentEvent.title} - Guest Search
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Search and manually check in attendees
              </p>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <GuestSearch eventId={eventId || undefined} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
