import CONFIG from "../utils/config.js";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const getToken = () => sessionStorage.getItem("token");

const Data = {
  async _fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
      throw new Error("Token tidak ditemukan, silakan login kembali.");
    }

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const finalOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, finalOptions);

    if (response.status === 401) {
      sessionStorage.removeItem("token");
      throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
    }

    if (!response.ok) {
        let errorMessage = `Terjadi kesalahan jaringan: ${response.status}`;
        try {
            const errorResponse = await response.json();
            errorMessage = errorResponse.message || errorMessage;
        } catch (e) {
        }
        throw new Error(errorMessage);
    }
    
    return response.json();
  },

  async getAllData() {
    return this._fetchWithAuth(ENDPOINTS.STORIES);
  },

  async getAllDataWithLocation() {
    return this._fetchWithAuth(`${ENDPOINTS.STORIES}?location=1&size=100`);
  },

  async getDataId(id) {
    return this._fetchWithAuth(`${ENDPOINTS.STORIES}/${id}`);
  },

  async tambahData(formData) {
    return this._fetchWithAuth(ENDPOINTS.STORIES, {
      method: "POST",
      body: formData,
    });
  },

  async login({ email, password }) {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message || "Gagal login.");
    }
    return responseJson;
  },

  async signUp({ name, email, password }) {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message || "Gagal mendaftar.");
    }
    return responseJson;
  },
  
  async subscribePush(subscription) {
    return this._fetchWithAuth(ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
    });
  },
};

export default Data;