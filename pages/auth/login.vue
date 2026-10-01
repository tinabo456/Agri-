<template>
  <view class="page login">
    <view class="hero">
      <text class="h1">欢迎回来</text>
      <text class="h2">登录后获取定位与天气，开启 AI 生产分析</text>
    </view>

    <view class="card panel">
      <view class="tabs">
        <view class="tab" :class="{ on: mode === 'pwd' }" @click="mode = 'pwd'">账号登录</view>
        <view class="tab" :class="{ on: mode === 'sms' }" @click="mode = 'sms'">手机号登录</view>
      </view>

      <view v-if="mode === 'pwd'" class="form">
        <view class="field">
          <text class="label">账号</text>
          <input class="input" v-model.trim="pwd.username" placeholder="请输入账号" />
        </view>
        <view class="field">
          <text class="label">密码</text>
          <input class="input" v-model.trim="pwd.password" password placeholder="请输入密码" />
        </view>
        <view class="field code">
          <view class="code-left">
            <text class="label">验证码</text>
            <input class="input" v-model.trim="pwd.code" placeholder="请输入验证码" maxlength="6" />
          </view>
          <view class="captcha" @click="loadCaptcha">
            <image class="captcha-img" :src="captchaUrl" mode="aspectFit" />
          </view>
        </view>
      </view>

      <view v-else class="form">
        <view class="field">
          <text class="label">手机号</text>
          <input class="input" v-model.trim="sms.mobile" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="field code">
          <view class="code-left">
            <text class="label">验证码</text>
            <input class="input" v-model.trim="sms.code" placeholder="请输入验证码" maxlength="6" />
          </view>
          <button class="code-btn btn-ghost" :disabled="countdown>0" @click="onSendCode">
            {{ countdown>0 ? countdown + 's' : '获取验证码' }}
          </button>
        </view>
      </view>

      <button class="btn-primary submit" @click="onSubmit" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <view class="actions">
        <text class="link" @click="goRegister">注册账号</text>
        <text class="sep">|</text>
        <text class="link muted" @click="fillDemo">一键填充示例</text>
      </view>
    </view>

    <view class="footer text-muted">
      登录即代表你同意《用户协议》和《隐私政策》
    </view>

    <view v-if="mockPreview" class="mock">
      <text class="mock-tip text-muted">后端未完成？可先预览前端页面</text>
      <button class="btn-ghost mock-btn" @click="skipPreview">跳过登录预览</button>
    </view>
  </view>
</template>

<script>
import { setCache } from '@/common/cache'
import { setUser } from '@/utils/storage'
import { ENV } from '@/config/env'

export default {
  data() {
    return {
      mode: 'pwd',
      loading: false,
      countdown: 0,
      timer: null,
      captchaUrl: '',
      pwd: { username: '', password: '', code: '', uuid: '' },
      sms: { mobile: '', code: '' }
    }
  },
  computed: {
    mockPreview() {
      return !!ENV.MOCK_PREVIEW
    }
  },
  mounted() {
    this.loadCaptcha()
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    skipPreview() {
      setCache('token', 'mock-token', 60 * 24)
      uni.switchTab({ url: '/pages/tabs/home/index' })
    },
    async loadCaptcha() {
      try {
        const data = await this.$api.auth.getCaptchaImage()
        // 若依：{ img, uuid }，img 为 base64
        this.captchaUrl = data?.img ? `data:image/gif;base64,${data.img}` : ''
        this.pwd.uuid = data?.uuid || ''
      } catch (e) {
        this.captchaUrl = ''
      }
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/auth/register' })
    },
    fillDemo() {
      if (this.mode === 'pwd') {
        this.pwd.username = 'admin'
        this.pwd.password = 'admin123'
      } else {
        this.sms.mobile = '13800138000'
        this.sms.code = '123456'
      }
    },
    async onSendCode() {
      if (!/^1\d{10}$/.test(this.sms.mobile)) {
        return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
      }
      try {
        await this.$api.auth.sendSmsCode({ mobile: this.sms.mobile, scene: 'login' })
        uni.showToast({ title: '验证码已发送', icon: 'none' })
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown -= 1
          if (this.countdown <= 0) {
            clearInterval(this.timer)
            this.timer = null
            this.countdown = 0
          }
        }, 1000)
      } catch (e) {}
    },
    async onSubmit() {
      if (this.loading) return
      this.loading = true
      try {
        // 这里兼容两种后端返回：
        // 1) 若依 /login 返回 { token: '...' }（实际在 data 内）
        // 2) 你自定义接口返回 { accessToken: '...' }
        let data
        if (this.mode === 'pwd') {
          if (!this.pwd.username || !this.pwd.password) {
            uni.showToast({ title: '请输入账号与密码', icon: 'none' })
            return
          }
          if (!this.pwd.code || !this.pwd.uuid) {
            uni.showToast({ title: '请输入验证码（点击图片可刷新）', icon: 'none' })
            return
          }
          data = await this.$api.auth.loginByPassword(this.pwd)
        } else {
          if (!/^1\d{10}$/.test(this.sms.mobile) || !/^\d{4,6}$/.test(this.sms.code)) {
            uni.showToast({ title: '请填写手机号与验证码', icon: 'none' })
            return
          }
          data = await this.$api.auth.loginBySms(this.sms)
        }

        const token = data?.token || data?.accessToken || data?.access_token || ''
        if (!token) {
          uni.showToast({ title: '登录成功但未返回token', icon: 'none' })
        }
        // 与指导文档一致：token 走带过期时间的缓存（分钟）
        setCache('token', token, 30)
        setUser(data?.user || null)
        uni.reLaunch({ url: '/pages/auth/location' })
      } catch (e) {
        // 登录失败（含验证码错误）：提示并刷新验证码
        uni.showToast({ title: e?.msg || e?.message || '登录失败', icon: 'none' })
        if (this.mode === 'pwd') this.loadCaptcha()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">
.login {
  padding: 56rpx 32rpx 40rpx;
}
.hero {
  margin-top: 40rpx;
  margin-bottom: 28rpx;
}
.h1 {
  font-size: 52rpx;
  font-weight: 800;
  color: #101828;
  letter-spacing: 2rpx;
}
.h2 {
  margin-top: 12rpx;
  display: block;
  font-size: 26rpx;
  color: #667085;
  line-height: 40rpx;
}
.panel {
  padding: 26rpx 24rpx 22rpx;
}
.tabs {
  display: flex;
  background: #F2F4F7;
  padding: 8rpx;
  border-radius: 999rpx;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #667085;
  border-radius: 999rpx;
}
.tab.on {
  background: #fff;
  color: #0B6D3B;
  font-weight: 700;
  box-shadow: 0 8rpx 18rpx rgba(16, 24, 40, 0.08);
}
.form {
  padding-top: 18rpx;
}
.field {
  margin-top: 16rpx;
}
.label {
  display: block;
  font-size: 24rpx;
  color: #667085;
  margin-bottom: 10rpx;
}
.input {
  height: 92rpx;
  padding: 0 22rpx;
  border-radius: 18rpx;
  background: #F9FAFB;
  border: 1rpx solid #EAECF0;
  font-size: 30rpx;
  color: #101828;
}
.code {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
}
.code-left {
  flex: 1;
}
.code-btn {
  height: 92rpx;
  line-height: 92rpx;
  padding: 0 22rpx;
  font-size: 26rpx;
  border: none;
}
.captcha {
  width: 220rpx;
  height: 92rpx;
  border-radius: 18rpx;
  background: #F9FAFB;
  border: 1rpx solid #EAECF0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.captcha-img {
  width: 200rpx;
  height: 76rpx;
}
.submit {
  margin-top: 22rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
  font-weight: 800;
  border: none;
}
.actions {
  margin-top: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18rpx;
  font-size: 24rpx;
}
.link {
  color: #0B6D3B;
}
.sep {
  color: #D0D5DD;
}
.muted {
  color: #667085;
}
.footer {
  margin-top: 22rpx;
  text-align: center;
  font-size: 22rpx;
}
.mock {
  margin-top: 18rpx;
  padding: 0 32rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.mock-tip {
  font-size: 22rpx;
}
.mock-btn {
  width: 320rpx;
  height: 84rpx;
  line-height: 84rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 900;
}
</style>

