import { symlink } from "fs/promises";
import path from "path";

export default async (pageName) => {
  const originPath = path.resolve("node_modules");
  const targetPath = path.resolve(`Rax/pages/${pageName}/node_modules`);
  await symlink(originPath, targetPath, "junction");
};
