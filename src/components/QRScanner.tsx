import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { Html5QrcodeScanner } from 'html5-qrcode';
import { checkinService, Attendee } from '../api/checkin';
import CheckinModal from './CheckinModal';

interface QRScannerProps {
  onScanSuccess?: (result: any) => void;
  onScanError?: (error: string) => void;
  eventId?: string; // Add eventId to ensure QR codes are scanned for specific event
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError, eventId }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedCodesRef = useRef<Set<string>>(new Set()); // Use ref to avoid re-renders
  const lastScanTimeRef = useRef<number>(0); // Rate limiting for scans
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [scannedCount, setScannedCount] = useState(0); // Track count for display without triggering re-renders

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Attendee | null>(null);
  const [isProcessingCheckin, setIsProcessingCheckin] = useState(false);  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [0], // Only QR codes
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: false, // Hide zoom slider to reduce UI clutter
      // Configure camera selection to prefer back camera
      videoConstraints: {
        facingMode: { ideal: "environment" } // Back camera
      },
      // Improved mobile compatibility
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    const scanner = new (Html5QrcodeScanner as any)('qr-reader', config, false);
    scannerRef.current = scanner;    const onScanSuccessCallback = async (decodedText: string) => {
      // Rate limiting: prevent scanning same QR code too quickly (minimum 2 seconds between scans)
      const currentTime = Date.now();
      if (currentTime - lastScanTimeRef.current < 2000) {
        return; // Ignore rapid successive scans
      }
      lastScanTimeRef.current = currentTime;

      // Check for duplicate scans
      if (scannedCodesRef.current.has(decodedText)) {
        setMessage('This QR code has already been scanned');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
        return;
      }

      setIsScanning(true);
      setMessage('Looking up ticket...');
      setMessageType('');

      try {
        // First, lookup the ticket details without checking in
        const ticketDetails = await checkinService.lookupTicket(decodedText, eventId);
        
        // Add to scanned codes to prevent duplicate scans
        scannedCodesRef.current.add(decodedText);
        setScannedCount(scannedCodesRef.current.size); // Update count for display
        
        // Show the modal with ticket details
        setCurrentTicket(ticketDetails);
        setShowModal(true);
        setMessage('');
        setMessageType('');
        
      } catch (error: any) {
        console.error('QR lookup error details:', error);
        
        let errorMessage = 'Ticket lookup failed. Please try again.';
        
        // Handle specific error cases
        if (error.response?.status === 404) {
          errorMessage = 'QR code not found. This ticket may not exist or may be for a different event.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message && !error.message.includes('toStrong')) {
          // Suppress the mobile "toStrong" error but show other meaningful errors
          errorMessage = error.message;
        }
        
        setMessage(errorMessage);
        setMessageType('error');
        
        if (onScanError) {
          onScanError(errorMessage);
        }

        // Auto-clear error after 5 seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      } finally {
        setIsScanning(false);
      }
    };

    const onScanErrorCallback = (errorMessage: string) => {
      // Suppress common mobile errors and scanning attempt messages
      if (errorMessage.includes('No QR code found') || 
          errorMessage.includes('toStrong') ||
          errorMessage.includes('QR code parse error')) {
        return; // Don't log these common scanning errors
      }
      console.warn('QR Scan Error:', errorMessage);
    };

    // Enhanced scanner initialization with better mobile support
    try {
      scanner.render(onScanSuccessCallback, onScanErrorCallback);
    } catch (error) {
      console.error('Scanner initialization error:', error);
      setMessage('Camera initialization failed. Please check camera permissions.');
      setMessageType('error');
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch((clearError: any) => {
            // Suppress cleanup errors on mobile
            if (!clearError.message?.includes('toStrong')) {
              console.error('Scanner cleanup error:', clearError);
            }
          });
        } catch (error) {
          // Suppress cleanup errors
        }      }    };
  }, [onScanSuccess, onScanError, eventId]); // Removed scannedCodes dependency to prevent re-initialization

  // Handle modal confirmation (actual check-in)
  const handleConfirmCheckin = async () => {
    if (!currentTicket) return;

    setIsProcessingCheckin(true);
    
    try {
      const result = await checkinService.scanQR({ 
        qrData: currentTicket.invoiceNo,
        eventId: eventId 
      });
      
      setMessage(result.message);
      setMessageType('success');
      setShowModal(false);
      setCurrentTicket(null);
      
      if (onScanSuccess) {
        onScanSuccess(result);
      }

      // Auto-clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Check-in error:', error);
      
      let errorMessage = 'Check-in failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
      
      if (onScanError) {
        onScanError(errorMessage);
      }

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } finally {
      setIsProcessingCheckin(false);
    }
  };

  // Handle modal cancellation
  const handleCancelCheckin = () => {
    setShowModal(false);
    setCurrentTicket(null);
  };
  // Function to clear scanned codes history
  const clearScannedCodes = () => {
    scannedCodesRef.current.clear();
    setScannedCount(0);
    setMessage('Scanned codes history cleared');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  return (
    <>
      <div className="qr-scanner-container">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          QR Code Scanner
        </h2>
        
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Position the QR code within the scanner frame
          {eventId && <><br /><small>Scanning for current event only</small></>}
        </p>

        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {isScanning && (
          <div className="loading-container" style={{ minHeight: '60px' }}>
            <div className="loading-spinner"></div>
            <p>Looking up ticket...</p>
          </div>
        )}

        <div id="qr-reader" className="qr-scanner"></div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {scannedCount > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Scanned codes: {scannedCount}
              </p>
              <button 
                onClick={clearScannedCodes}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
              >
                Clear History
              </button>
            </div>
          )}
          
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p>Allow camera access when prompted</p>
            <p>Make sure the QR code is well-lit and clearly visible</p>
            <p>Review ticket details before confirming check-in</p>
          </div>
        </div>
      </div>

      <CheckinModal
        isOpen={showModal}
        ticketDetails={currentTicket}
        onConfirm={handleConfirmCheckin}
        onCancel={handleCancelCheckin}
        isProcessing={isProcessingCheckin}
      />
    </>
  );
};

export default QRScanner;
