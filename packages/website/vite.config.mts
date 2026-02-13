import child from "node:child_process";
import path from "node:path";

import * as z from "zod/v4";
import * as vite from "vite";

import viteReact from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import listFormatsPlugin from "./plugins/list-formats";
import metadataAwesomeList from "./plugins/metadata-awesome-list";
import yamlAwesomeListPlugin, {
  loadAwesomeList,
} from "./plugins/yaml-awesome-list";

const EnvironmentSchema = z.looseObject({
  BASE_PATH: z.string().min(1),
  LIST_FILE_PATH: z.string().min(1),
  GITHUB_REPOSITORY_URL: z.string().min(1),
  USER_REPOSITORY_COMMIT_HASH: z.string().min(1),
  AWESOME_WEBSITE_TAG: z.string().optional().default("unknown"),
  GITHUB_WORKFLOW_REF: z.string(),
});

const ENVIRONMENT = EnvironmentSchema.parse(process.env);

const [GITHUB_REPOSITORY_OWNER, GITHUB_REPOSITORY_NAME] =
  ENVIRONMENT.GITHUB_REPOSITORY_URL.split("/").slice(-2);

const BASE_PATH = ENVIRONMENT.BASE_PATH
  ? ENVIRONMENT.BASE_PATH
  : `/${GITHUB_REPOSITORY_NAME}`;

const YAML_FILE_PATH = ENVIRONMENT.LIST_FILE_PATH;

const AWESOME_LIST = loadAwesomeList(YAML_FILE_PATH);

const USER_REPOSITORY_COMMIT_HASH = (() => {
  if (ENVIRONMENT.USER_REPOSITORY_COMMIT_HASH) {
    return ENVIRONMENT.USER_REPOSITORY_COMMIT_HASH;
  }
  try {
    return child.execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch (error) {
    console.warn("[error]: could not get user repository commit hash:", error);
    return "";
  }
})();

const AWESOME_WEBSITE_BUILD_TAG = (() => {
  if (ENVIRONMENT.AWESOME_WEBSITE_TAG) {
    return ENVIRONMENT.AWESOME_WEBSITE_TAG;
  }

  try {
    return child
      .execSync("git describe --tags --exact-match", { encoding: "utf8" })
      .trim();
  } catch {
    return "unknown";
  }
})();

// NOTE: try to extract workflow filename from github.workflow_ref or github.workflow
// github.workflow_ref format: owner/repo/.github/workflows/filename.yml@refs/heads/branch
// github.workflow can be either a name (e.g., "Build Awesome Website") or filename
const GITHUB_WORKFLOW_FILE_NAME = (() => {
  if (ENVIRONMENT.GITHUB_WORKFLOW_REF) {
    const match = ENVIRONMENT.GITHUB_WORKFLOW_REF.match(
      /\.github\/workflows\/([^@]+)/,
    );
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
})();

// NOTE: https://vitejs.dev/config/
export default vite.defineConfig({
  plugins: [
    viteReact(),
    yamlAwesomeListPlugin(YAML_FILE_PATH),
    metadataAwesomeList(AWESOME_LIST, ENVIRONMENT.GITHUB_REPOSITORY_URL),
    listFormatsPlugin(AWESOME_LIST),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
      },
      manifest: {
        name: AWESOME_LIST.title,
        short_name: AWESOME_LIST.title,
        description: AWESOME_LIST.description,
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: ".",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  define: {
    __CONFIGURATION__: {
      repository: {
        url: ENVIRONMENT.GITHUB_REPOSITORY_URL,
        owner: GITHUB_REPOSITORY_OWNER,
        name: GITHUB_REPOSITORY_NAME,
        commit: USER_REPOSITORY_COMMIT_HASH,
        workflow: {
          name: GITHUB_WORKFLOW_FILE_NAME,
        },
      },
      build: {
        time: new Date().toISOString(),
        tag: AWESOME_WEBSITE_BUILD_TAG,
      },
      awesome: true,
      list: {
        content: AWESOME_LIST,
        path: YAML_FILE_PATH,
      },
    } satisfies typeof __CONFIGURATION__,
  },
  base: BASE_PATH,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      shared: path.resolve(__dirname, "../shared/src"),
    },
  },
});
