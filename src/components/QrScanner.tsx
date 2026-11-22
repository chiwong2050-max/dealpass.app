import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AlertCircle, Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface QrScannerProps {
  onResult: (text: string) => void;
  onError?: (error: any) => void;
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  verbose?: boolean;
}

const QrScanner: React.FC<QrScannerProps> = ({
  onResult,
  onError,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1,
  disableFlip = false,
  verbose = false,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup function to stop scanning when component unmounts
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
           scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        }
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            setCameras(devices);
            // Prefer back camera
            const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            const cameraId = backCamera ? backCamera.id : devices[0].id;
            setActiveCameraId(cameraId);
            
            initScanner(cameraId);
        } else {
            setError("No cameras found.");
            setHasPermission(false);
        }
    } catch (err: any) {
        console.error("Camera permission error", err);
        setHasPermission(false);
        setError("Camera permission denied. Please allow camera access.");
        if (onError) onError(err);
    }
  };

  const initScanner = (cameraId: string) => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { 
          fps, 
          qrbox, 
          aspectRatio,
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] 
      };

      html5QrCode.start(
          cameraId, 
          config,
          (decodedText) => {
              onResult(decodedText);
          },
          (errorMessage) => {
              // ignore parse errors, they flood the console
          }
      ).then(() => {
          setHasPermission(true);
      }).catch(err => {
          setError("Failed to start scanner.");
          setHasPermission(false);
          if (onError) onError(err);
      });
  };

  useEffect(() => {
      startScanning();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative rounded-lg overflow-hidden">
        {/* The div where html5-qrcode renders the video */}
        <div id="reader" className="w-full h-full"></div>

        {/* Loading State */}
        {hasPermission === null && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 z-10">
                <Loader2 className="w-10 h-10 animate-spin mb-2 text-primary" />
                <p>Starting Camera...</p>
            </div>
        )}

        {/* Error State */}
        {error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 z-20 p-6 text-center">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="bg-white text-black">
                    Retry
                </Button>
            </div>
        )}
        
        {/* Overlay Guide (Optional, html5-qrcode has its own, but we can overlay extra UI) */}
        {hasPermission && (
             <div className="absolute inset-0 pointer-events-none border-[30px] border-black/50">
                 {/* This creates a simple frame effect */}
             </div>
        )}
    </div>
  );
};

export default QrScanner;