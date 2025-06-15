export default class HomePresenter {
  #model;
  #view;
  #allStories = [];

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async showStories() {
    try {
      this.#view.showLoading();
      const data = await this.#model.getAllDataWithLocation();
      this.#allStories = data.listStory || [];
      
      const initialStories = this.#allStories.slice(0, 9);
      this.#view.renderStories({ listStory: initialStories });

      if (this.#allStories.length > 9) {
        this.#view.renderLoadMoreButton();
      }
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  showAllStories() {
    this.#view.renderStories({ listStory: this.#allStories }, { replace: true });
    this.#view.removeLoadMoreButton();
  }
}