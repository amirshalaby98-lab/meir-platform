import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Info } from "lucide-react";
import { promptInstall, isAppInstalled, isInstallPromptAvailable, getInstallInstructions } from "@/registerSW";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isAppInstalled()) {
      console.log('App is already installed');
      return;
    }

    // Check if user dismissed the prompt before
    const isDismissed = localStorage.getItem("installPromptDismissed");
    if (isDismissed) {
      return;
    }

    // Show prompt after 5 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    // Also listen for custom event when install prompt becomes available
    const handlePromptAvailable = () => {
      console.log('Install prompt became available');
      setShowPrompt(true);
    };
    
    window.addEventListener('installpromptavailable', handlePromptAvailable);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('installpromptavailable', handlePromptAvailable);
    };
  }, []);

  const handleInstall = async () => {
    console.log('Install button clicked');
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
      localStorage.setItem("installPromptDismissed", "true");
    } else {
      // If prompt not available, show instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (!showPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2 border-yellow-400 bg-gradient-to-br from-white to-yellow-50">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 left-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <div className="flex items-start gap-4 mt-2">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Download className="w-6 h-6 text-black" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">ثبّت تطبيق مير</h3>
              <p className="text-sm text-gray-600 mb-3">
                احصل على تجربة أسرع وأسهل! ثبّت التطبيق على هاتفك للوصول السريع والعمل بدون إنترنت.
              </p>

              {showInstructions && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      {getInstallInstructions()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                >
                  <Download className="w-4 h-4 ml-2" />
                  {isInstallPromptAvailable() ? 'تثبيت الآن' : 'كيفية التثبيت'}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="px-4"
                >
                  لاحقاً
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
