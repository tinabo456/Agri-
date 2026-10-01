<template>
  <view class="page me">
    <view class="card head">
      <view class="avatar"></view>
      <view class="info">
        <text class="name">{{ userName }}</text>
        <text class="sub text-muted">账号信息/资料完善（若依 profile）</text>
      </view>
    </view>

    <view class="card menu">
      <view class="row" @click="goLocation">
        <text class="k">更改定位</text>
        <text class="v text-muted">{{ locText }}</text>
      </view>
      <view class="row" @click="goWeather">
        <text class="k">查看天气</text>
        <text class="v text-muted">实时/预警/趋势</text>
      </view>
      <view class="row" @click="goHistory">
        <text class="k">AI 历史记录</text>
        <text class="v text-muted">诊断/方案/问答</text>
      </view>
    </view>

    <button class="btn-primary logout" @click="onLogout">退出登录</button>
  </view>
</template>

<script>
import { getUser, clearToken, clearUser, getLocationCache } from '@/utils/storage'

export default {
  data() {
    return { user: null, loc: null }
  },
  onShow() {
    this.user = getUser()
    this.loc = getLocationCache()
  },
  computed: {
    userName() {
      return this.user?.userName || this.user?.username || '农户用户'
    },
    locText() {
      return this.loc?.address || this.loc?.district || this.loc?.city || '未设置'
    }
  },
  methods: {
    goLocation() {
      uni.navigateTo({ url: '/pages/auth/location' })
    },
    goWeather() {
      uni.navigateTo({ url: '/pages/weather/index' })
    },
    goHistory() {
      uni.switchTab({ url: '/pages/tabs/ai/index' })
    },
    async onLogout() {
      try {
        await this.$api.auth.logout()
      } catch (e) {}
      clearToken()
      clearUser()
      uni.removeStorageSync('token')
      uni.reLaunch({ url: '/pages/auth/login' })
    }
  }
}
</script>

<style lang="scss">
.me {
  padding: 22rpx 22rpx 40rpx;
}
.head {
  padding: 22rpx 18rpx;
  display: flex;
  gap: 16rpx;
  align-items: center;
}
.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(11, 109, 59, 0.20) 0%, rgba(15, 138, 74, 0.10) 100%);
}
.info {
  display: flex;
  flex-direction: column;
}
.name {
  font-size: 32rpx;
  font-weight: 900;
  color: #101828;
}
.sub {
  margin-top: 8rpx;
  font-size: 24rpx;
}
.menu {
  margin-top: 16rpx;
  padding: 8rpx 18rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #EAECF0;
}
.row:last-child {
  border-bottom: none;
}
.k {
  font-size: 26rpx;
  font-weight: 800;
  color: #101828;
}
.v {
  font-size: 24rpx;
  max-width: 380rpx;
  text-align: right;
}
.logout {
  margin-top: 18rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 28rpx;
  font-weight: 900;
  border: none;
}
</style>

