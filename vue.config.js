const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap:false,
  outputDir:'dist',
  assetsDir:'assets',
  // 插件plugins以及rules的配置

})
