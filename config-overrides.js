//根目录下的该文件（config-override.js）用于修改create-react-app的默认配置；可以进行webpack的各种骚操作
const { override, fixBabelImports, addBabelPlugins } = require("customize-cra");

//override: 覆盖create-react-app中的默认配置
module.exports = override(
  fixBabelImports("import", { //让webpack实现按需加载js和css代码
    libraryName: "antd-mobile", //按需加载antd-mobile中的组件代码
    style: "css"
  }),
  addBabelPlugins([
    "@babel/plugin-proposal-decorators", //让babel支持装饰器语法
    {
      legacy: true //默认选项
    }
  ])
);

//[疑问]支持装饰器：下面这样不行么？
//
//const { override, addDecoratorsLegacy } = require("customize-cra");
//module.exports = override(
//    addDecoratorsLegacy()
//);