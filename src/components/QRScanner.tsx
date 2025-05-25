import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { Html5QrcodeScanner } from 'html5-qrcode';
import { checkinService } from '../api/checkin';

interface QRScannerProps {
  onScanSuccess?: (result: any) => void;
  onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [0], // Only QR codes
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    const scanner = new (Html5QrcodeScanner as any)('qr-reader', config, false);
    scannerRef.current = scanner;

    const onScanSuccessCallback = async (decodedText: string) => {
      setIsScanning(true);
      setMessage('Processing check-in...');
      setMessageType('');

      try {
        const result = await checkinService.scanQR({ qrData: decodedText });
        setMessage(result.message);
        setMessageType('success');
        
        if (onScanSuccess) {
          onScanSuccess(result);
        }

        // Auto-clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Check-in failed. Please try again.';
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
      // Don't log every scan attempt error, just major issues
      if (errorMessage.includes('No QR code found') === false) {
        console.warn('QR Scan Error:', errorMessage);
      }
    };

    scanner.render(onScanSuccessCallback, onScanErrorCallback);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="qr-scanner-container">
      <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        QR Code Scanner
      </h2>
      
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Position the QR code within the scanner frame
      </p>

      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {isScanning && (
        <div className="loading-container" style={{ minHeight: '60px' }}>
          <div className="loading-spinner"></div>
          <p>Processing check-in...</p>
        </div>
      )}

      <div id="qr-reader" className="qr-scanner"></div>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>Allow camera access when prompted</p>
        <p>Make sure the QR code is well-lit and clearly visible</p>
      </div>
    </div>
  );
};

export default QRScanner;