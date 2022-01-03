import { readFile, writeFile } from "fs/promises";

export default (pageName) =>
  new Promise(async (resolve) => {
    const appJSONStr = await readFile('app.json', 'utf-8')
    const appJSONObj = JSON.parse(appJSONStr)
    const pagesList = appJSONObj.pages
    const newPage = `pages/${pageName}/${pageName}`
    if(!pagesList.includes(newPage)) {
      appJSONObj.pages.push(newPage);
      writeFile("app.json", JSON.stringify(appJSONObj, null, 2), {
        flag: "w+",
      }).then(() => resolve());
    } else {
      resolve()
    }
  });
