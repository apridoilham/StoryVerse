import SignUpPresenter from "./register-presenter.js";
import Data from "../../data/api.js";

export default class SignUpPage {
  #presenter;

  async render() {
    return `
      <div class="login-container">
        <div class="login-grid">

          <div class="login-branding">
            <h1 class="brand-title">StoryVerse</h1>
            <p class="brand-tagline">Bergabunglah dengan ribuan petualang lainnya. Daftarkan dirimu dan mulai bagikan kisah unikmu hari ini.</p>
          </div>

          <div class="login-form-wrapper">
            <form id="form-signup" class="auth-form">
              <h2>Buat Akun Baru</h2>
              <div id="loading-container"></div>
              <div class="form-group">
                <label for="name">Nama Lengkap</label>
                <input type="text" id="name" placeholder="Masukkan nama Anda" required />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="contoh@email.com" required />
              </div>
              <div class="form-group">
                <label for="password">Password (min. 8 karakter)</label>
                <input type="password" id="password" placeholder="Buat password yang kuat" required minlength="8" />
              </div>
              <button type="submit" class="action-button"><i class="fas fa-user-plus"></i> Daftar</button>
              <p style="text-align:center; margin-top:1.5rem;">Sudah punya akun? <a href="#/login" class="auth-link">Login di sini</a></p>
            </form>
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
    if(loadingContainer) loadingContainer.innerHTML = "";
  }
  
  async afterRender() {
    this.#presenter = new SignUpPresenter({ model: Data, view: this });

    const form = document.getElementById("form-signup");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      await this.#presenter.signUp({ name, email, password });
    });
  }

  onSignUpSuccess() {
    Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah dibuat. Silakan login.',
        confirmButtonColor: 'var(--primary-color)'
    }).then(() => {
        window.location.hash = "#/login";
    });
  }

  onSignUpFailed(message) {
    Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: message,
        confirmButtonColor: 'var(--primary-color)'
    });
  }
}