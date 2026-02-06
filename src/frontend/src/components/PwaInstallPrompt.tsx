import { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed || standalone) {
      return;
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after a short delay if not installed
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-primary/20 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Install mytube</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {isIOS
              ? 'Add mytube to your home screen for a better experience'
              : 'Install mytube for quick access and offline support'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          {deferredPrompt && !isIOS ? (
            <Button
              onClick={handleInstallClick}
              className="w-full"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          ) : isIOS ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">To install on iOS:</p>
              <ol className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>
                    Tap the <Share className="inline h-4 w-4 mx-1" /> Share button in Safari
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Tap "Add" to confirm</span>
                </li>
              </ol>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
