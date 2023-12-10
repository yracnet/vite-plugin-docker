import Docker from "dockerode";
import { PluginDockerConfig, PluginDockerStatus } from "./types";

export const getContainerInfoByName = async (name: string, docker: Docker) => {
  const containers = await docker.listContainers({ all: true });
  return containers.find((it) => it.Names.some((it) => it.includes(name)));
};

export const getContainerByName = async (name: string, docker: Docker) => {
  const containerInfo = await getContainerInfoByName(name, docker);
  const container =
    containerInfo && (await docker.getContainer(containerInfo.Id));
  return { containerInfo, container };
};

export const getImageInfoByName = async (name: string, docker: Docker) => {
  const images = await docker.listImages({ all: true });
  return images.find((it) => it.RepoTags?.some((it) => it.includes(name)));
};

export const getImageByName = async (name: string, docker: Docker) => {
  const imageInfo = await getImageInfoByName(name, docker);
  const image = imageInfo && (await docker.getImage(imageInfo.Id));
  return { imageInfo, image };
};

type DockerStatus = (
  config: PluginDockerConfig,
  docker: Docker
) => Promise<PluginDockerStatus>;

export const getStatus: DockerStatus = async (config, docker) => {
  const status: PluginDockerStatus = {};
  try {
    const { image, imageInfo } = await getImageByName(config.imageTag, docker);
    const { container, containerInfo } = await getContainerByName(
      config.name,
      docker
    );
    status.image = image;
    status.imageInfo = imageInfo;
    status.container = container;
    status.containerInfo = containerInfo;
  } catch (error) {
    status.error = error;
  }
  return status;
};
