import { join } from "path";
import Docker from "dockerode";
import {
  PluginDockerAction,
  PluginDockerConfig,
  PluginDockerOptions,
} from "./types";
import { Plugin, PluginOption, createLogger } from "vite";
import {
  createContainer,
  createImage,
  getStatus,
  removeContainer,
  removeImage,
  startContainer,
  stopContainer,
} from "./dockerActions";
import Dockerode from "dockerode";
const PLUGIN_NAME = "vite-plugin-docker";

//@ts-ignore
const dockerHotReload = process.__docker__ || (process.__docker__ = {});

export * from "./types";

const pluginDockerImpl = (
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
      "create-image": async () => {
        status = await createImage(config, docker, status);
      },
      "create-container": async () => {
        status = await createContainer(config, docker, status);
      },
      "start-container": async () => {
        status = await startContainer(config, docker, status);
      },
      "stop-container": async () => {
        status = await stopContainer(config, docker, status);
      },
      "remove-container": async () => {
        status = await removeContainer(config, docker, status);
      },
      "remove-image": async () => {
        status = await removeImage(config, docker, status);
      },
    };
    for (let action of actionList) {
      logger.info("Starting....");
      await actions[action]?.();
      if (status.error) {
        logger.error(`Error: ${action} ${status}`);
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
        await doActions("start", config.startActions);
        dockerHotReload[config.name] = config.hotReload === true;
      }
      process.on("SIGTERM", async () => {
        await doActions("finish", config.finishActions);
      });
    },
  };
};

const pluginDockerArrayImpl = (configs: PluginDockerConfig[]): PluginOption => {
  const dockerRef: Record<string, Docker> = {};
  return configs.map((config, ix) => {
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

const assertPluginDockerConfig = (
  opts: PluginDockerOptions,
  defaultDockerOptions?: Dockerode.DockerOptions
): PluginDockerConfig => {
  let {
    enabled = true,
    name,
    profile = "default",
    imageTag = `${profile}_${name}:latest`
      .toLowerCase()
      .replace(/\.dockerfile/gi, "")
      .replace(/\.|-|\/|\\/gi, "_"),
    imageIncludes = [],
    onContainerCreateOptions = (opts) => opts,
    onImageBuildOptions = (opts) => opts,
    dockerfile = "Dockerfile",
    // envPrefix = [],
    // envOverride = {},
    startActions = ["start-container"],
    finishActions = ["stop-container"],
    dockerOptions = defaultDockerOptions,
    hotReload = false,
  } = opts;
  const root = process.cwd();
  profile = join(root, "docker", profile);
  imageTag = imageTag.includes(":") ? imageTag : `${imageTag}:latest`;
  const logger = createLogger("info", {
    prefix: `${PLUGIN_NAME}:${name}`,
  });
  return {
    enabled,
    root,
    name,
    profile,
    imageTag,
    imageIncludes,
    dockerfile,
    // envPrefix,
    // envOverride,
    onContainerCreateOptions,
    onImageBuildOptions,
    startActions,
    finishActions,
    dockerOptions,
    hotReload,
    logger,
  };
};

export const pluginDocker = (
  opts: PluginDockerOptions | PluginDockerOptions[],
  defaultDockerOptions?: Dockerode.DockerOptions
) => {
  opts = Array.isArray(opts) ? opts : [opts];
  const configs = opts.map((it) =>
    assertPluginDockerConfig(it, defaultDockerOptions)
  );
  return pluginDockerArrayImpl(configs);
};

export default pluginDocker;
