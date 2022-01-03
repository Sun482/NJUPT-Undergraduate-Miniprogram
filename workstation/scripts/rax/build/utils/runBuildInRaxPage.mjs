import { spawn } from "child_process";
import { readdir, rename, rm } from "fs/promises";
import handleError from "./handleError.mjs";

const getPages = async () => {
  const pageNames = await readdir("Rax/pages");
  return pageNames;
};

export default () =>
  new Promise(async (resolve) => {
    const pageNames = await getPages();
    Promise.all(
      pageNames.map((pageName) => {
        return new Promise((resolve) => {
          const ls = spawn(
            process.platform === "win32" ? "pnpm.cmd" : "pnpm",
            ["run", "build"],
            { cwd: `Rax/pages/${pageName}` }
          );
          // ls.stdout.on("data", (data) => {
          //   console.log(`${data}`);
          // });
          // ls.stderr.on("data", (data) => {
          //   console.log(`${data}`);
          // });
          ls.on("close", () => {
            rename(
              `Rax/pages/${pageName}/dist/wechat-miniprogram`,
              `../dist/pages/${pageName}/components`
            ).then(() => {
              rm(`Rax/pages/${pageName}/dist`, {
                recursive: true,
                force: true,
              }).then(() => {
                console.log(`${pageName}编译成功`);
                resolve();
              });
            });
          });
          ls.on("error", (err) => {
            handleError(`编译出错, path: Rax/pages/${pageName}\n`, err);
          });
          ls.on("spawn", () => {
            console.log(`${pageName}开始编译`);
          });
        });
      })
    ).then(() => {
      console.log("编译成功");
    });
  });
