import inquirer from "inquirer";
import { createRequire } from "module";
import chalk from "chalk";
import { writeFile, rm } from "fs/promises";
const require = createRequire(import.meta.url);
const { log } = console;

const subpackageMap = require("../../../subpackageMap.json");
const appJSON = require("../../../workspace/app.json");

const nowSubpackages = subpackageMap.subpackages;
const nowPages = subpackageMap.pages;

const promptList = [
  {
    type: "input",
    message: "请输入需要删除的页面:",
    name: "pageName",
    validate(pageName) {
      if (!nowPages.hasOwnProperty(pageName)) {
        log(chalk.red("\n该页面不存在, 请重新输入"));
        return false;
      }
      return true;
    }
  }
];

const { pageName } = await inquirer.prompt(promptList);

const handleErr = (message, error) => {
  log(chalk.red(message));
  log(error);
  process.exit(1);
};

const deleteRaxPage = async (pageName) => {
  try {
    const dirPath = `workspace/Rax/${pageName}`;
    await rm(dirPath, { recursive: true, force: true });
    log(chalk.blue("删除Rax页面成功"));
  } catch (error) {
    handleErr("删除Rax页面失败, 请检查当前是否有在控制台打开需要删除的目录, 如果有需先关闭再进行删除操作", error);
  }
};

const deleteMiniprogramPage = async (pageName) => {
  try {
    const dirPath = `workspace/pages/${pageName}`;
    await rm(dirPath, { recursive: true, force: true });
    log(chalk.blue("删除小程序页面成功"));
  } catch (error) {
    handleErr("删除小程序页面失败", error);
  }
};

const updateAppJSON = async (pageName) => {
  try {
    appJSON.pages = appJSON.pages.filter((name) => name !== `pages/${pageName}/index`);
    await writeFile("workspace/app.json", JSON.stringify(appJSON, null, 2), {
      flag: "w+"
    });
    log(chalk.blue("成功在app.json中删除页面信息"));
  } catch (error) {
    handleErr("在app.json中删除相关信息时出错", error);
  }
};

const updateSubpackageMapJSON = async (pageName) => {
  try {
    const subpackageName = nowPages[pageName];
    delete nowPages[pageName];
    nowSubpackages[subpackageName] = nowSubpackages[subpackageName].filter((name) => name !== pageName);
    if (nowSubpackages[subpackageName].length === 0 && subpackageName !== "main") {
      delete nowSubpackages[subpackageName];
    }
    await writeFile("subpackageMap.json", JSON.stringify(subpackageMap, null, 2), {
      flag: "w+"
    });
    log(chalk.blue("成功在subpackageMap.json中删除页面信息"));
  } catch (error) {
    handleErr("在subpackageMap.json中删除相关信息时出错", error);
  }
};

await deleteRaxPage(pageName);
await deleteMiniprogramPage(pageName);
await updateAppJSON(pageName);
await updateSubpackageMapJSON(pageName);

log(chalk.blue(`${pageName}删除成功`));
