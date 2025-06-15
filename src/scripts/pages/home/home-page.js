import Data from "../../data/api.js";
import HomePresenter from "./home-presenter.js";
import PushNotification from "../../utils/push-notification.js";
import L from 'leaflet';
import 'leaflet.markercluster';

export default class HomePage {
  #presenter;
  #map;
  #markerClusterGroup;

  async render() {
    return `
      <div class="container">
        <div class="home-hero">
          <div id="stories-map" class="home-map"></div>
          <div class="home-hero-content">
            <h2 class="home-hero-title">Jelajahi Dunia, Bagikan Kisahmu</h2>
            <p class="home-hero-tagline">Setiap sudut dunia memiliki cerita. Temukan kisah-kisah menakjubkan dari para petualang lain atau mulai bagikan perjalananmu sendiri di StoryVerse.</p>
            <button id="button-subscribe" class="action-button">
              <i class="fas fa-spinner fa-spin"></i> Inisialisasi Notifikasi...
            </button>
          </div>
        </div>

        <h2 class="section-title">Kisah Terbaru</h2>
        <div id="loading-container"></div>
        <div id="story-grid" class="story-grid"></div>
        <div id="load-more-container" class="load-more-container"></div>
      </div>
    `;
  }

  showLoading() {
    document.getElementById("loading-container").innerHTML = `<div class="loading"></div>`;
  }

  hideLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if(loadingContainer) loadingContainer.innerHTML = "";
  }

  async afterRender() {
    this.#presenter = new HomePresenter({ model: Data, view: this });
    this._initMap();
    this.#presenter.showStories();
    const subscribeButton = document.getElementById("button-subscribe");
    await PushNotification.init(subscribeButton);
  }

  _initMap() {
    this.#map = L.map("stories-map").setView([-2.5489, 118.0149], 5);
    const baseLayers = {
      'Streets': L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap contributors' }),
      'Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' })
    };
    baseLayers.Streets.addTo(this.#map);
    L.control.layers(baseLayers).addTo(this.#map);
    this.#markerClusterGroup = L.markerClusterGroup();
    this.#map.addLayer(this.#markerClusterGroup);
  }

  renderStories(data, options = {}) {
    const gridContainer = document.getElementById("story-grid");
    if (options.replace) {
      gridContainer.innerHTML = "";
      this.#markerClusterGroup.clearLayers();
    }
    if (!data || !data.listStory || data.listStory.length === 0) {
      gridContainer.innerHTML = "<p style='text-align: center; font-size: 1.2rem;'>Tidak ada cerita untuk ditampilkan.</p>";
      return;
    }
    data.listStory.forEach((story) => {
      const storyElement = this._createStoryCard(story);
      gridContainer.appendChild(storyElement);
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]);
        marker.bindPopup(`<div style="text-align:center; padding: 5px;"><strong style="color:#333;">${story.name}</strong><br><a href="#/detail/${story.id}" class="popup-detail-link" data-story-id="${story.id}" style="color:var(--primary-color);">Lihat detail</a></div>`);
        marker.on('popupopen', () => {
          const link = document.querySelector(`.popup-detail-link[data-story-id="${story.id}"]`);
          if (link) {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              this._navigateToDetail(story);
            }, { once: true });
          }
        });
        this.#markerClusterGroup.addLayer(marker);
      }
    });
  }

  renderLoadMoreButton() {
    const container = document.getElementById('load-more-container');
    container.innerHTML = `<button id="load-more-btn" class="action-button">Tampilkan Semua Cerita <i class="fas fa-chevron-down"></i></button>`;
    const button = document.getElementById('load-more-btn');
    button.addEventListener('click', () => {
      button.innerHTML = `<span class="button-spinner"></span> Memuat...`;
      button.disabled = true;
      this.#presenter.showAllStories();
    });
  }

  removeLoadMoreButton() {
    const container = document.getElementById('load-more-container');
    container.innerHTML = '';
  }

  _createStoryCard(story) {
    const storyElement = document.createElement('article');
    storyElement.className = 'story-card';
    storyElement.setAttribute('data-id', story.id);
    storyElement.setAttribute('tabindex', '0');
    storyElement.innerHTML = `<img class="story-card-img" alt="Gambar dari ${story.name}" src="${story.photoUrl}" loading="lazy"/><div class="story-card-content"><h3>${story.name}</h3><p>${story.description}</p></div>`;
    storyElement.addEventListener("click", () => this._navigateToDetail(story));
    storyElement.addEventListener("keydown", (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._navigateToDetail(story);
      }
    });
    return storyElement;
  }

  _navigateToDetail(story) {
    const destinationUrl = `#/detail/${story.id}`;
    history.pushState({ storyData: story }, "", destinationUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  showError(message) {
      Swal.fire({ icon: 'error', title: 'Gagal Memuat Cerita', text: message, confirmButtonColor: 'var(--primary-color)'});
      const gridContainer = document.getElementById("story-grid");
      if(gridContainer) {
        gridContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align:center; color: var(--danger-color);">Gagal memuat data. Silakan coba lagi nanti.</p>`;
      }
  }
}