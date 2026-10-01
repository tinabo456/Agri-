import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import * as storage from '@/utils/storage'
import * as authApi from '@/api/auth'
import * as userApi from '@/api/user'
import * as weatherApi from '@/api/weather'
import * as cropApi from '@/api/crop'
import * as aiApi from '@/api/ai'
import * as circleApi from '@/api/circle'
import * as mallApi from '@/api/mall'
Vue.config.productionTip = false
App.mpType = 'app'

Vue.prototype.$storage = storage
Vue.prototype.$api = {
  auth: authApi,
  user: userApi,
  weather: weatherApi,
  crop: cropApi,
  ai: aiApi,
  circle: circleApi,
  mall: mallApi
}

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif