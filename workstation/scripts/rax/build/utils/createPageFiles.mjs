import { readFile, writeFile } from "fs/promises";
import handleError from "./handleError.mjs";
import { minify } from "uglify-js";

export default (pageName) =>
  new Promise((resolve) => {
    const prefix = `pages/${pageName}/${pageName}`;
    Promise.all([
      readFile(`${prefix}.js`, "utf-8"),
      readFile(`${prefix}.json`, "utf-8"),
      readFile(`${prefix}.wxml`, "utf-8"),
    ])
      .then(([jsContent, jsonContent, wxmlContent]) => {
        jsContent = minify(jsContent).code;
        const jsonObj = JSON.parse(jsonContent);
        jsonObj.usingComponents[pageName] = "./components/index";
        jsonContent = JSON.stringify(jsonObj);
        const destPrefix = `../dist/pages/${pageName}/${pageName}`;
        Promise.all([
          writeFile(`${destPrefix}.js`, jsContent),
          writeFile(`${destPrefix}.json`, jsonContent),
          writeFile(`${destPrefix}.wxml`, wxmlContent),
        ])
          .then(() => {
            resolve();
          })
          .catch((err) => handleError(err, "创建页面文件时出错"));
      })
      .catch((err) => handleError(err, "读取页面文件时出错"));
  });
