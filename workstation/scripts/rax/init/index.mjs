import generateRaxComponent from "./utils/generateRaxComponent.mjs";
import generateWechatPage from "./utils/generateWechatPage.mjs";
import linkDependencies from "./utils/linkDependencies.mjs";
import addPagesInAppJSON from "./utils/addPagesInAppJSON.mjs";


console.log("正在创建页面");
const pageName = process.argv[2].slice(1);
addPagesInAppJSON(pageName).then(() => {
  Promise.all([generateRaxComponent(pageName), generateWechatPage(pageName)])
  .then(() => {
    linkDependencies(pageName).then(() => {
      console.log(`${pageName} 创建成功`);
    }).catch(() => {
      console.log("创建失败");
    });
  }).catch(() => {
    console.log("创建失败");
  });
})

