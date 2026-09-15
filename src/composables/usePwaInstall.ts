import { ref, onMounted } from 'vue';

// Interface untuk BeforeInstallPromptEvent (Chromium/Android)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// State singleton agar tersinkronisasi di seluruh aplikasi (Sidebar & Banner)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstallable = ref(false);
const isInstalled = ref(false);
const isDismissed = ref(false);

// Tangkap event secepat mungkin di level window
if (typeof window !== 'undefined') {
  // Cek apakah sudah berjalan dalam mode standalone PWA
  const checkStandalone = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  };

  isInstalled.value = checkStandalone();
  isDismissed.value = localStorage.getItem('spaceos_pwa_dismissed') === 'true';

  window.addEventListener('beforeinstallprompt', (e) => {
    // Cegah mini-infobar default browser agar kita bisa menampilkan UI kustom SpaceOS
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;
    isInstallable.value = true;
    console.log('[SpaceOS PWA] Event beforeinstallprompt tertangkap.');
  });

  window.addEventListener('appinstalled', () => {
    isInstalled.value = true;
    isInstallable.value = false;
    deferredPrompt.value = null;
    localStorage.removeItem('spaceos_pwa_dismissed');
    console.log('[SpaceOS PWA] Aplikasi berhasil diinstal!');
  });
}

export function usePwaInstall() {
  onMounted(() => {
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        isInstalled.value = true;
        isInstallable.value = false;
      }
    }
  });

  // Eksekusi prompt instalasi native
  async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt.value) {
      console.warn('[SpaceOS PWA] Prompt instalasi belum siap atau tidak didukung.');
      return false;
    }

    try {
      await deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('[SpaceOS PWA] Pengguna menyetujui instalasi.');
        isInstalled.value = true;
        isInstallable.value = false;
        deferredPrompt.value = null;
        return true;
      } else {
        console.log('[SpaceOS PWA] Pengguna menolak instalasi.');
        return false;
      }
    } catch (err) {
      console.error('[SpaceOS PWA] Gagal memicu install prompt:', err);
      return false;
    }
  }

  // Pengguna menutup banner sementara
  function dismiss() {
    isDismissed.value = true;
    localStorage.setItem('spaceos_pwa_dismissed', 'true');
  }

  // Reset dismiss (misal saat pengguna klik tombol manual di sidebar/settings)
  function showInstall() {
    isDismissed.value = false;
    localStorage.removeItem('spaceos_pwa_dismissed');
  }

  return {
    isInstallable,
    isInstalled,
    isDismissed,
    promptInstall,
    dismiss,
    showInstall,
  };
}
