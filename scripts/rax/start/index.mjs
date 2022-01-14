import { createRequire } from "module";
import { spawn } from "child_process";
import chalk from "chalk";
const require = createRequire(import.meta.url);
const { log } = console;

const handleErr = (message, error) => {
  log(chalk.red(message))
  log(error)
  process.exit(1)
}

const { pages } = require("../../../subpackageMap.json")
const pagesList = Object.keys(pages)
let port = 3333
pagesList.forEach((pageName) => {
  const projectPath = `workstation/Rax/${pageName}`
  const ls = spawn(
    process.platform === "win32" ? "yarn.cmd" : "yarn",
    ["start", `--port=${port++}`],
    { cwd: projectPath }
  );
  ls.stdout.on("data", (data) => {
    log(`${data}`);
  });
  ls.stderr.on("data", (data) => {
    log(`${data}`);
  });
  ls.on("error", (err) => {
    handleErr(`${pageName}页面进程发生错误`, err);
  });
})