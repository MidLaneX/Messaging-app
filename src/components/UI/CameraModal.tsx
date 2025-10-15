import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  isMobile?: boolean;
}

const CameraModal: React.FC<CameraModalProps> = ({ 
  isOpen, 
  onClose, 
  onCapture, 
  isMobile = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Initialize camera
  const initCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture, onClose]);

  // Toggle camera (front/back)
  const toggleCamera = useCallback(async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, initCamera, stopCamera]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!isLoading && !error) {
          capturePhoto();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, capturePhoto, isLoading, error]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center transition-opacity duration-300 ease-in-out">
      <div className={`relative ${
        isMobile ? 'w-full h-full' : 'w-full max-w-5xl mx-4 h-[90vh]'
      } bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 ${
        isMobile ? '' : 'rounded-3xl'
      } overflow-hidden shadow-2xl ring-1 ring-white/10 transform transition-all duration-300 ease-out`}>
        
        {/* Modern Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-lg">
          <div className="flex items-center justify-between p-6">
            {/* Left: Title Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Camera
                </h3>
                <p className="text-sm text-gray-400 font-medium mt-0.5">Capture the perfect moment</p>
              </div>
            </div>

            {/* Right: Close Button */}
            <button
              onClick={onClose}
              className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Close (Esc)"
            >
              <svg className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Camera View Container */}
        <div className={`relative ${isMobile ? 'h-full' : 'h-full'} bg-gradient-to-br from-gray-950 to-black flex items-center justify-center overflow-hidden`}>
          
          {/* Loading State - Professional */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 z-30">
              <div className="text-center px-6">
                {/* Animated Loader */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
                  
                  {/* Middle spinning ring */}
                  <div className="absolute inset-2 rounded-full border-4 border-teal-500/20"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-teal-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  
                  {/* Camera icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Loading Text */}
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white">Initializing Camera</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Please allow camera access when prompted
                  </p>
                  {/* Animated dots */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State - Professional */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 z-30">
              <div className="text-center px-8 max-w-lg">
                {/* Error Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-red-500/40">
                    <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                {/* Error Content */}
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-white">Camera Access Error</h4>
                  <p className="text-gray-300 leading-relaxed">{error}</p>
                  
                  {/* Help Text */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      💡 Tip: Make sure you've granted camera permissions in your browser settings
                    </p>
                  </div>

                  {/* Try Again Button */}
                  <button
                    onClick={initCamera}
                    className="group relative mt-6 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Professional Camera Frame Overlay */}
          {!isLoading && !error && (
            <>
              {/* Corner Frames - Animated */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top Left */}
                <div className="absolute top-6 left-6 w-20 h-20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent"></div>
                  <div className="absolute top-1 left-1 w-6 h-6 border-l-3 border-t-3 border-emerald-400/80 rounded-tl-xl"></div>
                </div>
                
                {/* Top Right */}
                <div className="absolute top-6 right-6 w-20 h-20">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent"></div>
                  <div className="absolute top-1 right-1 w-6 h-6 border-r-3 border-t-3 border-emerald-400/80 rounded-tr-xl"></div>
                </div>
                
                {/* Bottom Left */}
                <div className="absolute bottom-32 left-6 w-20 h-20">
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-emerald-500 to-transparent"></div>
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-l-3 border-b-3 border-emerald-400/80 rounded-bl-xl"></div>
                </div>
                
                {/* Bottom Right */}
                <div className="absolute bottom-32 right-6 w-20 h-20">
                  <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-emerald-500 to-transparent"></div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 border-r-3 border-b-3 border-emerald-400/80 rounded-br-xl"></div>
                </div>

                {/* Center Focus Point */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32">
                  <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 border-2 border-emerald-400/30 rounded-full"></div>
                </div>
              </div>

              {/* Recording Indicator */}
              <div className="absolute top-24 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <span className="text-xs font-semibold text-white tracking-wide">READY</span>
              </div>
            </>
          )}

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Professional Control Panel */}
        {!isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-2xl border-t border-white/10">
            <div className="px-8 py-10">
              {/* Main Controls */}
              <div className="flex items-center justify-center gap-8">
                {/* Camera Toggle Button - Left Side */}
                {isMobile ? (
                  <button
                    onClick={toggleCamera}
                    className="group relative flex-shrink-0"
                    title="Switch Camera"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-2xl flex items-center justify-center border border-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-xl">
                      <svg className="w-7 h-7 text-white transition-transform duration-500 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-2 border-black animate-pulse shadow-lg shadow-emerald-500/50"></div>
                    </div>
                  </button>
                ) : (
                  <div className="w-16"></div>
                )}

                {/* Capture Button - Center (Main Action) */}
                <button
                  onClick={capturePhoto}
                  className="group relative flex-shrink-0"
                  title="Take Photo"
                >
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 animate-pulse"></div>
                  
                  {/* Button container */}
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white/30 to-white/10 p-1.5 backdrop-blur-xl border-2 border-white/40 group-hover:border-white/60 transition-all duration-200 group-hover:scale-110 group-active:scale-95 shadow-2xl">
                    {/* Inner button */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 group-hover:from-emerald-400 group-hover:via-teal-500 group-hover:to-cyan-500 flex items-center justify-center shadow-inner transition-all duration-200">
                      <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" strokeWidth={3} />
                      </svg>
                    </div>
                  </div>

                  {/* Pulse ring animation */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400/50 animate-ping"></div>
                </button>

                {/* Gallery/Settings Button - Right Side */}
                {isMobile ? (
                  <div className="w-16"></div>
                ) : (
                  <button
                    onClick={toggleCamera}
                    className="group relative flex-shrink-0"
                    title="Switch Camera"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-2xl flex items-center justify-center border border-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-xl">
                      <svg className="w-7 h-7 text-white transition-transform duration-500 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>

              {/* Instructions & Keyboard Shortcuts */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-center gap-6 text-sm">
                  {/* Capture instruction */}
                  <div className="flex items-center gap-2 text-gray-300">
                    <kbd className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-mono font-semibold text-white shadow-lg">
                      Space
                    </kbd>
                    <span className="text-xs font-medium">to capture</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-4 bg-white/20"></div>
                  
                  {/* Close instruction */}
                  <div className="flex items-center gap-2 text-gray-300">
                    <kbd className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-mono font-semibold text-white shadow-lg">
                      Esc
                    </kbd>
                    <span className="text-xs font-medium">to close</span>
                  </div>
                </div>

                {/* Camera status */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Camera Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraModal;