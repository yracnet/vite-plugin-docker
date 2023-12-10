import { PluginDockerConfig, PluginDockerStatus } from "./types";
import Docker from "dockerode";
import { createTarStream, loadDockerEnv } from "./common";
import {
  getContainerByName,
  getContainerInfoByName,
  getImageByName,
} from "./dockerInfo";
import { loadEnv } from "vite";

type DockerAction = (
  config: PluginDockerConfig,
  docker: Docker,
  status: PluginDockerStatus
) => Promise<PluginDockerStatus> | PluginDockerStatus;

const followProcess = (stream: any, docke: Docker) =>
  new Promise((resolve, reject) => {
    docke.modem.followProgress(stream, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });

export const buildImage: DockerAction = async (config, docker, status) => {
  if (status.image) {
    config.logger.warn(`The image: ${config.imageTag} exists!`);
    return status;
  }
  try {
    const env = loadDockerEnv(config);
    const tarStream = createTarStream(config);
    const buildOpts = config.actionOptions.onImageBuildOptions(
      {
        t: config.imageTag,
        dockerfile: config.dockerfile,
        buildargs: env,
      },
      config
    );
    const stream = await docker.buildImage(tarStream, buildOpts);
    stream.pipe(process.stdout);
    await followProcess(stream, docker);
    const { image, imageInfo } = await getImageByName(config.imageTag, docker);
    status.image = image;
    status.imageInfo = imageInfo;
  } catch (error) {
    status.error = error;
  }
  return status;
};

export const removeImage: DockerAction = async (config, docker, status) => {
  const { image } = status;
  if (!image) {
    config.logger.warn(`The image: ${config.imageTag} don't exists!`);
    return status;
  }
  try {
    const removeOpts = config.actionOptions.onImageRemoveOptions({}, config);
    await image.remove(removeOpts);
  } catch (error) {
    status.error = error;
  }
  return status;
};

export const createContainer: DockerAction = async (config, docker, status) => {
  const env = loadDockerEnv(config);
  if (status.container) {
    config.logger.warn(`The container ${config.name} exists!`);
    return status;
  }
  try {
    const containerOpts = config.actionOptions.onContainerCreateOptions(
      {
        Image: config.imageTag,
        Tty: true,
        name: config.name,
        ExposedPorts: {},
        HostConfig: {},
      },
      config
    );
    await docker.createContainer(containerOpts);
    const { container, containerInfo } = await getContainerByName(
      config.name,
      docker
    );
    status.container = container;
    status.containerInfo = containerInfo;
  } catch (error) {
    status.error = error;
  }
  return status;
};

export const restartContainer: DockerAction = async (
  config,
  docker,
  status
) => {
  const { container } = status;
  if (!container) {
    config.logger.warn(`The container ${config.name} don't exists!`);
    return status;
  }
  try {
    await container.restart();
    status.containerInfo = await getContainerInfoByName(config.name, docker);
  } catch (error) {
    status.error = error;
  }
  return status;
};

export const startContainer: DockerAction = async (config, docker, status) => {
  const { container, containerInfo } = status;
  if (!container) {
    config.logger.warn(`The container ${config.name} don't exists!`);
    return status;
  }
  try {
    if (containerInfo!.State === "running") {
      config.logger.warn(`The container ${config.name} is running!`);
      return status;
    }
    const startOpts = config.actionOptions.onContainerStartOptions({}, config);
    await container.start(startOpts);
    status.containerInfo = await getContainerInfoByName(config.name, docker);
  } catch (error) {
    status.error = error;
  }
  return status;
};

export const stopContainer: DockerAction = async (config, docker, status) => {
  const { container } = status;
  if (!container) {
    config.logger.warn(`The container ${config.name} don't exists!`);
    return status;
  }
  try {
    const stopOpts = config.actionOptions.onContainerStopOptions({}, config);
    await container.stop(stopOpts);
    status.containerInfo = await getContainerInfoByName(config.name, docker);
  } catch (error) {
    status.error = error;
  }
  return status;
};

export const removeContainer: DockerAction = async (config, docker, status) => {
  const { container, containerInfo } = status;
  if (!container) {
    config.logger.warn(`The container ${config.name} don't exists!`);
    return status;
  }
  try {
    if (containerInfo!.State === "running") {
      config.logger.warn(`The container ${config.name} is running!`);
      return status;
    }
    const removeOpts = config.actionOptions.onContainerRemoveOptions(
      {},
      config
    );
    await container.remove(removeOpts);
    status.containerInfo = await getContainerInfoByName(config.name, docker);
  } catch (error) {
    status.error = error;
  }
  return status;
};
