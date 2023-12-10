import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
//@ts-ignore
import { pluginDocker } from "../vite-plugin-docker/src";
//import { pluginDocker } from "vite-plugin-docker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //@ts-ignore
    pluginDocker([
      {
        name: "NGinx",
        dockerfile: "NGinx.Dockerfile",
        envPrefix: ["NGINX_"],
        envOverride: { NGINX_XXX: "1" },
        actionOptions: {
          onContainerCreateOptions: (opts) => {
            return {
              ...opts,
              ExposedPorts: { "80/tcp": {} },
              HostConfig: {
                PortBindings: { "80/tcp": [{ HostPort: "8080" }] },
              },
            };
          },
        },
        startActions: ["image:build", "container:create", "container:start"],
      },
      {
        name: "MongoV1",
        imageTag: "mongo",
        envPrefix: ["MONGO_"],
        envOverride: { MONGO_XXX: "1" },
        actionOptions: {
          onContainerCreateOptions: (opts) => {
            return {
              ...opts,
              ExposedPorts: { "27017/tcp": {} },
              HostConfig: {
                PortBindings: { "27017/tcp": [{ HostPort: "27017" }] },
              },
            };
          },
        },
        startActions: ["container:create", "container:start"],
      },
    ]),
  ],
});
