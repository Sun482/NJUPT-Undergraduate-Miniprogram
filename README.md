# 南京邮电大学本科生小程序4.0

### 依赖安装

> node >= 16 (低于16版本会有不可预知问题，运行项目前应先升级node版本)
> yarn >= 1 <2 (本项目依赖安装暂时仅支持yarn, 使用其他包管理器安装会导致不可预知错误, 注意不要使用yarn2)

```bash
$ yarn
```

### 创建页面

```bash
$ yarn init
```

### 删除页面

```bash
$ yarn delete
```

### 实时预览

```bash
$ yarn start
```

### 项目打包

```bash
$ yarn build
```

### 代码提交
commmit：原始的```git commit```命令在当前仓库会被拦截，应使用```yarn commit```命令进行提交。
好处：
- 不用再敲一次```git add .```, ```yarn commit```会自动执行```git add .```
- 提交说明可以规范化，便于生成日志

push：原始的```git push ```命令在当前仓库代码提交时也会被拦截，应使用```yarn push```进行提交
好处：
- 可以在push的同时完成小程序发版日志填写等发版工作, 如选择不发版只会直接提交

tips：
- 代码版本和小程序版本一致，只有小程序发版时才选择更新代码版本。
- 选择更新版本切代码已push到远程仓库，在代码提交后尚未合进master分支前，发版操作都未进行，此时如果有补充提交只需要在此执行```yarn commit```,```yarn push```，并且push时候选择不更新版本即可。
- 不建议研究如何绕过以上限制进行代码提交，翻车后果自负（手动狗头）



### 分包独立依赖
对于仅有单个页面或分包用到的依赖，且依赖体积较大，可以考虑使用依赖分包功能，即把该依赖项单独打包进某个分包，以此减少主包的体积。

示例：
在根路径下的dependenciesMap.json文件中编辑
```
{
  "subpackage-1": {
    "dayjs": "^1.10.7"
  }
}
```
则dayjs依赖只会打包进subpackage-1分包

### 分包预加载
[微信小程序分包预加载说明](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/preload.html)

与原生小程序配置方法不同，在本项目中使用分包预加载示例如下：
在根路径下的preloadRules.json中编辑
```
{
  "firstPage": {
    "network": "all",
    "packages": ["subpackage-1"]
  }
}
```
则效果为在进入页面"firstPage"时加载"subpackage-1"分包。注意value只需要填写当前存在的页面名称，如firstPage， 不需要填写具体路径;network字段和packages字段意义参考微信小程序文档, packages对应数组中每一项只能写入当前存在的分包名称。

### 代码更新日志

[CHANGELOG](./CHANGELOG.md)

### APP更新日志

[APPLOG](./AppLog.md)
