export default class TambahPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async addStory(formData) {
    try {
      this.#view.showLoading();
      await this.#model.tambahData(formData);
      this.#view.onAddSuccess();
    } catch (error) {
      this.#view.onAddFailed(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}