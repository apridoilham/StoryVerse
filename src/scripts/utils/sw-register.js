import { Workbox } from 'workbox-window';

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const wb = new Workbox('sw.js');
  
  wb.addEventListener('installed', event => {
      if(event.isUpdate) {
        Swal.fire({
            title: 'Aplikasi Telah Diperbarui',
            text: 'Muat ulang untuk mendapatkan versi terbaru?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Muat Ulang'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
      }
  });

  wb.register();
};