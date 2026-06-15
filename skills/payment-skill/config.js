/**
 * payment-skill 配置
 * 用户只需修改本文件即可完成配置，值应与 cloudbaserc.json 保持一致
 * 
 * 使用方式：
 *   const config = require('./config')
 *   // config.functionName - 云函数名称（HTTP 云函数 / SCF Web 函数）
 *   // config.envId - 云开发环境 ID
 * 
 * 注意：cloudbaserc.json 是给云开发 CLI 部署用的，小程序运行时无法 require JSON，
 *       所以此处需要手动填写。修改 cloudbaserc.json 中的 name/envId 后请同步更新本文件。
 */

module.exports = {
  // 云函数名称（须与 cloudbaserc.json 中 functions 里的 name 一致）
  functionName: 'pay-common',

  // 云开发环境 ID（须与 cloudbaserc.json 中的 envId 一致）
  // 留空则由云开发 SDK 自动识别当前环境
  envId: ''
}
