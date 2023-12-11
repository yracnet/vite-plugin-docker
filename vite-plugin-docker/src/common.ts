import fs from "fs";
import { basename, join } from "path";
import tar, { Pack } from "tar-fs";
import { loadEnv } from "vite";
import { PluginDockerConfig } from "./types";

type ItemEntry = {
  name: string;
  fullPath: string;
};

export const createTarStream = (config: PluginDockerConfig): Pack => {
  const { profile, imageIncludes, root } = config;
  const tarStream = tar.pack(profile).on("error", (error) => {
    console.error("Error al crear el archivo tar:", error);
  });

  const attachFile = ({ name, fullPath }: ItemEntry) => {
    let info = fs.statSync(fullPath);
    if (info.isDirectory()) {
      fs.readdirSync(fullPath).forEach((it) => {
        attachFile({
          name: join(name, it),
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
      const fullPath = join(root, it);
      const stats = fs.statSync(fullPath);
      const name = stats.isDirectory() ? "" : basename(it);
      return {
        name,
        fullPath,
      };
    })
    .forEach(attachFile);
  return tarStream;
};
export const createTar = (output: string, tarStream: Pack) => {
  tarStream.pipe(fs.createWriteStream(output)).on("finish", () => {
    console.log("Write:", output);
  });
};

export const loadDockerEnv = (config: PluginDockerConfig) => {
  const mode = process.env.NODE_ENV || "";
  const envBackup = { ...process.env };
  process.env = { NODE_ENV: mode };
  const { envPrefix, envOverride, root, profile } = config;
  const envInit = loadEnv(mode, profile, "");
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
