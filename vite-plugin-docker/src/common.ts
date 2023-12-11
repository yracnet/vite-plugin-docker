import fs from "fs";
import { join } from "path";
import tar, { Pack } from "tar-fs";
import { loadEnv } from "vite";
import { PluginDockerConfig } from "./types";

type ItemEntry = {
  name: string;
  fullPath: string;
};

export const createTarStream = (config: PluginDockerConfig): Pack => {
  const { profileDir, imageIncludes, root } = config;
  const tarStream = tar.pack(profileDir).on("error", (error) => {
    console.error("Error al crear el archivo tar:", error);
  });

  const attachFile = ({ name, fullPath }: ItemEntry) => {
    let info = fs.statSync(fullPath);
    if (info.isDirectory()) {
      fs.readdirSync(fullPath).forEach((it) => {
        attachFile({
          name: join(name, it).replace(/\\/g, "/"),
          fullPath: join(fullPath, it),
        });
      });
    } else if (info.isFile()) {
      const stream = fs.readFileSync(fullPath);
      tarStream.entry({ name, type: "file" }, stream);
    }
  };

  imageIncludes
    .map((it) => {
      const fullPath = join(root, it.source);
      return {
        name: it.target,
        fullPath,
      };
    })
    .forEach(attachFile);
  return tarStream;
};
export const writeTarStream = async (output: string, tarStream: Pack) => {
  const writeStream = fs.createWriteStream(output);
  return new Promise((resolve, reject) => {
    tarStream.pipe(writeStream);
    writeStream.on("finish", () => {
      console.log("Write:", output);
      resolve(true);
    });
    writeStream.on("error", (error) => {
      reject(error);
    });
  });
};

export const loadDockerEnv = (config: PluginDockerConfig) => {
  const mode = process.env.NODE_ENV || "";
  const envBackup = { ...process.env };
  process.env = { NODE_ENV: mode };
  const { envPrefix, envOverride, root, profileDir } = config;
  const envInit = loadEnv(mode, profileDir, "");
  const envProcess = loadEnv(mode, root, envPrefix);
  process.env = envBackup;
  const env = {
    ...envInit,
    ...envProcess,
    ...envOverride,
  };
  delete env.NODE_ENV;
  return env;
};
