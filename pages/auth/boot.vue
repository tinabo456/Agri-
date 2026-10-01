<template>
  <view class="page boot">
    <view class="brand">
      <view class="logo-dot"></view>
      <view class="brand-text">
        <text class="title">农事通·智慧生产</text>
        <text class="sub">AI 农业生产分析</text>
      </view>
    </view>
    <view class="loading text-muted">正在进入…</view>
  </view>
</template>

<script>
import { getCache } from '@/common/cache'
import { setLocationCache, getLocationCache } from '@/utils/storage'
import { setCache } from '@/common/cache'
import { ENV } from '@/config/env'

export default {
  onLoad() {
    // 开发预览：后端未完成时，直接写入假的登录态与定位并进入首页
    if (ENV.MOCK_PREVIEW) {
      setCache('token', 'mock-token', 60 * 24)
      const loc = getLocationCache()
      if (!loc) {
        setLocationCache({
          latitude: 36.553,
          longitude: 116.992,
          address: '长清区',
          province: '山东省',
          city: '济南市',
          district: '长清区',
          township: ''
        })
      }
      return uni.switchTab({ url: '/pages/tabs/home/index' })
    }

    const token = getCache('token')
    if (!token) {
      return uni.reLaunch({ url: '/pages/auth/login' })
    }
    const loc = getLocationCache()
    if (!loc || !loc.latitude || !loc.longitude) {
      return uni.reLaunch({ url: '/pages/auth/location' })
    }
    return uni.switchTab({ url: '/pages/tabs/home/index' })
  }
}
</script>

<style lang="scss">
.boot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80rpx 40rpx;
}
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;
}
.logo-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #0B6D3B 0%, #0F8A4A 100%);
  box-shadow: 0 18rpx 40rpx rgba(11, 109, 59, 0.25);
}
.brand-text {
  margin-left: 18rpx;
  display: flex;
  flex-direction: column;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #101828;
}
.sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #667085;
}
.loading {
  font-size: 26rpx;
}
</style>

