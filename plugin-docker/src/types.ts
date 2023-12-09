import Dockerode from "dockerode";
import { Logger } from "vite";

export type PluginDockerLifcicle = "start" | "finish";
export type PluginDockerStartAction =
  | "remove-image"
  | "create-image"
  | "remove-container"
  | "create-container"
  | "start-container";
export type PluginDockerFinishAction =
  | "stop-container"
  | "remove-container"
  | "remove-image"
  | "create-image";
export type PluginDockerAction =
  | PluginDockerStartAction
  | PluginDockerFinishAction;

export type PluginDockerStatus = {
  containerId: string;
  containerName: string;
  containerState: string;
  containerExist: boolean;
  imageId: string;
  imageName: string;
  imageExist: boolean;
  error?: any;
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
   * Callback function to customize container creation options.
   */
  onContainerCreateOptions: (
    options: Dockerode.ContainerCreateOptions,
    config: PluginDockerConfig
  ) => Dockerode.ContainerCreateOptions;
  /**
   * Callback function to customize image build options.
   */
  onImageBuildOptions: (
    options: Dockerode.ImageBuildOptions,
    config: PluginDockerConfig
  ) => Dockerode.ImageBuildOptions;
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
   * Docker options for additional configuration.
   */
  dockerOptions?: DockerOptions;
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
  "root" | "logger"
> & {
  /**
   * Name of the Docker container.
   */
  name: string;
};
