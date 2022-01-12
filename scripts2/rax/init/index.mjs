import inquirer from "inquirer";
import { createRequire } from "module";
import chalk from "chalk";
import { writeFile, readFile, mkdir, symlink } from "fs/promises";
import path from "path";
const require = createRequire(import.meta.url);
const { log } = console;

const subpackageMap = require("../../../subpackageMap.json");

const nowSubpackages = subpackageMap.subpackages;
const nowPages = subpackageMap.pages;

let promptList = [
  {
    type: "list",
    message: "请选择使用的框架:",
    name: "frame",
    choices: ["Rax", "Taro"],
    loop: false,
  },
];

const { frame } = await inquirer.prompt(promptList);

if (frame === "Taro") {
  log(chalk.red("暂时尚未支持该框架"));
  process.exit(0);
} else if (frame === "Rax") {
  promptList = [
    {
      type: "list",
      message: "新建页面时是否新建分包:",
      name: "isCreateNewSubpackage",
      choices: ["Yes", "No"],
      loop: false,
    },
  ];
}

const { isCreateNewSubpackage } = await inquirer.prompt(promptList);

const getSubpackName = async (isCreateNewSubpackage) => {
  const pageQuestion = {
    type: "input",
    message:
      "请输入需要创建的页面名字(只能输入英文、数字或横线, 只能以英文开头, 例如firstPage):",
    name: "pageName",
    validate(pageName) {
      const validReg = /^(?![-|\d]+)[a-zA-Z0-9|-]+$/g;
      if (!validReg.test(pageName)) {
        log(chalk.red("\n页面名字不符合规范，请重新输入"));
        return false;
      }
      if (nowPages.hasOwnProperty(pageName)) {
        log(chalk.red("\n该页面名字已存在与当前分包或其他分包，请重新输入"));
        return false;
      }
      return true;
    },
  };
  if (isCreateNewSubpackage === "Yes") {
    promptList = [
      {
        type: "input",
        message:
          "请输入分包名字(只能输入英文、数字或横线, 只能以英文开头, 例如subpackage-1):",
        name: "subpackageName",
        validate(subpackageName) {
          const validReg = /^(?![-|\d]+)[a-zA-Z0-9|-]+$/g;
          if (!validReg.test(subpackageName)) {
            log(chalk.red("\n分包名字不符合规范，请重新输入"));
            return false;
          }
          if (nowSubpackages.hasOwnProperty(subpackageName)) {
            log(chalk.red("\n该分包名字已存在，请重新输入"));
            return false;
          }
          return true;
        },
      },
      {
        ...pageQuestion,
      },
    ];
    const { subpackageName, pageName } = await inquirer.prompt(promptList);
    subpackageMap.subpackages[subpackageName] = [pageName];
    subpackageMap.pages[pageName] = subpackageName;
    return [subpackageName, pageName];
  } else {
    const subpackageChoices = Object.keys(nowSubpackages)
    if (subpackageChoices.length === 0) {
      log(chalk.red("当前没有任何分包"))
      process.exit(1)
    }
    promptList = [
      {
        type: "list",
        message: "请选择本次创建页面所属分包:",
        name: "subpackageName",
        choices: subpackageChoices,
        loop: false,
      },
      {
        ...pageQuestion,
      },
    ];
    const { subpackageName, pageName } = await inquirer.prompt(promptList);
    subpackageMap.subpackages[subpackageName].push(pageName);
    subpackageMap.pages[pageName] = subpackageName;
    return [subpackageName, pageName];
  }
};

const [subpackageName, pageName] = await getSubpackName(isCreateNewSubpackage);

const handleErr = (message, error) => {
  log(chalk.red(message))
  log(error)
  process.exit(1)
}

const readTemplate = async (pageName, filePath) => {
  try {
    const template = await readFile(filePath, "utf-8")
    return template.replaceAll(
      "{{pageName}}",
      pageName
    )
  } catch (error) {
    handleErr("读取模板时发生错误", error)
  }
};

const createRaxPage = async (pageName) => {
  try {
    const templatePathPrefix = "scripts/rax/init/template";
    const [buildJSON, indexJSX, packageJSON, pluginJS] = await Promise.all([
      readTemplate(pageName, `${templatePathPrefix}/build.json.txt`),
      readTemplate(pageName, `${templatePathPrefix}/index.jsx.txt`),
      readTemplate(pageName, `${templatePathPrefix}/package.json.txt`),
      readTemplate(pageName, `${templatePathPrefix}/plugin.js.txt`),
    ]);
    const outputPathPrefix = `workstation/Rax/${pageName}`;
    await mkdir(`${outputPathPrefix}/src`, { recursive: true });
    await Promise.all([
      writeFile(`${outputPathPrefix}/src/index.jsx`, indexJSX, { flag: "w+" }),
      writeFile(`${outputPathPrefix}/build.json`, buildJSON, { flag: "w+" }),
      writeFile(`${outputPathPrefix}/package.json`, packageJSON, { flag: "w+" }),
      writeFile(`${outputPathPrefix}/plugin.js`, pluginJS, { flag: "w+" }),
    ]);
    log(chalk.blue("成功rax页面"));
  } catch (error) {
    handleErr("创建Rax页面时发生错误", error)
  }
};

const createMiniprogramPage = async (pageName) => {
  try {
    const templatePathPrefix = "scripts/rax/init/template";
    const [pageJS, pageJSON, pageWXML] = await Promise.all([
      readTemplate(pageName, `${templatePathPrefix}/page.js.txt`),
      readTemplate(pageName, `${templatePathPrefix}/page.json.txt`),
      readTemplate(pageName, `${templatePathPrefix}/page.wxml.txt`),
    ]);
    const outputPathPrefix = `workstation/pages/${pageName}`;
    await mkdir(outputPathPrefix, { recursive: true });
    await Promise.all([
      writeFile(`${outputPathPrefix}/index.js`, pageJS, { flag: "w+" }),
      writeFile(`${outputPathPrefix}/index.wxml`, pageWXML, { flag: "w+" }),
      writeFile(`${outputPathPrefix}/index.json`, pageJSON, { flag: "w+" }),
    ]);
    log(chalk.blue("成功创建小程序页面"));
  } catch (error) {
    handleErr("创建小程序页面时发生错误", error)
  }
};

const linkDependencies = async (pageName) => {
  try {
    const originPath = path.resolve("node_modules")
    const targetPath = path.resolve(`workstation/Rax/${pageName}/node_modules`)
    await symlink(originPath, targetPath, "junction");
    log(chalk.blue("依赖创建成功"))
  } catch (error) {
    handleErr("依赖创建失败", error)
  }
}

const updateAppJSON = async () => {
  try {
    const appJSON = require("../../../workstation/app.json");
    const pagePath = `pages/${pageName}/index`;
    if (!appJSON.pages.includes(pagePath)) {
      appJSON.pages.push(pagePath);
      await writeFile("workstation/app.json", JSON.stringify(appJSON, null, 2), {
        flag: "w+",
      });
    }
    log(chalk.blue("成功更新app.json"));
  } catch (error) {
    handleErr("更新app.json时发生错误", error)
  }
};

const updateSubpackageMapJSON = async () => {
  try {
    await writeFile(
      "subpackageMap.json",
      JSON.stringify(subpackageMap, null, 2),
      { flag: "w+" }
    );
    log(chalk.blue(`成功更新subpackageMap.json`));
  } catch (error) {
    handleErr("更新subpackageMap.json时发生错误", error)
  }
};

await Promise.all([
  createRaxPage(pageName),
  createMiniprogramPage(pageName),
]);

await linkDependencies(pageName)
await updateAppJSON()
await updateSubpackageMapJSON()
log(chalk.blue(`${pageName}创建成功`));
