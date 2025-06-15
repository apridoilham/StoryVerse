const routes = {
  "/": () => import("../pages/home/home-page.js"),
  "/about": () => import("../pages/about/about-page.js"),
  "/login": () => import("../pages/login/login-page.js"),
  "/register": () => import("../pages/register/register-page.js"),
  "/detail/:id": () => import("../pages/detail/detail-page.js"),
  "/tambah": () => import("../pages/tambah/tambah-page.js"),
  "/simpan": () => import("../pages/simpan/simpan-page.js"),
  "/not-found": () => import("../pages/not-found/not-found-page.js"),
};

export default routes;