import { PluginOption, createLogger } from "vite";
const PLUGIN_NAME = "vite-plugin-docker-compose";

export const pluginDocker = (): PluginOption => {
  const logger = createLogger("info", { prefix: PLUGIN_NAME });
  return {
    name: PLUGIN_NAME,
    configureServer: async () => {
      logger.info("This plugin is not implemented yet.");
    },
  };
};

export default pluginDocker;
