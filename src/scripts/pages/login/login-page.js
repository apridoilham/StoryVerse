import LoginPresenter from "./login-presenter.js";
import Data from "../../data/api.js";
import indexedDBHandler from "../../utils/db.js";

export default class LoginPage {
  #presenter;

  async render() {
    return `
      <div class="login-container">
        <div class="login-grid">
          
          <div class="login-branding">
            <h1 class="brand-title">StoryVerse</h1>
            <p class="brand-tagline">Masuk untuk melanjutkan petualanganmu, atau jelajahi cerita yang telah kamu simpan untuk nanti.</p>
          </div>

          <div class="login-form-wrapper">
            <form id="form-login" class="auth-form">
              <h2>Selamat Datang</h2>
              <div id="loading-container"></div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="contoh@email.com" required autocomplete="email" />
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Masukkan password Anda" required autocomplete="current-password" />
              </div>
              <button type="submit" class="action-button"><i class="fas fa-sign-in-alt"></i> Login</button>
              <p style="text-align:center; margin-top:1.5rem;">Belum punya akun? <a href="#/register" class="auth-link">Daftar di sini</a></p>
            </form>
          </div>

        </div>

        <div id="offline-stories-section" class="content-card" style="margin-top: 3rem;">
          <h2 style="font-size: 2rem;"><i class="fas fa-save" style="margin-right: 1rem;"></i>Cerita Tersimpan</h2>
          <div id="offline-stories-list" class="story-grid">
            <div class="loading"></div>
          </div>
        </div>

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
    this.#presenter = new LoginPresenter({ model: Data, view: this });

    const form = document.getElementById("form-login");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      await this.#presenter.login({ email, password });
    });

    await this._renderSavedStories();
  }

  _navigateToDetail(story) {
    const destinationUrl = `#/detail/${story.id}`;
    history.pushState({ storyData: story }, "", destinationUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  async _renderSavedStories() {
    const stories = await indexedDBHandler.getAllData();
    const container = document.getElementById("offline-stories-list");

    if (!stories || stories.length === 0) {
      container.innerHTML = `<p style='color: var(--text-muted); text-align: center; grid-column: 1 / -1;'>Anda belum menyimpan cerita apapun untuk dibaca offline.</p>`;
      return;
    }

    container.innerHTML = "";

    stories.forEach((story) => {
      const storyElement = document.createElement('article');
      storyElement.className = 'story-card';
      storyElement.innerHTML = `
        <img class="story-card-img" alt="Gambar dari ${story.name}" src="${story.photoUrl}" />
        <div class="story-card-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <div style="margin-top: 1rem;">
            <a href="#/detail/${story.id}" class="action-button offline-view-button" style="width: 100%;">Lihat Cerita</a>
          </div>
        </div>
      `;
      
      const viewButton = storyElement.querySelector('.offline-view-button');
      viewButton.addEventListener('click', (event) => {
        event.preventDefault();
        this._navigateToDetail(story);
      });

      container.appendChild(storyElement);
    });
  }

  onLoginSuccess(token) {
    sessionStorage.setItem("token", token);
    window.location.hash = "#/";
    window.location.reload();
  }

  onLoginFailed(message) {
    Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: message,
        confirmButtonColor: 'var(--primary-color)'
    });
  }
}