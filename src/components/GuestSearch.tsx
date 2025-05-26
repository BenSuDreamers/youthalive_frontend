import React, { useState, useCallback } from 'react';
import { checkinService, Attendee } from '../api/checkin';
import { exportService } from '../api/export';

interface GuestSearchProps {
  eventId?: string;
}

const GuestSearch: React.FC<GuestSearchProps> = ({ eventId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAttendees([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const results = await checkinService.searchAttendees({
        query: query.trim(),
        eventId,
      });
      setAttendees(results);
      setHasSearched(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Search failed. Please try again.');
      setAttendees([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };
  const handleManualCheckIn = async (attendee: Attendee) => {
    try {
      await checkinService.scanQR({ qrData: attendee.invoiceNo });
      
      // Update local state
      setAttendees(prev => 
        prev.map(a => 
          a.id === attendee.id 
            ? { ...a, checkedIn: true, checkInTime: new Date().toISOString() }
            : a
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Check-in failed. Please try again.');
    }
  };

  const handleExport = async () => {
    if (!eventId) return;
    
    setIsExporting(true);
    setError('');
    
    try {
      await exportService.exportTickets(eventId);
    } catch (error: any) {
      setError('Failed to export tickets. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>
          Guest Search
        </h2>
        {eventId && (
          <button
            onClick={handleExport}
            className="btn btn-secondary"
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isExporting ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                Exporting...
              </>
            ) : (
              <>
                📊 Export Guest List
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="search-container">
        <div className="form-group">
          <label htmlFor="search" className="form-label">
            Search by name, email, or phone number
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter name, email, or phone..."
            autoComplete="off"
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      <div className="search-results">
        {hasSearched && !isLoading && attendees.length === 0 && (
          <div className="alert alert-info">
            No attendees found matching your search.
          </div>
        )}        {attendees.map((attendee) => (
          <div
            key={attendee.id}
            className={`attendee-card ${attendee.checkedIn ? 'checked-in' : ''}`}
          >
            <div className="attendee-info">
              <div className="attendee-details">
                <h3>{attendee.name}</h3>
                <p><strong>Email:</strong> {attendee.email}</p>
                <p><strong>Invoice:</strong> {attendee.invoiceNo}</p>
                {attendee.checkedIn && attendee.checkInTime && (
                  <p><strong>Checked in:</strong> {formatDateTime(attendee.checkInTime)}</p>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span
                  className={`check-in-status ${
                    attendee.checkedIn ? 'status-checked-in' : 'status-pending'
                  }`}
                >
                  {attendee.checkedIn ? 'Checked In' : 'Pending'}
                </span>
                
                {!attendee.checkedIn && (
                  <button
                    onClick={() => handleManualCheckIn(attendee)}
                    className="btn btn-success"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Check In
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestSearch;