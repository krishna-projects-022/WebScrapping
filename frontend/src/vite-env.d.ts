/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: "https://webscrapping-uol6.onrender.com/api" | 'http://localhost:5000/api';
  // more env variables...
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

