/**
 * Register Service Worker for PWA functionality
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Install prompt handling
 */
let deferredPrompt: any = null;
let installPromptAvailable = false;

// Listen for beforeinstallprompt event
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 beforeinstallprompt event fired');
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    installPromptAvailable = true;
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('installpromptavailable'));
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA was installed');
    deferredPrompt = null;
    installPromptAvailable = false;
  });
}

/**
 * Check if install prompt is available
 */
export function isInstallPromptAvailable() {
  return installPromptAvailable && deferredPrompt !== null;
}

/**
 * Prompt user to install the app
 */
export async function promptInstall(): Promise<boolean> {
  console.log('promptInstall called, deferredPrompt:', deferredPrompt);
  
  if (!deferredPrompt) {
    console.log('⚠️ Install prompt not available');
    
    // Fallback: Show manual installation instructions
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      instructions = 'في Chrome: اضغط على القائمة (⋮) ← "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      instructions = 'في Safari: اضغط على زر المشاركة (⬆️) ← "إضافة إلى الشاشة الرئيسية"';
    } else if (userAgent.includes('firefox')) {
      instructions = 'في Firefox: اضغط على القائمة (☰) ← "تثبيت" أو "إضافة إلى الشاشة الرئيسية"';
    } else if (userAgent.includes('edg')) {
      instructions = 'في Edge: اضغط على القائمة (⋯) ← "التطبيقات" ← "تثبيت هذا الموقع كتطبيق"';
    } else {
      instructions = 'في متصفحك: ابحث عن خيار "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية" في القائمة';
    }
    
    alert(`لتثبيت التطبيق:\n\n${instructions}`);
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt
    if (outcome === 'accepted') {
      deferredPrompt = null;
      installPromptAvailable = false;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error prompting install:', error);
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check for iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Check if installed via related applications
  if ('getInstalledRelatedApps' in navigator) {
    (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
      if (apps.length > 0) {
        return true;
      }
    });
  }
  
  return false;
}

/**
 * Get installation instructions based on browser
 */
export function getInstallInstructions(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'اضغط على القائمة (⋮) في الأعلى ← اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'اضغط على زر المشاركة (⬆️) في الأسفل ← اختر "إضافة إلى الشاشة الرئيسية"';
  } else if (userAgent.includes('firefox')) {
    return 'اضغط على القائمة (☰) ← اختر "تثبيت" أو "إضافة إلى الشاشة الرئيسية"';
  } else if (userAgent.includes('edg')) {
    return 'اضغط على القائمة (⋯) ← اختر "التطبيقات" ← "تثبيت هذا الموقع كتطبيق"';
  }
  
  return 'ابحث عن خيار "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية" في قائمة المتصفح';
}
