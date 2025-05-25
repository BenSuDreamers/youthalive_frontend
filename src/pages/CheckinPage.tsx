import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import GuestSearch from '../components/GuestSearch';
import { Event, eventsService } from '../api/events';

const CheckinPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'search'>('scanner');
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

  const handleScanSuccess = (result: any) => {
    // Success message is already handled by QRScanner component
    console.log('Scan successful:', result);
  };

  const handleScanError = (error: string) => {
    // Error message is already handled by QRScanner component
    console.error('Scan error:', error);
  };

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
            <h1 className="logo">Check-in</h1>
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
                {currentEvent.title}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Event check-in started at {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`btn ${activeTab === 'scanner' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  QR Scanner
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`btn ${activeTab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Guest Search
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {activeTab === 'scanner' ? (
                <QRScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                />
              ) : (
                <GuestSearch eventId={eventId || undefined} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckinPage;
