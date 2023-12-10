import Dockerode from "dockerode";
import { Logger } from "vite";

export type PluginDockerLifcicle = "start" | "finish";
export type PluginDockerStartAction =
  | "image:build"
  | "image:remove"
  | "container:create"
  | "container:start"
  | "container:restart"
  | "container:stop"
  | "container:remove";
export type PluginDockerFinishAction =
  | "container:stop"
  | "container:remove"
  | "image:remove";
export type PluginDockerAction =
  | PluginDockerStartAction
  | PluginDockerFinishAction;

export type PluginDockerStatus = {
  image?: Dockerode.Image;
  imageInfo?: Dockerode.ImageInfo;
  container?: Dockerode.Container;
  containerInfo?: Dockerode.ContainerInfo;
  error?: any;
};

export type PluginDockerActionOptions = {
  /**
   * Callback function to customize container creation options.
   */
  onContainerCreateOptions: (
    options: Dockerode.ContainerCreateOptions,
    config: PluginDockerConfig
  ) => Dockerode.ContainerCreateOptions;
  /**
   * Callback function to customize start container options.
   */
  onContainerStartOptions: (
    options: Dockerode.ContainerStartOptions,
    config: PluginDockerConfig
  ) => Dockerode.ContainerStartOptions;
  /**
   * Callback function to customize stop container options.
   */
  onContainerStopOptions: (
    options: Dockerode.ContainerStopOptions,
    config: PluginDockerConfig
  ) => Dockerode.ContainerStopOptions;
  /**
   * Callback function to customize remove container options.
   */
  onContainerRemoveOptions: (
    options: Dockerode.ContainerRemoveOptions,
    config: PluginDockerConfig
  ) => Dockerode.ContainerRemoveOptions;
  /**
   * Callback function to customize image build options.
   */
  onImageBuildOptions: (
    options: Dockerode.ImageBuildOptions,
    config: PluginDockerConfig
  ) => Dockerode.ImageBuildOptions;
  /**
   * Callback function to customize image build options.
   */
  onImageRemoveOptions: (
    options: Dockerode.ImageRemoveOptions,
    config: PluginDockerConfig
  ) => Dockerode.ImageRemoveOptions;
};

/**
 * Configuration options for the Vite.js Docker plugin.
 */
export type PluginDockerConfig = {
  /**
   * Enable or disable the Docker plugin.
   */
  enabled: boolean;
  /**
   * Name of the Docker container.
   */
  name: string;
  /**
   * Profile for building the Docker image.
   */
  profile: string;
  /**
   * Custom name for Dockerfile for building the image.
   */
  dockerfile: string;
  /**
   * Root directory for the Docker configuration.
   */
  root: string;
  /**
   * Tag for the Docker image.
   */
  imageTag: string;
  /**
   * Array of file patterns to include in the Docker image.
   */
  imageIncludes: string[];
  /**
   * Docker options for additional configuration.
   */
  dockerOptions?: DockerOptions;
  /**
   * Action Options for customize options.
   */
  actionOptions: PluginDockerActionOptions;
  // envPrefix: string[];
  // envOverride: Record<string, string>;
  /**
   * Actions to perform when starting the container.
   */
  startActions: PluginDockerStartAction[];
  /**
   * Actions to perform after the container finishes.
   */
  finishActions: PluginDockerFinishAction[];
  /**
   * Enable or disable hot reload.
   */
  hotReload: boolean;
  /**
   * Logger instance for logging messages.
   */
  logger: Logger;
};

export type DockerOptions = Dockerode.DockerOptions;

export type PluginDockerOptions = Omit<
  Partial<PluginDockerConfig>,
  "root" | "logger" | "actionOptions"
> & {
  /**
   * Name of the Docker container.
   */
  name: string;
  actionOptions: Partial<PluginDockerActionOptions>;
};
