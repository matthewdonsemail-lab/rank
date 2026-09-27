const path = require("node:path");
const Module = require("node:module");

const docsNodeModules = path.join(__dirname, "node_modules");
const nodePath = process.env.NODE_PATH ?? "";
if (!nodePath.split(path.delimiter).includes(docsNodeModules)) {
  process.env.NODE_PATH = [docsNodeModules, nodePath]
    .filter(Boolean)
    .join(path.delimiter);
  Module._initPaths();
}

module.exports = docsNodeModules;
