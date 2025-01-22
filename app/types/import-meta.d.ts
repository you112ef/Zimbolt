// app/types/import-meta.d.ts

export {}; // Ensures this file is treated as a module

declare global {
  interface ImportMetaEnv {
    VITE_GITHUB_ACCESS_TOKEN?: string;
    VITE_DISABLE_PERSISTENCE?: string;
    DEV?: string;          // Changed from boolean to string
    PROD?: string;         // Changed from boolean to string
    VITE_LOG_LEVEL?: string;
    SSR?: string;          // Changed from boolean to string
    // Add other environment variables as needed

    // Index signature to allow accessing properties dynamically
    [key: string]: string | undefined;
  }

  interface ImportMeta {
    env: ImportMetaEnv;
    hot?: {
      data: Record<string, any>;
      accept: () => void;
      dispose: () => void;
    };
  }
}
