import { createRequire } from "module";
import { writeFile } from "fs/promises";
import chalk from "chalk";

const { log } = console;
const require = createRequire(import.meta.url);
const packageJSON = require("../../package");

const { version, nextVersion } = packageJSON;

if (version === nextVersion) {
  log(chalk.blue("不需要更新package.json"));
  process.exit(0);
}

packageJSON.version = nextVersion;

await writeFile("package.json", JSON.stringify(packageJSON, null, 2), {
  flag: "w+"
});

log(chalk.blue("package.json更新成功"));
