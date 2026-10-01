<template>
  <view class="bar">
    <view class="left">
      <text class="app">农事通·智慧生产</text>
      <view class="pill" @click="$emit('click-weather')">
        <text class="loc">{{ placeText }}</text>
        <text class="temp">{{ tempText }}</text>
      </view>
    </view>
    <view class="right">
      <view class="icon-btn" @click="$emit('click-notice')">
        <text class="icon">🔔</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    place: { type: String, default: '' },
    temp: { type: [String, Number], default: '' }
  },
  computed: {
    placeText() {
      return this.place || '未定位'
    },
    tempText() {
      if (this.temp === '' || this.temp === null || typeof this.temp === 'undefined') return ''
      return `${this.temp}℃`
    }
  }
}
</script>

<style lang="scss">
.bar {
  padding: 20rpx 28rpx 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.app {
  font-size: 32rpx;
  font-weight: 900;
  color: #101828;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(11, 109, 59, 0.10);
}
.loc {
  font-size: 24rpx;
  color: #0B6D3B;
  font-weight: 800;
}
.temp {
  font-size: 24rpx;
  color: #101828;
  font-weight: 900;
}
.icon-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: #fff;
  box-shadow: 0 12rpx 30rpx rgba(16, 24, 40, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  font-size: 34rpx;
}
</style>

