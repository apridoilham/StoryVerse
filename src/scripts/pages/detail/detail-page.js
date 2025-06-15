import L from 'leaflet';
import { parseActivePathname } from "../../routes/url-parser.js";
import Data from "../../data/api.js";
import detailPresenter from "./detail-presenter.js";
import indexedDBHandler from "../../utils/db.js";

export default class DetailPage {
  #presenter;
  #map;
  #currentStoryData;

  async render() {
    return `
      <div class="container">
        <div id="loading-container"></div>
        <div id="detail-content" class="detail-container"></div>
      </div>
    `;
  }

  showLoading() {
    document.getElementById("loading-container").innerHTML = `<div class="loading"></div>`;
  }

  hideLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    }
  }

  async afterRender() {
    const { id } = parseActivePathname();
    this.#presenter = new detailPresenter({
      model: { Data, indexedDBHandler },
      view: this,
      id: id,
    });

    if (history.state && history.state.storyData) {
      this.showLoading();
      const storyFromState = history.state.storyData;
      const isSaved = await indexedDBHandler.checkData(storyFromState.id);
      this.renderStory(storyFromState, !!isSaved);
      this.hideLoading();
    } else {
      await this.#presenter.showStoryDetail();
    }
  }

  renderStory(story, isSaved) {
    this.#currentStoryData = story;
    const container = document.getElementById("detail-content");
    const offlineLabel = isSaved ? '<span class="offline-label">(Tersimpan)</span>' : '';

    container.innerHTML = `
      <div class="detail-grid">
        <div class="detail-image-wrapper">
          <img class="detail-image" alt="Gambar dari ${story.name}" src="${story.photoUrl}"/>
        </div>
        <div class="detail-info">
          <h2 class="detail-title">${story.name} ${offlineLabel}</h2>
          <p class="detail-meta">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p class="detail-description">${story.description}</p>
          <div class="action-buttons-wrapper">
            <a href="#/" class="action-button-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            <button id="button-simpan" class="action-button"></button>
          </div>
        </div>
      </div>
      <div class="detail-map-wrapper">
        <h3 class="section-title">Lokasi Cerita</h3>
        <div id="map"></div>
      </div>
    `;

    this._updateSaveButtonState(!!isSaved);
    this._initMap(story.lat, story.lon, story.name);
  }

  _initMap(lat, lon, name) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    if (lat === undefined || lon === undefined || lat === null || lon === null) {
      mapContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 4rem 0;">Lokasi tidak tersedia untuk cerita ini.</p>';
      return;
    }
    
    this.#map = L.map("map").setView([lat, lon], 15);

    const baseLayers = {
      'Streets': L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }),
      'Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      })
    };
    
    baseLayers.Streets.addTo(this.#map);
    L.control.layers(baseLayers).addTo(this.#map);

    L.marker([lat, lon]).addTo(this.#map).bindPopup(`<b>${name}</b>`).openPopup();
  }

  _updateSaveButtonState(isSaved) {
    const button = document.getElementById("button-simpan");
    if (!button) return;

    button.textContent = isSaved ? "Hapus dari Penyimpanan" : "Simpan Offline";
    const newClass = isSaved ? 'button--danger' : 'button--success';
    button.className = `action-button ${newClass}`;
    button.disabled = false;
    
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener("click", () => {
      this.#presenter.handleSaveButtonClick(this.#currentStoryData, isSaved);
    });
  }

  showError(message) {
    const container = document.getElementById("detail-content");
    if (container) {
      container.innerHTML = `<p style="text-align:center; color: var(--danger-color); font-size: 1.2rem;">Tidak dapat memuat detail cerita.</p>`;
    }
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Detail',
      text: `Cerita ini mungkin telah dihapus atau tautannya tidak lagi valid. (Pesan server: ${message})`,
      confirmButtonText: '<i class="fas fa-home"></i> Kembali ke Beranda',
      confirmButtonColor: 'var(--primary-color)',
    }).then(() => {
        window.location.hash = '#/';
    });
  }
}