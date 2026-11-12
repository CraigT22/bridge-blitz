import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

let activeWakeLock: WakeLockSentinelLike | null = null;

export async function initMobilePlatform(): Promise<void> {
  // 1. Native Capacitor Android setup (Pixel 10 XL edge-to-edge immersive status bar)
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
    } catch {
      // Ignore if status bar plugin unavailable
    }
  } else if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    // 2. Register Offline PWA / Pixel WebAPK Service Worker on web deployments
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
        // Ignore registration errors in restricted preview sandboxes
      });
    });
  }

  // 3. Keep Pixel OLED awake during active sessions
  const requestWakeLock = async (): Promise<void> => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock || document.visibilityState !== 'visible') {
      return;
    }
    try {
      activeWakeLock = await nav.wakeLock.request('screen');
    } catch {
      // WakeLock may require gesture or battery saver allowance
    }
  };

  void requestWakeLock();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !activeWakeLock) {
      void requestWakeLock();
    }
  });
}

/**
 * Triggers crisp native linear-actuator haptics on Android APK via @capacitor/haptics,
 * falling back to Web Vibration API on Chrome WebAPK.
 */
export function triggerPlatformHaptic(durationMs = 12): void {
  if (Capacitor.isNativePlatform()) {
    void Haptics.impact({
      style: durationMs >= 20 ? ImpactStyle.Medium : ImpactStyle.Light,
    }).catch(() => {});
    return;
  }

  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore unsupported sandbox vibration errors
    }
  }
}
