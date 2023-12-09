import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
//@ts-ignore
import { pluginDocker } from "../plugin-docker/src";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //@ts-ignore
    pluginDocker([
      //@ts-ignore
      {
        name: "NGinx",
        dockerfile: "NGinx.Dockerfile",
        onContainerCreateOptions: (opts) => {
          return {
            ...opts,
            ExposedPorts: { "80/tcp": {} },
            HostConfig: {
              PortBindings: { "80/tcp": [{ HostPort: "8080" }] },
            },
          };
        },
        startActions: ["create-image", "create-container", "start-container"],
      },
      //@ts-ignore
      {
        name: "MongoV1",
        imageTag: "mongo",
        onContainerCreateOptions: (opts) => {
          return {
            ...opts,
            ExposedPorts: { "27017/tcp": {} },
            HostConfig: {
              PortBindings: { "27017/tcp": [{ HostPort: "27017" }] },
            },
          };
        },
        startActions: ["create-container", "start-container"],
      },
    ]),
  ],
});
