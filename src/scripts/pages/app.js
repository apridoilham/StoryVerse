import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import indexedDBHandler from '../utils/db.js';

class App {
  constructor({ content, drawerButton, navigationDrawer, logoutButton, header, footer }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;
    this._logoutButton = logoutButton;
    this._header = header;
    this._footer = footer;
  }

  async start() {
    await this._migrateOfflineImages();
    this._setupEventListeners();
    await this._renderPage();
  }

  _setupEventListeners() {
    this._drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this._navigationDrawer.classList.toggle('open');
    });

    this._logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      this._handleLogout();
    });

    window.addEventListener('hashchange', () => {
      this._renderPage();
    });
  }

  async _cacheImage(imageUrl) {
    try {
      const cache = await caches.open('image-cache');
      const request = new Request(imageUrl, { mode: 'no-cors' });
      const response = await fetch(request);
      if (!response.ok && response.type !== 'opaque') {
        throw new Error(`Gagal mengambil gambar: ${imageUrl}`);
      }
      await cache.put(request, response);
    } catch (error) {
      console.error('Gagal melakukan caching gambar untuk migrasi:', error);
    }
  }

  async _migrateOfflineImages() {
    try {
      const stories = await indexedDBHandler.getAllData();
      if (!stories || stories.length === 0) return;
      const cache = await caches.open('image-cache');
      for (const story of stories) {
        if (story.photoUrl) {
          const isCached = await cache.match(story.photoUrl);
          if (!isCached) await this._cacheImage(story.photoUrl);
        }
      }
    } catch(error) {
      console.error("Gagal menjalankan migrasi gambar:", error);
    }
  }

  _handleLogout() {
      Swal.fire({
        title: 'Konfirmasi Logout',
        text: "Apakah Anda yakin ingin keluar dari StoryVerse?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary-color)',
        cancelButtonColor: 'var(--danger-color)',
        confirmButtonText: 'Ya, Logout!',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          sessionStorage.removeItem('token');
          window.location.hash = '#/login';
          window.location.reload();
        }
      })
  }

  _initialAppShell() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this._header.classList.remove('hidden');
      this._footer.classList.remove('hidden');
    } else {
      this._header.classList.add('hidden');
      this._footer.classList.add('hidden');
    }
  }

  async _renderPage() {
    const token = sessionStorage.getItem('token');
    const currentPath = (window.location.hash.slice(1).toLowerCase() || '/').split('?')[0];

    const isAllowedWithoutToken = 
      currentPath === '/login' || 
      currentPath === '/register' || 
      currentPath.startsWith('/detail/');
    
    if (!token && !isAllowedWithoutToken) {
      window.location.hash = '#/login';
      return;
    }
    
    if (token && (currentPath === '/login' || currentPath === '/register')) {
      window.location.hash = '#/';
      return;
    }

    this._initialAppShell();
    
    const url = getActiveRoute();
    const pageLoader = routes[url] || routes['/not-found'];

    const renderContent = async () => {
      const PageModule = await pageLoader();
      const PageClass = PageModule.default;
      const page = new PageClass();
      
      this._content.innerHTML = await page.render();
      await page.afterRender();
    };

    if (!document.startViewTransition || document.visibilityState !== 'visible') {
      await renderContent();
    } else {
      document.startViewTransition(renderContent);
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.nav-link[data-route="${url}"]`);
    if(activeLink) {
        activeLink.classList.add('active');
    }

    if (this._navigationDrawer.classList.contains('open')) {
      this._navigationDrawer.classList.remove('open');
    }
  }
}

export default App;