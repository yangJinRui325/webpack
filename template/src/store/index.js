import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'// 引入持久化插件

const path = require('path')
const files = require.context('./modules', false, /\.js$/)
const modules = {}
files.keys().forEach(key => {
  const name = path.basename(key, '.js')
  modules[name] = files(key).default || files(key)
})

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState({
    /* sessionStorage or localStorage可配置 */
    storage: window.localStorage,
    reducer (stores) {
      return {
        // 账号信息相关信息存储，与实际业务挂钩的不需要缓存的不写入这里
        // account: stores.account,
        // common: stores.common,
        // permission: stores.permission
      }
    }
  })],
  modules: modules
})

export default store
