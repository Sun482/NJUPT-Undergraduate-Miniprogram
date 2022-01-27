const { readdir, rm, readFile, writeFile, stat } = require("fs/promises");
const { createWriteStream } = require("fs");
const { Duplex } = require("stream");
const CssShortener = require("css-shortener-2");
const CleanCSS = require("clean-css");
const { PurgeCSS } = require("purgecss");

const handleError = (err, message) => {
  console.log(message);
  console.error(err);
  process.exit(1);
};

// 删除无用的wxss
const purgeCSSFn = async (wxssPath, wxmlPath) => {
  try {
    const purgeCSSCleaner = new PurgeCSS();
    const cssData = await purgeCSSCleaner.purge({
      content: [wxmlPath],
      css: [wxssPath]
    });
    return cssData[0].css;
  } catch (error) {
    handleError(error, "删除无用的css时出错");
  }
};

// 压缩wxss，主要是对多属性进行简写，如margin的四个属性同时声明时简写为一个
const mergeCSSProperties = (wxssData) => {
  try {
    const cssCleaner = new CleanCSS({
      level: {
        2: {
          restructureRules: true
        }
      }
    });
    const data = cssCleaner.minify(wxssData).styles;
    return data;
  } catch (error) {
    handleError(error, "压缩wxss时出错");
  }
};

// 压缩wxss中的classname
const shortenCSSClassName = async (wxssData, wxssPath, wxmlPath) => {
  try {
    const cs = new CssShortener();
    const wxssStream = new Duplex();
    wxssStream.push(Buffer.from(wxssData));
    wxssStream.push(null);
    await new Promise((resolve) => {
      wxssStream
        .pipe(cs.cssStream())
        .pipe(createWriteStream(wxssPath))
        .on("finish", () => resolve());
    });
    const wxmlData = await readFile(wxmlPath, "utf-8");
    const wxmlStream = new Duplex();
    wxmlStream.push(Buffer.from(wxmlData));
    wxmlStream.push(null);
    await new Promise((resolve) => {
      wxmlStream
        .pipe(cs.htmlStream())
        .pipe(createWriteStream(wxmlPath))
        .on("finish", () => resolve());
    });
  } catch (error) {
    handleError(error, "压缩wxss和waml中的className时出错");
  }
};

const findWXMLAndWXSSInFolder = async (filePathSet, dirPath) => {
  try {
    const fileList = await readdir(dirPath);
    await Promise.all(
      fileList.map(async (fileName) => {
        if (/\.wxml$/.test(fileName)) {
          const prefix = fileName.replace(".wxml", "");
          // 产物同时有wxml和wxss
          if (fileList.includes(`${prefix}.wxss`)) {
            filePathSet.add(`${dirPath}/${prefix}`);
          }
        } else if (/\.json$/.test(fileName)) {
          const jsonFilePath = `${dirPath}/${fileName}`;
          const JSONStr = await readFile(jsonFilePath, "utf-8");
          writeFile(jsonFilePath, JSON.stringify(JSON.parse(JSONStr)), { flag: "w+" });
        } else {
          const nextDirPath = `${dirPath}/${fileName}`;
          const stats = await stat(nextDirPath);
          if (stats.isDirectory()) {
            await findWXMLAndWXSSInFolder(filePathSet, nextDirPath);
          }
        }
      })
    );
  } catch (error) {
    handleError(error, "收集wxml和wxss文件路径时出错");
  }
};

const compressCSS = async () => {
  const filePathSet = new Set();
  await findWXMLAndWXSSInFolder(filePathSet, "dist/wechat-miniprogram");
  filePathSet.forEach(async (filePrefix) => {
    const wxssPath = `${filePrefix}.wxss`;
    const wxmlPath = `${filePrefix}.wxml`;
    let cssContent = await purgeCSSFn(wxssPath, wxmlPath);
    cssContent = mergeCSSProperties(cssContent);
    shortenCSSClassName(cssContent, wxssPath, wxmlPath);
  });
};

module.exports = ({ onHook }) => {
  rm("es", { recursive: true, force: true }).catch((err) => {
    handleError(err, "es文件夹删除失败");
  });
  rm("lib", { recursive: true, force: true }).catch((err) => {
    handleError(err, "lib文件夹删除失败");
  });
  onHook("after.build.compile", () => {
    compressCSS();
  });
  onHook("before.start.load", () => {
    rm("dist", { recursive: true, force: true }).catch((err) => {
      handleError(err, "dist文件夹删除失败");
    });
  });
};
