import { spawn } from "child_process";
import handleError from "./handleError.mjs";

export default (pageNames) =>
  Promise.all(
    pageNames.map(
      (pageName) =>
        new Promise((resolve) => {
          const ls = spawn(
            process.platform === "win32" ? "pnpm.cmd" : "pnpm",
            ["run", "start"],
            { cwd: `workstation/Rax/pages/${pageName}` }
          );
          ls.stdout.on("data", (data) => {
            console.log(`path: Rax/pages/${pageName}\n ${data}`);
          });
          ls.stderr.on("data", (data) => {
            console.log(`path: Rax/pages/${pageName}\n ${data}`);
          });
          ls.on("error", (err) => {
            handleError(err, `启动失败, path: Rax/pages/${pageName}`);
          });
          ls.on("spawn", () => {
            console.log(`${pageName}启动成功`);
            resolve();
          });
        })
    )
  );
