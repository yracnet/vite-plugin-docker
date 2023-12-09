import { PluginDockerConfig, PluginDockerStatus } from "./types";
import Docker from "dockerode";
import { createTarStream } from "./common";

type DockerStatus = (
  config: PluginDockerConfig,
  docker: Docker
) => Promise<PluginDockerStatus>;

export const getStatus: DockerStatus = async (config, docker) => {
  const status: PluginDockerStatus = {
    containerId: "0",
    containerName: config.name,
    containerState: "error",
    containerExist: false,
    imageId: "0",
    imageName: config.imageTag,
    imageExist: false,
  };
  try {
    const containers = await docker.listContainers({ all: true });
    const containerInfo = containers.find((it) =>
      it.Names.some((it) => it.includes(config.name))
    );
    if (containerInfo) {
      status.containerExist = true;
      status.containerId = containerInfo.Id;
      status.containerState = containerInfo.State;
      status.imageId = containerInfo.ImageID;
      status.imageName = containerInfo.Image;
      status.imageExist = true;
    }

    const images = await docker.listImages({ all: true });
    const imageInfo = images.find((it) =>
      it.RepoTags?.some((it) => it.includes(config.imageTag))
    );
    if (imageInfo) {
      status.imageId = imageInfo.Id;
      //status.imageName = imageInfo.RepoTags?.find((it) => true);
      status.imageExist = true;
    }
  } catch (error) {
    status.error = error;
  }
  return status;
};

type DockerAction = (
  config: PluginDockerConfig,
  docker: Docker,
  status: PluginDockerStatus
) => Promise<PluginDockerStatus> | PluginDockerStatus;

export const createImage: DockerAction = (config, docker, status) => {
  const logger = config.logger;
  if (status.imageExist && status.imageName === config.imageTag) {
    logger.warn(`The image: ${config.imageTag} exists!`);
    return status;
  }
  return new Promise((resolve) => {
    const tarStream = createTarStream(config);
    const imageOpts = config.onImageBuildOptions(
      {
        t: config.imageTag,
        dockerfile: config.dockerfile,
      },
      config
    );
    docker.buildImage(tarStream, imageOpts, (error, stream) => {
      if (error) {
        status.error = error;
        resolve(status);
        return;
      }
      stream!.pipe(process.stdout);
      stream!.on("end", () => resolve(status));
    });
  });
};

export const createContainer: DockerAction = async (config, docker, status) => {
  const logger = config.logger;
  if (status.containerExist && status.containerName === config.name) {
    logger.warn(`The container: ${config.name} exists!`);
    return status;
  }
  return new Promise((resolve) => {
    const containerOpts = config.onContainerCreateOptions(
      {
        Image: config.imageTag,
        Tty: true,
        name: config.name,
        ExposedPorts: {},
        HostConfig: {},
      },
      config
    );
    docker.createContainer(containerOpts, (error, container) => {
      if (error) {
        status.error = error;
        resolve(status);
        return;
      }
      status.containerId = container!.id;
      status.containerExist = true;
      status.containerState = "creating";
      resolve(status);
    });
  });
};

export const startContainer: DockerAction = async (config, docker, status) => {
  const logger = config.logger;
  return new Promise((resolve) => {
    if (!status.containerExist) {
      status.error = new Error("Container don't exist");
      return resolve(status);
    }
    if (status.containerState == "running") {
      logger.info(`Container running`);
      return resolve(status);
    }
    const container = docker.getContainer(config.name);
    container.start({}, (error) => {
      if (error) {
        status.error = error;
        resolve(status);
        return;
      }
      logger.info(`Container started`);
      resolve(status);
    });
  });
};

export const removeContainer: DockerAction = async (config, docker, status) => {
  const logger = config.logger;
  logger.warn("This method is not implemented yet.");
  return status;
};

export const removeImage: DockerAction = async (config, docker, status) => {
  const logger = config.logger;
  logger.warn("This method is not implemented yet.");
  return status;
};

export const stopContainer: DockerAction = async (config, docker, status) => {
  const logger = config.logger;
  logger.warn("This method is not implemented yet.");
  return status;
};
