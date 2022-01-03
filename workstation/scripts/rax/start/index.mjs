import { readdir } from "fs/promises";
import runStartInRaxPage from "./utils/runStartInRaxPage.mjs";

console.log("正在启动");
if (process.argv[2] !== undefined) {
  const pageNames = process.argv[2].slice(1).split(",");
  runStartInRaxPage(pageNames).then(() => {
    console.log("启动完成");
  });
} else {
  readdir("pages").then((pageNames) => {
    runStartInRaxPage(pageNames).then(() => {
      console.log("启动完成");
    });
  });
}
