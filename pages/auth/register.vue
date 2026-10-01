

<template>
  <view class="page register">
    <view class="top">
      <text class="back" @click="goBack">返回</text>
      <text class="title">创建账号</text>
      <text class="ghost"></text>
    </view>

    <view class="card panel">
      <view class="field">
        <text class="label">账号</text>
        <input class="input" v-model.trim="form.username" placeholder="建议使用手机号或易记账号" />
      </view>
      <view class="field">
        <text class="label">密码</text>
        <input class="input" v-model.trim="form.password" password placeholder="至少6位，建议包含字母数字" />
      </view>

      <view class="field">
        <text class="label">手机号</text>
        <input class="input" v-model.trim="form.mobile" placeholder="用于找回与验证码登录" maxlength="11" />
      </view>
      <view class="field code">
        <view class="code-left">
          <text class="label">验证码</text>
          <input class="input" v-model.trim="form.code" placeholder="请输入验证码" maxlength="6" />
        </view>
        <button class="code-btn btn-ghost" :disabled="countdown>0" @click="onSendCode">
          {{ countdown>0 ? countdown + 's' : '获取验证码' }}
        </button>
      </view>

      <button class="btn-primary submit" :disabled="loading" @click="onSubmit">
        {{ loading ? '提交中…' : '注册并登录' }}
      </button>
    </view>
  </view>
</template>

<script>
import { setCache } from '@/common/cache'
import { setUser } from '@/utils/storage'

export default {
  data() {
    return {
      loading: false,
      countdown: 0,
      timer: null,
      form: { username: '', password: '', mobile: '', code: '' }
    }
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async onSendCode() {
      if (!/^1\d{10}$/.test(this.form.mobile)) {
        return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
      }
      try {
        await this.$api.auth.sendSmsCode({ mobile: this.form.mobile, scene: 'register' })
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
		console.log('完整的form对象:', JSON.stringify(this.form))
      if (this.loading) return
      const { username, password, mobile, code } = this.form
      if (!username || !password) return uni.showToast({ title: '请填写账号和密码', icon: 'none' })
      if (!/^1\d{10}$/.test(mobile) || !/^\d{4,6}$/.test(code)) {
        return uni.showToast({ title: '请填写手机号和验证码', icon: 'none' })
      }
      this.loading = true
      try {
        const data = await this.$api.auth.register({ username, password: password || "", mobile, code })
        const token = data?.token || data?.accessToken || data?.access_token || ''
        setCache('token', token, 30)
        setUser(data?.user || null)
        uni.reLaunch({ url: '/pages/auth/location' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">
.register {
  padding: 20rpx 32rpx 40rpx;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}
.back {
  color: #0B6D3B;
  font-size: 26rpx;
  padding: 10rpx 6rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 800;
  color: #101828;
}
.ghost {
  width: 80rpx;
}
.panel {
  padding: 26rpx 24rpx 22rpx;
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
.submit {
  margin-top: 22rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
  font-weight: 800;
  border: none;
}
</style>