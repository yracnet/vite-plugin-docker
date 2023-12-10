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
        enabled: true,
        name: "nginx",
        dockerfile: "Dockerfile",
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
        startActions: [
          "container:stop",
          "container:remove",
          "image:remove",
          "image:build",
          "container:create",
          "container:start",
        ],
      },
      {
        enabled: false,
        name: "MongoV1",
        imageTag: "mongo",
        envPrefix: ["MONGO_"],
        // envOverride: {
        //   MONGO_INITDB_ROOT_USERNAME: "root",
        //   MONGO_INITDB_ROOT_USERNAME: "toor",
        // },
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
