import { readFile, writeFile } from "fs/promises";
import { createRequire } from "module";
import readFirstLine from "read-first-line";
import parseGitCommit from "parse-git-commit";
import chalk from "chalk";
import { exec } from "child_process";
import dayjs from "dayjs";

const { log } = console;
const require = createRequire(import.meta.url);

const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const { version, nextVersion } = require("../../package");

if (version === nextVersion) {
  log(chalk.blue("不需要更新changelog"));
  process.exit(0);
}

const handleErr = (err, message) => {
  if (message !== "") {
    log(chalk.red(message));
  }
  log(err);
  process.exit(1);
};

const handleResolve = (stdout, message, resolve, content = "") => {
  log(chalk.blue(message));
  log(stdout);
  resolve(content);
};

const gitTag = () =>
  new Promise((resolve) => {
    exec(`git tag ${nextVersion}`, (err, stdout) => {
      if (err) {
        handleErr(err, "git tag发生错误");
      } else {
        handleResolve(stdout, "git tag执行成功", resolve);
      }
    });
  });

const splitSymbol = `?${Math.random()}?`;
const getGitLogList = () =>
  new Promise((resolve) => {
    exec(
      `git log ${version}..${nextVersion} --pretty=format:"%an${splitSymbol}%ae${splitSymbol}%ad${splitSymbol}%s${splitSymbol}%H${splitSymbol}%h" --date=short`,
      (err, stdout) => {
        if (err) {
          handleErr(err, "git log发生错误");
        } else {
          handleResolve(stdout, "git log执行成功", resolve, stdout.split("\n"));
        }
      }
    );
  });

const logCollection = {
  featContentList: [],
  fixContentList: [],
  perfContentList: [],
  othersContentList: [],
};

await gitTag();
const gitlogList = await getGitLogList();

gitlogList.forEach((logContent) => {
  try {
    const [author, email, date, description, hash, shortHash] =
      logContent.split(splitSymbol);
    const { type, scope, subject } = parseGitCommit(description);
    switch (type) {
      case "feat":
      case "fix":
        logCollection[`${type}ContentList`].push({
          author,
          email,
          date,
          scope,
          subject,
          hash,
          shortHash,
        });
        break;
      case "refactor":
      case "perf":
      case "docs":
      case "style":
      case "test":
      case "ci":
      case "chore":
        logCollection.perfContentList.push({
          author,
          email,
          date,
          scope,
          subject,
          hash,
          shortHash,
        });
        break;
      case "misc":
        logCollection.othersContentList.push({
          author,
          email,
          date,
          scope,
          subject,
          hash,
          shortHash,
        });
        break;
    }
  } catch (error) {}
});

const time = dayjs.tz(dayjs(), "Asia/Shanghai").format("YYYY-MM-DD");
const currentVersionTitle = `\n## [${nextVersion}](https://github.com/Awen-hub/git-test/compare/${version}...${nextVersion}) (${time})\n`;
const changelogTitle = await readFirstLine("CHANGELOG.md");

const { featContentList, fixContentList, perfContentList, othersContentList } =
  logCollection;
let changeLogStr = `${changelogTitle}\n\n${currentVersionTitle}\n`;

const addChangeLogItem = (content) => {
  const { author, date, scope, subject, hash, shortHash } = content;
  const frontContent = scope ? `* **${scope}:** ` : "*  ";
  changeLogStr += `${frontContent}${subject}  @[${author}](https://github.com/${author}), ${date} ([${shortHash}](https://github.com/Awen-hub/git-test/commit/${hash}))\n`;
};

const generateChangeLogWithLogList = (contentList, title) => {
  if (contentList.length !== 0) {
    changeLogStr += title;
    contentList.forEach(addChangeLogItem);
  }
};

generateChangeLogWithLogList(featContentList, `\n### Features\n`);
generateChangeLogWithLogList(fixContentList, `\n### Bug Fixes\n`);
generateChangeLogWithLogList(perfContentList, `\n### Perf\n`);
generateChangeLogWithLogList(othersContentList, `\n### Others\n`);

const beforeChangeLog = (
  await readFile("CHANGELOG.md", {
    encoding: "utf-8",
  })
).split(changelogTitle)[1];

changeLogStr += `\n\n` + beforeChangeLog;
await writeFile("CHANGELOG.md", changeLogStr, { flag: "w+" });
log(chalk.blue("git日志写入成功"));
