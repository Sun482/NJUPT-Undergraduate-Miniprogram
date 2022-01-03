import { readFile } from "fs/promises";

export default async (fileName, pageName) => {
  const templatePath = `scripts/rax/init/template/${fileName}.txt`;
  const content = await readFile(templatePath, "utf-8");
  return content.replaceAll("${pageName}", pageName);
};
