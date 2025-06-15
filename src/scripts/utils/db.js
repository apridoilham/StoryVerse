import { openDB } from "idb";
import CONFIG from "./config.js";

const { DATABASE_NAME, DATABASE_VERSION, OBJECT_STORE_NAME } = CONFIG;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
    }
  },
});

const indexedDBHandler = {
  async getAllData() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async checkData(id) {
    if (!id) return null;
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async saveData(story) {
    if (!story || !story.id) return;
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async deleteData(id) {
    if (!id) return;
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default indexedDBHandler;