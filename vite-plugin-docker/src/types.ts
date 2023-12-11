import Dockerode from "dockerode";
import { Logger } from "vite";

export type PluginDockerAction =
  | "image:build"
  | "image:remove"
  | "container:create"
  | "container:start"
  | "container:restart"
  | "container:stop"
  | "container:remove";

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

export type PluginDockerInclude = {
  source: string;
  target: string;
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
   * Root directory for the Docker configuration.
   */
  root: string;
  /**
   * Base directory.
   */
  basedir: string;
  /**
   * Profile for building the Docker image.
   */
  profile: string;
  /**
   * Profile directory for building the Docker image.
   */
  profileDir: string;
  /**
   * Custom name for Dockerfile for building the image.
   */
  dockerfile: string;
  /**
   * Tag for the Docker image.
   */
  imageTag: string;
  /**
   * Array of file patterns to include in the Docker image.
   */
  imageIncludes: PluginDockerInclude[];
  /**
   * Docker options for additional configuration.
   */
  dockerOptions?: DockerOptions;
  /**
   * Action Options for customize options.
   */
  actionOptions: PluginDockerActionOptions;
  /**
   * Prefixes to be applied to environment variables during Docker container operations.
   * These prefixes help prevent naming conflicts and ensure clarity in the Docker environment.
   */
  envPrefix: string[];
  /**
   * Overrides for specific environment variables during Docker container operations.
   * This allows customization of environment variables for specific use cases or configurations.
   */
  envOverride: Record<string, string>;
  /**
   *  Actions to perform when the dev/start project is initialized.
   */
  startActions: PluginDockerAction[];
  /**
   * Actions to perform when the build process is started.
   */
  buildStartActions: PluginDockerAction[];
  /**
   * Actions to perform when the build process is completed.
   */
  buildEndActions: PluginDockerAction[];
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
  "root" | "logger" | "actionOptions" | "profileDir"
> & {
  /**
   * Name of the Docker container.
   */
  name: string;
  /**
   * Action Options for customize options.
   */
  actionOptions?: Partial<PluginDockerActionOptions>;
};
