import { default as Docker } from "dockerode";
import { Plugin, PluginOption, createLogger } from "vite";
import {
  buildImage,
  createContainer,
  removeContainer,
  removeImage,
  restartContainer,
  startContainer,
  stopContainer,
} from "./dockerAction";
import { getStatus } from "./dockerInfo";
import { PluginDockerAction, PluginDockerConfig } from "./types";
export const PLUGIN_NAME = "vite-plugin-docker";

//@ts-ignore
const dockerHotReload = process.__docker__ || (process.__docker__ = {});

export const pluginDockerImpl = (
  config: PluginDockerConfig,
  docker: Docker
): Plugin => {
  const doActions = async (phase: string, actionList: PluginDockerAction[]) => {
    const loggerRef = config.logger;
    const logger = (config.logger = createLogger("info", {
      prefix: `${PLUGIN_NAME}:${config.name}:${phase}`,
    }));
    let status = await getStatus(config, docker);
    const actions: any = {
      "image:build": async () => {
        status = await buildImage(config, docker, status);
      },
      "image:remove": async () => {
        status = await removeImage(config, docker, status);
      },
      "container:create": async () => {
        status = await createContainer(config, docker, status);
      },
      "container:start": async () => {
        status = await startContainer(config, docker, status);
      },
      "container:restart": async () => {
        status = await restartContainer(config, docker, status);
      },
      "container:stop": async () => {
        status = await stopContainer(config, docker, status);
      },
      "container:remove": async () => {
        status = await removeContainer(config, docker, status);
      },
    };
    for (let action of actionList) {
      logger.info(`${phase}: ${action}`);
      await actions[action]?.();
      if (status.error) {
        const trace = {
          container: config.name,
          image: config.imageTag,
          error: status.error,
        };
        logger.error(`Error: ${action} ${JSON.stringify(trace, null, 2)}`);
        break;
      }
    }
    config.logger = loggerRef;
  };
  return {
    name: "vite-plugin-docker",
    configureServer: async () => {
      const reload = dockerHotReload[config.name];
      if (reload || reload === undefined) {
        await doActions("configureServer", config.startActions);
        dockerHotReload[config.name] = config.hotReload === true;
      }
    },
    buildStart: async () => {
      await doActions("buildStart", config.buildStartActions);
    },
    closeBundle: async () => {
      await doActions("buildEnd", config.buildEndActions);
    },
  };
};

export const pluginDockerArrayImpl = (
  configs: PluginDockerConfig[]
): PluginOption => {
  const dockerRef: Record<string, Docker> = {};
  return configs
    .filter((it) => it.enabled)
    .map((config, ix) => {
      const key = JSON.stringify(config.dockerOptions || "LOCAL");
      let docker = dockerRef[key];
      if (!docker) {
        docker = new Docker(config.dockerOptions);
        dockerRef[key] = docker;
      }
      const plugin = pluginDockerImpl(config, docker);
      plugin.name = `${plugin.name}-${ix}`;
      return plugin;
    });
};
