import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function readPackageJson(pkgFile) {
  if (pkgFile) {
    const packageJsonContent = fs.readFileSync(pkgFile, 'utf8');
    const pkgJson = JSON.parse(packageJsonContent);
    return [pkgJson, pkgFile];
  }
  let currentDir = process.cwd();
  while (currentDir !== '/') {
    const pkgFile = `${currentDir}/package.json`;
    if (fs.existsSync(pkgFile)) {
      const packageJsonContent = fs.readFileSync(pkgFile, 'utf8');
      const pkgJson = JSON.parse(packageJsonContent);
      return [pkgJson, pkgFile];
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('No se encontró el archivo package.json');
}

function executeCommands(commands) {
  commands.forEach((command) => {
    try {
      console.log(`Ejecutando: ${command}`);
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.log(`ERROR: ${command}`, error);
    }
  });
}
function getRecordDependencies(pkgJson = {}) {
  const asRecord = (source = {}, origin) =>
    Object.entries(source).map((it) => {
      const [name, version] = it;
      return {
        origin,
        name,
        version,
      };
    });
  const dep = asRecord(pkgJson.dependencies, 'dep');
  const dev = asRecord(pkgJson.devDependencies, 'dev');
  const peer = asRecord(pkgJson.peerDependencies, 'peer');
  return [...dep, ...dev, ...peer];
}

const FLAG = {
  dev: '-D',
  dep: '',
  peer: '',
};
const VERSIONS = [
  // PREFIX
  '/',
  './',
  '../',
  'file:',
  '*',
];
const reduceDuplicate = (array, name) => {
  if (!array.find((it) => name === it)) {
    array.push(name);
  }
  return array;
};

function main() {
  try {
    const [pkgJson, pkgFile] = readPackageJson();
    const list = getRecordDependencies(pkgJson);
    console.log('>>dependencies:', JSON.stringify(list, null, 2));

    const removeAllCommands = `yarn remove ${list
      .map((it) => it.name)
      .reduce(reduceDuplicate, [])
      .join(' ')}`;
    const addCommands = list
      .filter((it) => it.origin !== 'peer')
      .filter((it) => !VERSIONS.find((rule) => it.version.startsWith(rule)))
      .reduce(reduceDuplicate, [])
      .map((it) => {
        return `yarn add ${FLAG[it.origin]} ${it.name}`;
      });

    executeCommands([removeAllCommands, ...addCommands]);

    const [newPkgJson] = readPackageJson(pkgFile);
    newPkgJson.peerDependencies = list
      .filter((it) => it.origin === 'peer')
      .map((it) => it.name)
      .sort()
      .map((name) => {
        const version =
          newPkgJson.dependencies[name] || newPkgJson.devDependencies?.[name];
        return { name, version };
      })
      .filter((it) => it.version)
      .reduce((map, it) => {
        map[it.name] = it.version;
        return map;
      }, {});
    fs.writeFileSync(pkgFile, JSON.stringify(newPkgJson, null, 2));
    console.log('Script completado con éxito.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
