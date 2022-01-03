import { mkdir } from "fs/promises";
import createPageFiles from "./createPageFiles.mjs";

export default async (dirPath, folderName) => {
  await mkdir(dirPath, { recursive: true });
  await createPageFiles(folderName);
};
