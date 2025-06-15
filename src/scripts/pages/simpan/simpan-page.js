import indexedDBHandler from "../../utils/db.js";

export default class SavedPage {
  async render() {
    return `
      <section class="container">
        <div class="content-card">
            <h2 class="section-title" style="margin-top:0;">Cerita Tersimpan (Offline)</h2>
            <div id="saved-list" class="story-grid"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.loadSavedStories();
  }

  _navigateToDetail(story) {
    const destinationUrl = `#/detail/${story.id}`;
    history.pushState({ storyData: story }, "", destinationUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  async loadSavedStories() {
    const stories = await indexedDBHandler.getAllData();
    const savedListContainer = document.getElementById("saved-list");
    savedListContainer.innerHTML = "";

    if (!stories || stories.length === 0) {
      savedListContainer.innerHTML = "<p>Tidak ada cerita yang disimpan untuk akses offline.</p>";
      return;
    }

    stories.forEach((story) => {
        const storyElement = document.createElement('article');
        storyElement.classList.add('story-card');
        storyElement.innerHTML = `
            <img class="story-card-img" alt="Gambar dari ${story.name}" src="${story.photoUrl}" />
            <div class="story-card-content">
                <h3>${story.name}</h3>
                <p>${story.description}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                  <a href="#/detail/${story.id}" class="action-button saved-view-button" style="flex-grow: 1;">Lihat</a>
                  <button class="action-button delete-button" data-id="${story.id}" style="background: var(--danger-color);"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        const viewButton = storyElement.querySelector('.saved-view-button');
        viewButton.addEventListener('click', (event) => {
          event.preventDefault();
          this._navigateToDetail(story);
        });
        
        savedListContainer.appendChild(storyElement);
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const id = event.target.closest('button').dataset.id;
        
        const result = await Swal.fire({
            title: 'Hapus Cerita?',
            text: "Cerita ini akan dihapus dari penyimpanan offline Anda.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger-color)',
            cancelButtonColor: 'var(--text-muted)',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            await indexedDBHandler.deleteData(id);
            await this.loadSavedStories();
            Swal.fire('Dihapus!', 'Cerita telah dihapus dari penyimpanan.', 'success');
        }
      });
    });
  }
}