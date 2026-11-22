import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Share, PlusSquare, Download, Smartphone } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Handle Android/Desktop prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Only show if not standalone and on iOS
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
        // Show prompt after a short delay to not annoy immediately
        const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
        return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isInstalled) return null;

  // iOS Instructions (Bottom Sheet)
  if (showIOSPrompt) {
      return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t shadow-2xl z-[100] animate-in slide-in-from-bottom duration-500">
            <div className="max-w-md mx-auto relative">
                <button onClick={() => setShowIOSPrompt(false)} className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Install App</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-3">
                            Add to Home Screen for the best full-screen experience.
                        </p>
                        <div className="text-sm flex flex-col gap-2 text-gray-700 dark:text-gray-200">
                            <div className="flex items-center gap-2">
                                1. Tap the <Share className="w-4 h-4 text-blue-500" /> <strong>Share</strong> button below.
                            </div>
                            <div className="flex items-center gap-2">
                                2. Select <PlusSquare className="w-4 h-4 text-gray-500" /> <strong>Add to Home Screen</strong>.
                            </div>
                        </div>
                    </div>
                </div>
                {/* Pointer for iOS Safari Bottom Bar */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rotate-45 border-r border-b border-gray-200 dark:border-gray-800"></div>
            </div>
        </div>
      );
  }

  // Android / Desktop Chrome Prompt
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-80 animate-in fade-in zoom-in duration-300">
        <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Download className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm">Install App</p>
                    <p className="text-[10px] opacity-80">Faster access, works offline.</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-white/10 h-8" onClick={() => setDeferredPrompt(null)}>
                    Later
                </Button>
                <Button size="sm" variant="secondary" className="h-8 font-bold text-primary bg-white hover:bg-gray-100" onClick={handleInstallClick}>
                    Install
                </Button>
            </div>
        </div>
    </div>
  );
};

export default InstallPWA;