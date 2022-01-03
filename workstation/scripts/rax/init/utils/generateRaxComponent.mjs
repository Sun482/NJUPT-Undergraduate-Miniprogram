import { access, mkdir, writeFile, readFile } from "fs/promises";
import { constants } from "fs";
import readTemplate from "./readTemplate.mjs";

export default (pageName) =>
  new Promise((resolve, reject) => {
    const targetDirectory = `Rax/pages/${pageName}`;
    access(targetDirectory, constants.W_OK)
      .then(() => {
        console.log(
          `${pageName}页面已存在, 请更改文件名或删除${pageName}相关文件夹`
        );
      })
      .catch(() => {
        mkdir(`${targetDirectory}/src/sections`, { recursive: true }).then(
          () => {
            Promise.all([
              readTemplate("build.json", pageName),
              readTemplate("index.jsx", pageName),
              readTemplate("package.json", pageName),
              readTemplate("plugin.js", pageName),
              readFile("scripts/rax/init/template/nowMaxPort.txt", "utf-8"),
            ]).then(
              ([
                buildJSONContent,
                indexJSXContent,
                packageJSONContent,
                pluginJSContext,
                nowMaxPort,
              ]) => {
                Promise.all([
                  writeFile(`${targetDirectory}/build.json`, buildJSONContent),
                  writeFile(
                    `${targetDirectory}/src/index.jsx`,
                    indexJSXContent
                  ),
                  writeFile(
                    `${targetDirectory}/package.json`,
                    packageJSONContent.replace("${port}", Number(nowMaxPort) + 1)
                  ),
                  writeFile(
                    "scripts/rax/init/template/nowMaxPort.txt",
                    `${Number(nowMaxPort) + 1}`,
                    { flag: "w+" }
                  ),
                  writeFile(`${targetDirectory}/plugin.js`, pluginJSContext),
                ])
                  .then(() => resolve())
                  .catch((err) => {
                    console.log(err);
                    reject(err);
                  });
              }
            );
          }
        );
      });
  });
