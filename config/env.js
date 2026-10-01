// 运行环境配置（后端若依与第三方服务统一从这里读取）
// 小程序端建议通过“条件编译”区分不同平台/环境

const isDev = process.env.NODE_ENV !== 'production'

export const ENV = {
  isDev,
  // 开发模式：跳过登录/定位，直接进入页面预览（后端未完成时使用）
  MOCK_PREVIEW: isDev,
  // 若依后端基础地址（按你的部署修改）
  // 示例：http://localhost:8080
  BASE_API: isDev ? 'http://localhost:8080' : 'https://api.example.com',

  // 若依默认前缀（RuoYi-Vue 常见为 /prod-api；若你后端没加网关前缀可置空）
  API_PREFIX: isDev ? '/prod-api' : '/prod-api',

  // 腾讯天气（后端建议做转发：避免小程序暴露 key）
  // 这里仍预留直连占位（如你确实要前端直连，请在后端/云函数中代理更安全）
  TENCENT_WEATHER_API_BASE: 'https://wis.qq.com/weather/common',

  // Doubao 模型建议后端转发，这里只放你自己的后端AI路由前缀
  AI_PREFIX: '/ai'
}

export function getApiBase() {
  return `${ENV.BASE_API}${ENV.API_PREFIX}`
}

