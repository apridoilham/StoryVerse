export default class AboutPage {
  async render() {
    return `
      <div class="container">
        <div class="content-card">
          <h2 style="font-size: 2.5rem;"><i class="fas fa-rocket" style="margin-right: 1rem;"></i>Tentang StoryVerse</h2>
          <p style="text-align: center; line-height: 1.8; font-size: 1.1rem;">
            StoryVerse adalah evolusi dari submission kelas "Pengembangan Web Intermediate" di Dicoding.
            <br><br>
            Dibangun dengan arsitektur MVP yang kokoh di atas Vanilla JavaScript, proyek ini mendemonstrasikan penerapan PWA, Caching Strategies dengan Workbox, IndexedDB, dan integrasi Web API modern seperti Geolocation dan Camera, dibalut dalam desain 'Futuristic Glassmorphism' yang modern dan responsif.
          </p>
        </div>
      </div>
    `;
  }

  async afterRender() {}
}