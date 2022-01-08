import { readFile, writeFile } from "fs/promises";
import { createRequire } from "module";
import readFirstLine from "read-first-line";
import chalk from "chalk";

const { log } = console;
const require = createRequire(import.meta.url);

const { version, nextVersion } = require("../../package");

if (version === nextVersion) {
  log(chalk.blue("不需要更新AppLog"));
  process.exit(0);
}

const applogTitle = await readFirstLine("AppLog.md");

const appLogJSON = require("../../AppLog");
const { content: currentAppLogList, title } =
  appLogJSON.data.shift();

let applogStr = applogTitle + `\n\n`
let currentAppLogTitle = `\n## ${title}\n`;
applogStr += currentAppLogTitle
currentAppLogList.forEach((content) => {
  applogStr += `* ${content}\n`;
});

const beforeChangeLog = (await readFile("AppLog.md", {
  encoding: "utf-8",
})).split(applogTitle)[1];

applogStr += `\n\n` + beforeChangeLog;

await writeFile(
  "AppLog.md",
  applogStr,
  { flag: "w+" }
);
log(chalk.blue("App日志写入成功"));
