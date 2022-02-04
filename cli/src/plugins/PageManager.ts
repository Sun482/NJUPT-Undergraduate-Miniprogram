// 此插件搜集小程序用到的页面
// 每个页面多进程开始构建

import { writeFile, readFile, mkdir, rm, readdir, rename } from "fs/promises";
import { exec } from "child_process";
import { minify } from "uglify-js";
import { Compiler, WebpackPluginInstance } from "webpack";
import { PageInfo } from "../interface/PageInfo";
import * as chalk from "chalk";
import * as ci from "miniprogram-ci";

const subpackageMap = require("../../../subpackageMap.json");
const nowSubpackages = subpackageMap.subpackages;
const nowPages = subpackageMap.pages;

const appJSON = require("../../../workspace/app.json");
const preloadRulesJSON = require("../../../preloadRules.json");
const projectConfigJSON = require("../../../workspace/project.config.json");
const sitemapConfigJSON = require("../../../workspace/sitemap.json");
const packageJSON = require("../../../package.json");
const dependenciesMapJSON = require("../../../dependenciesMap.json");

const { log } = console;
const handleErr = (message, error) => {
  log(chalk.red(message));
  log(error);
  process.exit(1);
};

const pluginName = "PageManagerPlugin";

const compressJS = (content) => minify(content).code;
const compressJSON = (JSONObj) => JSON.stringify(JSONObj);
export class PageManagerPlugin implements WebpackPluginInstance {
  pageArr: PageInfo[]; //
  constructor(props: { pages: string[] }) {
    const { pages } = props;
    this.pageArr = pages.map((item) => {
      return { path: item, frame: "Rax" };
    });
  }
  apply(compiler: Compiler) {
    compiler.hooks.run.tapAsync(pluginName, async (_, cb) => {
      console.log("✨  开始准备页面信息");

      this.pageArr.map((item) => {
        const { path, frame } = item;
        console.log(`🔍  发现页面[${frame}]:${path}`);
      });

      await this.compile();
      console.log("✨  页面编译完成");
      cb();
    });
  }
  async createSubpackageAndPageDir(nowSubpackages) {
    try {
      const subpackageList = Object.keys(nowSubpackages);
      await Promise.all(
        subpackageList.map(async (subpackageName) => {
          const pageList = nowSubpackages[subpackageName];
          await Promise.all(
            pageList.map(async (pageName) => {
              await mkdir(`dist/pages/${subpackageName}/${pageName}`, {
                recursive: true
              });
            })
          );
        })
      );

      log(chalk.blue("成功创建分包文件夹和页面文件夹"));
    } catch (error) {
      log(chalk.red("创建分包文件和页面文件时出现错误", error));
    }
  }
  async generateBasicPageFiles(nowPages) {
    try {
      const pageList = Object.keys(nowPages);
      await Promise.all(
        pageList.map(async (pageName) => {
          const subpackageName = nowPages[pageName];
          const originPathPrefix = `workspace/pages/${subpackageName}/${pageName}`;
          const fileLists = await readdir(originPathPrefix);
          await Promise.all(
            fileLists.map(async (fileName) => {
              let fileContent = await readFile(`${originPathPrefix}/${fileName}`, "utf-8");
              if (fileName === "index.json") {
                const JSONObj = JSON.parse(fileContent);
                JSONObj.usingComponents[pageName] = "./components/index";
                fileContent = compressJSON(JSONObj);
              }
              if (fileName === "index.js") {
                fileContent = compressJS(fileContent);
              }
              await writeFile(`dist/pages/${subpackageName}/${pageName}/${fileName}`, fileContent, { flag: "w+" });
            })
          );
        })
      );
    } catch (error) {
      handleErr("生成页面基础文件时出错", error);
    }
  }
  async generateAppJS() {
    try {
      let appJS = await readFile("workspace/app.js", "utf-8");
      appJS = compressJS(appJS);
      await writeFile("dist/app.js", appJS, { flag: "w+" });
    } catch (error) {
      handleErr("生成app.js出错", error);
    }
  }
  formatPreloadRulesJSON = (nowPages, preloadRulesJSON) => {
    const ruleKeys = Object.keys(preloadRulesJSON);
    const newPreloadRulesObj = {};
    ruleKeys.forEach((pageName) => {
      const subpackageName = nowPages[pageName];
      newPreloadRulesObj[`pages/${subpackageName}/${pageName}/index`] = preloadRulesJSON[pageName];
    });
    return newPreloadRulesObj;
  };

  generateAppJSON = async (nowSubpackages, nowPages, preloadRulesJSON) => {
    try {
      const pages: string[] = [];
      const subpackages: any[] = [];
      const subpackageList = Object.keys(nowSubpackages);
      subpackageList.forEach((subpackageName) => {
        const pageList = nowSubpackages[subpackageName];
        if (subpackageName === "main") {
          pageList.forEach((pageName) => {
            pages.push(`pages/${subpackageName}/${pageName}/index`);
          });
        } else {
          const subpackageItem = {
            root: `pages/${subpackageName}`,
            name: subpackageName,
            pages: [] as string[]
          };
          pageList.forEach((pageName) => {
            subpackageItem.pages.push(`${pageName}/index`);
          });
          subpackages.push(subpackageItem);
        }
      });
      appJSON.pages = pages;
      if (subpackages.length !== 0) {
        appJSON.subpackages = subpackages;
      }
      const preloadRule = this.formatPreloadRulesJSON(nowPages, preloadRulesJSON);
      if (Object.keys(preloadRule).length !== 0) {
        appJSON.preloadRule = preloadRule;
      }
      await writeFile("dist/app.json", JSON.stringify(appJSON), { flag: "w+" });
    } catch (error) {
      handleErr("生成app.json时出错", error);
    }
  };
  runBuildInRaxPage = (pageName) =>
    new Promise<void>((resolve) => {
      console.log(`✨  开始构建页面${pageName}`);
      exec("yarn build", { cwd: `workspace/Rax/${pageName}` }, (error) => {
        if (error) {
          handleErr(`❕  构建${pageName}时出错`, error);
        }
        console.log(`✨  成功构建${pageName}`);
        resolve();
      });
    });

  moveProduction = async (pageName, subpackageName) => {
    try {
      await rename(`workspace/Rax/${pageName}/dist/wechat-miniprogram`, `dist/pages/${subpackageName}/${pageName}/components`);
      await rm(`workspace/Rax/${pageName}/dist`, {
        recursive: true,
        force: true
      });
    } catch (error) {
      handleErr("移动构建产物时出错(观察是否在控制台中打开了某个页面, 如果有请先关闭)", error);
    }
  };

  buildPages = async (nowPages) => {
    const pageList = Object.keys(nowPages);
    await Promise.all(
      pageList.map(async (pageName) => {
        await this.runBuildInRaxPage(pageName);
      })
    );
    await Promise.all(
      pageList.map(async (pageName) => {
        const subpackageName = nowPages[pageName];
        await this.moveProduction(pageName, subpackageName);
      })
    );
  };
  packNpmManually = async (packageJsonPath, miniprogramNpmDistDir) => {
    await ci.packNpmManually({
      packageJsonPath,
      miniprogramNpmDistDir
    });
  };
  packGlobalNpm = async (packageJSON, independentDependenciesSet) => {
    const { dependencies } = packageJSON;
    independentDependenciesSet.forEach((denpendency) => {
      delete dependencies[denpendency];
    });
    await writeFile("package.json", JSON.stringify(packageJSON), {
      flag: "w+"
    });
    await this.packNpmManually("package.json", "dist");
  };

  buildNpm = async () => {
    const copyPackageJSON = JSON.parse(JSON.stringify(packageJSON));
    try {
      const subpackageList = Object.keys(dependenciesMapJSON);
      const independentDependenciesSet = new Set();
      subpackageList.forEach((subpackageName) => {
        const dependenciesList = Object.keys(dependenciesMapJSON[subpackageName]);
        dependenciesList.forEach((denpendency) => {
          if (independentDependenciesSet.has(denpendency)) {
            handleErr(`使用到${denpendency}的分包多于1个, 该依赖应该抽离到全局分包`, "");
          } else {
            independentDependenciesSet.add(denpendency);
          }
        });
      });
      await this.packNpmManually("package.json", "dist");
      await Promise.all(
        subpackageList.map(async (subpackageName) => {
          const debpendenciesObj = {
            dependencies: dependenciesMapJSON[subpackageName]
          };
          await writeFile("package.json", JSON.stringify(debpendenciesObj), {
            flag: "w+"
          });
          await this.packNpmManually("package.json", `dist/pages/${subpackageName}`);
        })
      );
      await this.packGlobalNpm(packageJSON, independentDependenciesSet);
      await writeFile("package.json", JSON.stringify(copyPackageJSON, null, 2), {
        flag: "w+"
      });
    } catch (error) {
      await writeFile("package.json", JSON.stringify(copyPackageJSON, null, 2), {
        flag: "w+"
      });
      handleErr("构建npm出错", error);
    }
  };
  async compile() {
    await rm("dist", { recursive: true, force: true }).catch((err) =>
      handleErr("删除dist文件夹旧有文件时出现错误(请检查是否在开发者工具中打开了dist文件夹, 如果有请先关闭开发者工具)", err)
    );
    log(chalk.blue("成功删除旧有文件"));

    await this.createSubpackageAndPageDir(nowSubpackages);
    await this.generateBasicPageFiles(nowPages);

    log(chalk.blue("成功生成页面基础文件"));

    await this.generateAppJS();
    log(chalk.blue("成功生成app.js"));

    await this.generateAppJSON(nowSubpackages, nowPages, preloadRulesJSON);
    log(chalk.blue("成功生成app.json"));

    const generateProjectConfigJSON = async () => {
      await writeFile("dist/project.config.json", compressJSON(projectConfigJSON), {
        flag: "w+"
      });
    };

    await generateProjectConfigJSON();
    log(chalk.blue("成功生成project.config.json"));

    const generateSitemapJSON = async () => {
      await writeFile("dist/sitemap.json", compressJSON(sitemapConfigJSON), {
        flag: "w+"
      });
    };

    await generateSitemapJSON();
    log(chalk.blue("成功生成sitemap.json"));

    await this.buildPages(nowPages);
    log(chalk.blue("成功生成页面产物"));

    log(chalk.blue("开始构建npm"));
    await this.buildNpm();
    log(chalk.blue("npm构建完成"));
  }
}
