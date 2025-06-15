export default class NotFoundPage {
  async render() {
    return `
      <section class="container">
        <h1>404 - Halaman Tidak Ditemukan</h1>
        <p>Maaf, halaman yang Anda cari tidak ada. Silakan kembali ke beranda.</p>
      </section>
    `;
  }

  async afterRender() {}
}