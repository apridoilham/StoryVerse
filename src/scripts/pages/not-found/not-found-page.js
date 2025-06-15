export default class NotFoundPage {
  async render() {
    return `
      <section class="container" style="text-align:center; padding-top: 4rem;">
        <div style="font-size: 8rem; color: var(--primary-color); font-weight: 700;">404</div>
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Halaman Hilang</h2>
        <p style="max-width: 500px; margin: 0 auto 2rem auto; color: var(--text-muted);">Sepertinya Anda tersesat di alam semesta cerita. Mari kembali ke jalan yang benar.</p>
        <a href="#/" class="action-button"><i class="fas fa-home"></i> Kembali ke Beranda</a>
      </section>
    `;
  }

  async afterRender() {}
}