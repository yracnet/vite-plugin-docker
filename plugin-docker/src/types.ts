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

export type PluginDockerConfig = {
  enabled: boolean;
  name: string;
  profile: string;
  dockerfile: string;
  root: string;
  envPrefix: string[];
  imageTag: string;
  imageIncludes: string[];
  onContainerCreateOptions: (
    options: Dockerode.ContainerCreateOptions,
    config: PluginDockerConfig
  ) => Dockerode.ContainerCreateOptions;
  onImageBuildOptions: (
    options: Dockerode.ImageBuildOptions,
    config: PluginDockerConfig
  ) => Dockerode.ImageBuildOptions;
  envOverride: Record<string, string>;
  startActions: PluginDockerStartAction[];
  finishActions: PluginDockerFinishAction[];
  dockerOptions?: DockerOptions;
  hotReload: boolean;
  logger: Logger;
};

export type DockerOptions = Dockerode.DockerOptions;

export type PluginDockerOptions = Omit<
  Partial<PluginDockerConfig>,
  "root" | "logger"
> & {
  name: string;
  dockerfile: string;
};
