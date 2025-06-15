import L from 'leaflet';
import TambahPresenter from "./tambah-presenter.js";
import Data from "../../data/api.js";

export default class TambahPage {
  #presenter;
  #stream = null;
  #map;
  #selectedCoords = null;
  #marker;

  async render() {
    return `
      <div class="container">
        <div class="content-card">
          <form id="form-tambah">
            <h2 style="font-size: 2.5rem;"><i class="fas fa-feather-alt" style="margin-right: 1rem;"></i>Tulis Kisah Barumu</h2>
            <div id="loading-container"></div>
            <div class="form-group">
              <label for="description">Pengalaman Cerita</label>
              <textarea id="description" placeholder="Mulai tulis kisah menakjubkanmu di sini..." required rows="6"></textarea>
            </div>
            <div class="form-group">
              <label>Foto Cerita</label>
              <div id="camera-section" style="text-align:center;">
                <img id="image-preview" style="display: none; width: 100%; border-radius: 8px; margin-top: 1rem;" alt="Preview Gambar Cerita">
                <video id="camera" autoplay playsinline style="display: none; width: 100%; border-radius: 8px; margin-top: 1rem;"></video>
                <canvas id="canvas" style="display: none;"></canvas>
                <div id="camera-controls" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
                    <button type="button" id="start-camera-btn" class="action-button"><i class="fas fa-camera"></i> Nyalakan Kamera</button>
                    <button type="button" id="capture-btn" class="action-button" style="display: none; background: var(--success-color);"><i class="fas fa-camera-retro"></i> Ambil Gambar</button>
                    <button type="button" id="retake-btn" class="action-button-secondary" style="display: none;"><i class="fas fa-sync-alt"></i> Ambil Ulang</button>
                    <button type="button" id="stop-camera-btn" class="action-button" style="display: none; background: var(--danger-color);"><i class="fas fa-times"></i> Tutup Kamera</button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <label style="margin:0;">Lokasi Cerita</label>
                <button type="button" id="get-location-btn" class="action-button-secondary"><i class="fas fa-location-arrow"></i> Gunakan Lokasi Saya</button>
              </div>
              <div id="map" style="height: 400px; border-radius: 12px;"></div>
              <p id="coordinates" style="margin-top:0.5rem; color:var(--text-muted);">Klik pada peta atau gunakan lokasi saat ini...</p>
            </div>
            <button type="submit" class="action-button" style="background: var(--primary-gradient);"><i class="fas fa-paper-plane"></i> Publikasikan Cerita</button>
          </form>
        </div>
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
    this.#presenter = new TambahPresenter({ model: Data, view: this });
    this._setupCamera();
    this._setupMap();
    this._setupForm();
    window.addEventListener("hashchange", () => this._stopCameraOnNavigate(), { once: true });
  }

  _setupCamera() {
    document.getElementById("start-camera-btn").addEventListener("click", () => this._startCamera());
    document.getElementById("capture-btn").addEventListener("click", () => this._takePicture());
    document.getElementById("stop-camera-btn").addEventListener("click", () => this._stopCamera());
    document.getElementById("retake-btn").addEventListener("click", () => {
        document.getElementById("image-preview").style.display = 'none';
        document.getElementById("image-preview").src = '';
        this._startCamera();
    });
  }

  async _startCamera() {
    const video = document.getElementById("camera");
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      video.srcObject = this.#stream;
      await video.play();
      
      video.style.display = "block";
      document.getElementById("image-preview").style.display = 'none';
      this._updateCameraButtons(true, false);
    } catch (error) {
      Swal.fire('Error', `Gagal mengakses kamera: ${error.message}`, 'error');
    }
  }
  
  _takePicture() {
      const video = document.getElementById("camera");
      const canvas = document.getElementById("canvas");
      const preview = document.getElementById("image-preview");

      if (video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        
        preview.src = canvas.toDataURL("image/jpeg");
        preview.style.display = 'block';
      }
      this._stopCamera();
      this._updateCameraButtons(false, true);
      Swal.fire('Sukses', 'Gambar berhasil diambil!', 'success');
  }

  _stopCamera() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#stream = null;
    }
    const video = document.getElementById("camera");
    if (video) video.style.display = "none";
    this._updateCameraButtons(false, !!document.getElementById("image-preview").src);
  }

  _stopCameraOnNavigate() {
      if (this.#stream) {
          this._stopCamera();
      }
  }

  _updateCameraButtons(isCameraOn, isImageTaken) {
      document.getElementById("start-camera-btn").style.display = !isCameraOn && !isImageTaken ? 'inline-flex' : 'none';
      document.getElementById("capture-btn").style.display = isCameraOn ? 'inline-flex' : 'none';
      document.getElementById("stop-camera-btn").style.display = isCameraOn ? 'inline-flex' : 'none';
      document.getElementById("retake-btn").style.display = !isCameraOn && isImageTaken ? 'inline-flex' : 'none';
  }

  _updateMarkerAndCoords(lat, lng) {
    this.#selectedCoords = { lat, lng };
    if (this.#marker) this.#map.removeLayer(this.#marker);
    this.#marker = L.marker(this.#selectedCoords).addTo(this.#map);
    document.getElementById("coordinates").textContent = `Lokasi dipilih: Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`;
  }

  _setupMap() {
    this.#map = L.map("map").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.#map);

    this.#map.on("click", (e) => this._updateMarkerAndCoords(e.latlng.lat, e.latlng.lng));

    const locationButton = document.getElementById("get-location-btn");
    locationButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            locationButton.disabled = true;
            locationButton.innerHTML = '<span class="button-spinner"></span> Mencari...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.#map.setView([latitude, longitude], 16);
                    this._updateMarkerAndCoords(latitude, longitude);
                    locationButton.disabled = false;
                    locationButton.innerHTML = '<i class="fas fa-location-arrow"></i> Gunakan Lokasi Saya';
                },
                (error) => {
                    Swal.fire('Error Lokasi', `Gagal mendapatkan lokasi: ${error.message}`, 'error');
                    locationButton.disabled = false;
                    locationButton.innerHTML = '<i class="fas fa-location-arrow"></i> Gunakan Lokasi Saya';
                }
            );
        } else {
            Swal.fire('Tidak Didukung', 'Geolocation tidak didukung oleh browser ini.', 'warning');
        }
    });
  }

  _setupForm() {
    const form = document.getElementById("form-tambah");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const description = document.getElementById("description").value;
      const canvas = document.getElementById("canvas");
      if (canvas.width === 0 || canvas.height === 0) {
        Swal.fire('Peringatan', 'Anda harus mengambil gambar dari kamera terlebih dahulu.', 'warning');
        return;
      }
      canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("description", description);
          formData.append("photo", blob, "story.jpg");
          if (this.#selectedCoords) {
              formData.append("lat", this.#selectedCoords.lat);
              formData.append("lon", this.#selectedCoords.lng);
          }
          await this.#presenter.addStory(formData);
      }, "image/jpeg", 0.9);
    });
  }
  
  onAddSuccess() {
    this._stopCamera();
    const preview = document.getElementById('image-preview');
    if (preview) preview.style.display = 'none';
    
    Swal.fire('Berhasil!', 'Cerita Anda telah berhasil dipublikasikan.', 'success').then(() => {
        window.location.hash = "#/";
    });
  }

  onAddFailed(message) {
    Swal.fire('Gagal', `Gagal menambahkan cerita: ${message}`, 'error');
  }
}