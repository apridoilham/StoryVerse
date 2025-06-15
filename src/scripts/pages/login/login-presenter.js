export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async login(credentials) {
    try {
      this.#view.showLoading();
      const response = await this.#model.login(credentials);
      this.#view.onLoginSuccess(response.loginResult.token);
    } catch (error) {
      this.#view.onLoginFailed(error.message);
    } finally {
        this.#view.hideLoading();
    }
  }
}