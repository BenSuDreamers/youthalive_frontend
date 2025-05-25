import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EventList from '../components/EventList';
import { Event } from '../api/events';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Youth Alive Check-in</h1>
          <nav className="nav-menu">
            <span style={{ color: 'var(--text-secondary)' }}>
              Welcome, {user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Select an event to begin check-in operations
            </p>
          </div>

          <div className="grid grid-cols-1">
            <div className="card">
              <div className="card-body">
                <EventList 
                  onEventSelect={handleEventSelect}
                  selectedEventId={selectedEvent?._id}
                />
              </div>
            </div>

            {selectedEvent && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2">
                    <a 
                      href={`/checkin?eventId=${selectedEvent._id}`}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      🎯 Start Check-in
                    </a>
                    <a 
                      href={`/search?eventId=${selectedEvent._id}`}
                      className="btn btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      🔍 Guest Search
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
