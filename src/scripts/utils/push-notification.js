import CONFIG from "./config.js";
import Data from "../data/api.js";

const PushNotification = {
  async init(button) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      button.style.display = 'none';
      return;
    }

    const permissionResult = await navigator.permissions.query({ name: 'push', userVisibleOnly: true });
    this._updateButtonState(button, permissionResult.state);

    button.addEventListener('click', async () => {
      this._handleSubscriptionClick(button);
    });
  },

  async _handleSubscriptionClick(button) {
    button.disabled = true;

    const permissionResult = await navigator.permissions.query({ name: 'push', userVisibleOnly: true });

    if (permissionResult.state === 'granted') {
      Swal.fire('Sudah Aktif', 'Anda sudah mengaktifkan notifikasi.', 'info');
      this._updateButtonState(button, 'granted');
      button.disabled = false;
      return;
    }

    if (permissionResult.state === 'denied') {
      Swal.fire('Diblokir', 'Anda telah memblokir izin notifikasi. Harap ubah setelan di browser Anda.', 'error');
      this._updateButtonState(button, 'denied');
      button.disabled = true;
      return;
    }

    if (permissionResult.state === 'prompt') {
      try {
        const newPermission = await Notification.requestPermission();
        if (newPermission === 'granted') {
          await this._subscribe();
        }
        this._updateButtonState(button, newPermission);
      } catch (error) {
        Swal.fire('Error', 'Terjadi kesalahan saat meminta izin notifikasi.', 'error');
        this._updateButtonState(button, 'prompt');
      }
    }

    button.disabled = false;
  },

  async _subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = this._urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
  
      await Data.subscribePush(subscription);
  
      Swal.fire('Berhasil!', 'Anda berhasil subscribe notifikasi.', 'success');
    } catch (err) {
      console.error('Gagal melakukan subscribe:', err);
      Swal.fire('Gagal', `Gagal mengaktifkan notifikasi: ${err.message}`, 'error');
    }
  },

  _updateButtonState(button, state) {
    if (!button) return;

    switch (state) {
      case 'granted':
        button.innerHTML = '<i class="fas fa-check-circle"></i> Notifikasi Sudah Aktif';
        button.className = 'action-button button--success';
        button.disabled = false;
        break;
      case 'denied':
        button.innerHTML = '<i class="fas fa-ban"></i> Notifikasi Diblokir';
        button.className = 'action-button';
        button.disabled = true;
        break;
      case 'prompt':
      default:
        button.innerHTML = '<i class="fas fa-bell"></i> Aktifkan Notifikasi';
        button.className = 'action-button';
        button.disabled = false;
        break;
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};

export default PushNotification;