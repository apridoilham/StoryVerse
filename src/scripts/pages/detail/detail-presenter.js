export default class detailPresenter {
  #model;
  #view;
  #id;

  constructor({ model, view, id }) {
    this.#model = model;
    this.#view = view;
    this.#id = id;
  }

  async _cacheStoryImage(imageUrl) {
    try {
      const cache = await caches.open('image-cache');
      const request = new Request(imageUrl, { mode: 'no-cors' });
      const response = await fetch(request);
      if (!response.ok && response.type !== 'opaque') {
        throw new Error(`Gagal mengambil gambar: ${imageUrl}`);
      }
      await cache.put(request, response);
    } catch (error) {
      console.error('Gagal melakukan caching gambar:', error);
    }
  }

  async _deleteCachedImage(imageUrl) {
    try {
      const cache = await caches.open('image-cache');
      const request = new Request(imageUrl, { mode: 'no-cors' });
      await cache.delete(request);
    } catch (error) {
      console.error('Gagal menghapus cache gambar:', error);
    }
  }

  async showStoryDetail() {
    this.#view.showLoading();
    try {
      const offlineStory = await this.#model.indexedDBHandler.checkData(this.#id);

      if (offlineStory) {
        this.#view.renderStory(offlineStory, true);
      } else {
        const response = await this.#model.Data.getDataId(this.#id);
        const isSaved = await this.#model.indexedDBHandler.checkData(this.#id);
        this.#view.renderStory(response.story, !!isSaved);
      }
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async handleSaveButtonClick(storyData, isCurrentlySaved) {
    const button = document.getElementById("button-simpan");
    if (button) button.disabled = true;

    try {
      if (isCurrentlySaved) {
        await this.#model.indexedDBHandler.deleteData(storyData.id);
        await this._deleteCachedImage(storyData.photoUrl);
        this.#view._updateSaveButtonState(false);
        Swal.fire('Berhasil', 'Cerita berhasil dihapus dari penyimpanan offline!', 'success');
      } else {
        await this.#model.indexedDBHandler.saveData(storyData);
        await this._cacheStoryImage(storyData.photoUrl);
        this.#view._updateSaveButtonState(true);
        Swal.fire('Sukses', 'Cerita berhasil disimpan untuk akses offline!', 'success');
      }
    } catch (error) {
      Swal.fire('Gagal', `Gagal memproses permintaan: ${error.message}`, 'error');
      this.#view._updateSaveButtonState(isCurrentlySaved);
    }
  }
}