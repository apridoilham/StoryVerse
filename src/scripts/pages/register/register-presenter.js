export default class SignUpPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async signUp(userData) {
    try {
      this.#view.showLoading();
      await this.#model.signUp(userData);
      this.#view.onSignUpSuccess();
    } catch (error) {
      this.#view.onSignUpFailed(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}