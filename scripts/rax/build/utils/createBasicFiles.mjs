import { readFile, rm, writeFile, mkdir } from "fs/promises";
import handleError from "./handleError.mjs";
import { minify } from "uglify-js";

export default () =>
  new Promise(async (resolve) => {
    await rm("dist", { recursive: true, force: true }).catch((err) =>
      handleError(err, "删除dist文件夹出现错判")
    );
    await mkdir("dist/pages", { recursive: true }).catch((err) =>
      handleError(err, "创建dist文件夹出错")
    );
    Promise.all([readFile("workstation/app.js", "utf-8"), readFile("workstation/app.json", "utf-8")])
      .then(([appJSContent, appJSONContent]) => {
        appJSContent = minify(appJSContent).code;
        appJSONContent = JSON.stringify(JSON.parse(appJSONContent));
        Promise.all([
          writeFile("dist/app.js", appJSContent),
          writeFile("dist/app.json", appJSONContent),
        ])
          .then(() => resolve())
          .catch((err) => handleError(err, "创建app.js和app.json时出错"));
      })
      .catch((err) => handleError(err, "读取app.js和app.json时出错"));
  });
