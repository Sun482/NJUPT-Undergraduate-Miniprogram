import { access, mkdir, writeFile } from "fs/promises";
import { constants } from "fs";
import readTemplate from "./readTemplate.mjs";

export default (pageName) =>
  new Promise((resolve) => {
    const targetDirectory = `pages/${pageName}`;
    access(targetDirectory, constants.W_OK)
      .then(() => {
        console.log(
          `${pageName}页面已存在, 请更改文件名或删除${pageName}相关文件夹`
        );
      })
      .catch(() => {
        mkdir(targetDirectory, { recursive: true }).then(() => {
          Promise.all([
            readTemplate("page.js", pageName),
            readTemplate("page.json", pageName),
            readTemplate("page.wxml", pageName),
          ]).then(([pageJSContent, pageJSONContent, pageWXMLContent]) => {
            Promise.all([
              writeFile(`${targetDirectory}/${pageName}.js`, pageJSContent),
              writeFile(`${targetDirectory}/${pageName}.json`, pageJSONContent),
              writeFile(`${targetDirectory}/${pageName}.wxml`, pageWXMLContent),
            ])
              .then(() => resolve())
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          });
        });
      });
  });
