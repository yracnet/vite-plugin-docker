# Docker Plugin for Vite.js

This is a Vite.js plugin that facilitates integration with Docker for building and running containers.

## Motivation

The motivation behind using this plugin is to streamline the development environment by creating isolated standalone environments for each developer. This allows developers to work in a consistent and reproducible environment, minimizing potential conflicts and ensuring a smoother development experience.

## Installation

```bash
npm install --save-dev plugin-docker
```

## Usage

In your `vite.config.js` file, import the plugin and add it to the plugins section:

```javascript
import { defineConfig } from "vite";
import pluginDocker from "plugin-docker";
export default defineConfig({
  plugins: [
    pluginDocker([
      // ...Docker configurations here
    ]),
  ],
});
```

## Configuration

### Attributes of `PluginDockerOptions`

| Attribute       | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `name`          | Name of the Docker container.                                    |
| `dockerfile`    | Path to the Dockerfile for building the image.                   |
| `enabled`       | (Optional) Enable or disable the plugin. Default value: `true`.  |
| `profile`       | (Optional) Image build profile.                                  |
| `imageTag`      | (Optional) Docker image tag.                                     |
| `imageIncludes` | (Optional) Files included in the Docker image.                   |
| `actionOptions` | (Optional) Action options for customizing Docker actions.        |
| `startActions`  | (Optional) Actions to perform when starting the container.       |
| `finishActions` | (Optional) Actions to perform after the container finishes.      |
| `dockerOptions` | (Optional) Additional Docker options.                            |
| `hotReload`     | (Optional) Enable or disable hot reload. Default value: `false`. |

### Example 1

```javascript
import { defineConfig } from "vite";
import pluginDocker from "plugin-docker";
export default defineConfig({
  plugins: [
    pluginDocker({
      name: "NGinx",
      dockerfile: "NGinx.Dockerfile",
      actionOptions: {
        onContainerCreateOptions: (opts) => {
          return {
            ...opts,
            ExposedPorts: { "80/tcp": {} },
            HostConfig: {
              PortBindings: { "80/tcp": [{ HostPort: "8080" }] },
            },
          };
        },
      },
      startActions: ["image:build", "container:create", "container:start"],
    }),
  ],
});
```

### Example 2

```javascript
import { defineConfig } from "vite";
import pluginDocker from "plugin-docker";
export default defineConfig({
  plugins: [
    pluginDocker({
      name: "MongoV1",
      imageTag: "mongo",
      actionOptions: {
        onContainerCreateOptions: (opts) => {
          return {
            ...opts,
            ExposedPorts: { "27017/tcp": {} },
            HostConfig: {
              PortBindings: { "27017/tcp": [{ HostPort: "27017" }] },
            },
          };
        },
      },
      startActions: ["container:create", "container:start"],
    }),
  ],
});
```

### Example 3

```javascript
import { defineConfig } from "vite";
import pluginDocker from "plugin-docker";
export default defineConfig({
  plugins: [
    pluginDocker([
      {
        // MONGO
      },
      {
        // NGINX
      },
      // Other containers...
    ]),
  ],
});
```
