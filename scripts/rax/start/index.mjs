import { createRequire } from "module";
import { spawn } from "child_process";
import { symlink, rm } from "fs/promises";
import chalk from "chalk";
import path from "path";
const require = createRequire(import.meta.url);
const { log } = console;

const handleErr = (message, error) => {
  log(chalk.red(message));
  log(error);
  process.exit(1);
};

const { pages } = require("../../../subpackageMap.json");
const pagesList = Object.keys(pages);
const linkDependencies = async (pagesList) => {
  try {
    const originPath = path.resolve("node_modules");
    await rm("workspace/node_modules", { recursive: true, force: true });
    await symlink(originPath, "workspace/node_modules", "junction");
    await Promise.all(
      pagesList.map(async (pageName) => {
        await rm(`workspace/Rax/${pageName}/node_modules`, {
          recursive: true,
          force: true
        });
        const targetPath = path.resolve(`workspace/Rax/${pageName}/node_modules`);
        await symlink(originPath, targetPath, "junction");
      })
    );
    log(chalk.blue("依赖创建成功"));
  } catch (error) {
    handleErr("依赖创建失败", error);
  }
};

await linkDependencies(pagesList);

let port = 3333;
pagesList.forEach((pageName) => {
  const projectPath = `workspace/Rax/${pageName}`;
  const ls = spawn(process.platform === "win32" ? "yarn.cmd" : "yarn", ["start", `--port=${port++}`], { cwd: projectPath });
  ls.stdout.on("data", (data) => {
    log(`${data}`);
  });
  ls.stderr.on("data", (data) => {
    log(`${data}`);
  });
  ls.on("error", (err) => {
    handleErr(`${pageName}页面进程发生错误`, err);
  });
});
