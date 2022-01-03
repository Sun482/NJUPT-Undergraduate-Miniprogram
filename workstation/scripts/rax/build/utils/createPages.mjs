import { readdir } from "fs/promises";
import handleError from "./handleError.mjs";
import createPagesFolder from "./createPagesFolder.mjs";

export default () =>
  new Promise(async (resolve) => {
    const folders = await readdir("pages");
    Promise.all(
      folders.map((folderName) =>
        createPagesFolder(`../dist/pages/${folderName}`, folderName)
      )
    )
      .then(() => {
        resolve();
      })
      .catch((err) => handleError(err, "创建页面文件夹时出错"));
  });
