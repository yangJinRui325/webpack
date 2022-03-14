import axios from 'axios'
import Vue from 'vue'

const vm = new Vue()
// 创建axios实例
const service = axios.create(
  {
    timeout: 6000,
    withCredentials: true
  }
)

// request拦截器
service.interceptors.request.use(
  config => {
    // 获取本地 配置文件特殊处理
    if (config.url.indexOf('serverConfig.json') > -1) {
      config = {
        ...config,
        baseURL: ''
      }
    } else {
      config = {
        ...config,
        baseURL: vm.$configApiUrl.SERVER_URL
      }
    }

    // token校验携带头部
    const token = getToken()
    if (token) {
      config.headers.Authorization = token // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const reLoginCode = [1101] // 需要重登的 code
// response 拦截器
service.interceptors.response.use(
  response => {
    // 如果请求的是blob数据 直接返回整个response
    if ((response?.request?.responseType ?? null) === 'blob') {
      return Promise.resolve(response)
    }

    const res = response.data
    const { code } = res

    if (response.config.url.indexOf('serverConfig.json') > -1) {
      return Promise.resolve(res)
    }

    if (response.status === 200) {
      const token = response.headers.token

      if (token) {
        setToken(token)
      }

      // 是否需要重新登录
      if (reLoginCode.includes(code)) {
        return reLogin()
      }

      // 账号密码错误
      if (code === 460) {
        return failResponse({ message: '账号或密码错误' })
      }

      // 密码校验失败
      if (code === 1000) {
        return Promise.reject(res)
      }

      // 正常返回
      if (code === 0 || res.token) {
        return Promise.resolve(res)
      }

      return failResponse(res)
    } else {
      return failResponse(res)
    }
  },
  error => {
    if (error.response) {
      // 处理登录返回
      failResponse({ message: '服务器异常' })

      return Promise.reject(error.response)
    } else {
      return Promise.reject(error)
    }
  }
)

const failResponse = (data) => {
  // message.error(data.message || '服务器异常', 2)
  return Promise.reject(data)
}

export default service
