import React from 'react';

interface TicketDetails {
  id: string;
  invoiceNo: string;
  name: string;
  email: string;
  phone?: string;
  church?: string;
  checkedIn: boolean;
  checkInTime?: string;
}

interface CheckinModalProps {
  isOpen: boolean;
  ticketDetails: TicketDetails | null;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  ticketDetails,
  onConfirm,
  onCancel,
  isProcessing = false
}) => {
  if (!isOpen || !ticketDetails) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Check-in</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="ticket-details">
            <div className="detail-row">
              <label>Name:</label>
              <span>{ticketDetails.name}</span>
            </div>
            
            <div className="detail-row">
              <label>Email:</label>
              <span>{ticketDetails.email}</span>
            </div>
            
            {ticketDetails.phone && (
              <div className="detail-row">
                <label>Phone:</label>
                <span>{ticketDetails.phone}</span>
              </div>
            )}
            
            {ticketDetails.church && (
              <div className="detail-row">
                <label>Church:</label>
                <span>{ticketDetails.church}</span>
              </div>
            )}
            
            <div className="detail-row">
              <label>Invoice Number:</label>
              <span>{ticketDetails.invoiceNo}</span>
            </div>
            
            <div className="detail-row">
              <label>Status:</label>
              <span className={ticketDetails.checkedIn ? 'status-checked-in' : 'status-pending'}>
                {ticketDetails.checkedIn ? 'Already Checked In' : 'Not Checked In'}
              </span>
            </div>
            
            {ticketDetails.checkedIn && ticketDetails.checkInTime && (
              <div className="detail-row">
                <label>Check-in Time:</label>
                <span>{new Date(ticketDetails.checkInTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            disabled={isProcessing || ticketDetails.checkedIn}
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                Processing...
              </>
            ) : ticketDetails.checkedIn ? (
              'Already Checked In'
            ) : (
              'Check In'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinModal;
