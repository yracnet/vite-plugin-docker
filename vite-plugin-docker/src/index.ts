import { default as Dockerode } from "dockerode";
import { join } from "path";
import { createLogger } from "vite";
import { PLUGIN_NAME, pluginDockerArrayImpl } from "./pluginImpl";
import { PluginDockerConfig, PluginDockerOptions } from "./types";

export * from "./types";

const assertPluginDockerConfig = (
  opts: PluginDockerOptions,
  defaultDockerOptions?: Dockerode.DockerOptions
): PluginDockerConfig => {
  let {
    enabled = true,
    name,
    basedir = "docker",
    profile = "default",
    imageTag = `${profile}_${name}:latest`
      .toLowerCase()
      .replace(/\.dockerfile/gi, "")
      .replace(/\.|-|\/|\\/gi, "_"),
    imageIncludes = [],
    actionOptions = {},
    dockerfile = "Dockerfile",
    envPrefix = [],
    envOverride = {},
    startActions = [],
    buildStartActions = [],
    buildEndActions = [],
    dockerOptions = defaultDockerOptions,
    hotReload = false,
  } = opts;
  const root = process.cwd();
  const profileDir = join(root, basedir, profile);
  imageTag = imageTag.includes(":") ? imageTag : `${imageTag}:latest`;
  const logger = createLogger("info", {
    prefix: `${PLUGIN_NAME}:${name}`,
  });
  const {
    onContainerCreateOptions = (opts) => opts,
    onContainerStartOptions = (opts) => opts,
    onContainerStopOptions = (opts) => opts,
    onContainerRemoveOptions = (opts) => opts,
    onImageBuildOptions = (opts) => opts,
    onImageRemoveOptions = (opts) => opts,
  } = actionOptions;
  return {
    enabled,
    name,
    root,
    basedir,
    profile,
    profileDir,
    imageTag,
    imageIncludes,
    dockerfile,
    envPrefix,
    envOverride,
    startActions,
    buildStartActions,
    buildEndActions,
    actionOptions: {
      onContainerCreateOptions,
      onContainerStartOptions,
      onContainerStopOptions,
      onContainerRemoveOptions,
      onImageBuildOptions,
      onImageRemoveOptions,
    },
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
