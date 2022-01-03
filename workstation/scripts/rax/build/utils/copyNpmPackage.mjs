import copydir from "node-copydir";

export default () => new Promise(async (resolve) => {
  copydir('miniprogram_npm', '../dist/miniprogram_npm').then(() => {
    resolve()
  }).catch((err) => {
    console.log("拷贝miniprogram_npm错误");
    console.log(err);
  })
})