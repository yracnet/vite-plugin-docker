import { PluginDockerConfig } from "./types";
import fs from "fs";
import path from "path";
import tar, { Pack } from "tar-fs";

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
          name: path.join(name, it),
          fullPath: path.join(fullPath, it),
        });
      });
    } else if (info.isFile()) {
      const stream = fs.readFileSync(fullPath);
      tarStream.entry({ name, type: "file" }, stream);
    }
  };

  imageIncludes
    .map((it) => {
      const fullPath = path.join(root, it);
      const stats = fs.statSync(fullPath);
      const name = stats.isDirectory() ? "" : path.basename(it);
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
