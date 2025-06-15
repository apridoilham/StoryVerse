import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../styles/styles.css';
import Swal from 'sweetalert2';
import L from 'leaflet';
import App from "./pages/app.js";
import { registerServiceWorker } from "./utils/sw-register.js";

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

document.addEventListener("DOMContentLoaded", () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
    logoutButton: document.querySelector("#logout-button"),
    header: document.querySelector("#app-header"),
    footer: document.querySelector("#app-footer"),
  });

  app.start();

  if (process.env.NODE_ENV === 'production') {
    registerServiceWorker();
  }

  window.Swal = Swal;
});