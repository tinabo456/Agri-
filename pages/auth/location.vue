<template>
  <view class="page loc">
    <view class="card hero">
      <view class="hero-row">
        <view class="badge">定位</view>
        <text class="hero-title">获取你的地理位置</text>
      </view>
      <text class="hero-sub text-muted">
        用于展示「顶部天气」、圈子分区、AI 本地化种植建议。你也可以手动选择地区，不影响基础功能使用。
      </text>
    </view>

    <view class="card info">
      <view class="info-line">
        <text class="k">当前位置</text>
        <text class="v">{{ locationText || '未获取' }}</text>
      </view>
      <view class="info-line">
        <text class="k">坐标</text>
        <text class="v">{{ coordsText || '—' }}</text>
      </view>
    </view>

    <view class="actions">
      <button class="btn-primary btn" @click="onRequestLocation" :disabled="loading">
        {{ loading ? '获取中…' : '允许并获取定位' }}
      </button>
      <button class="btn-ghost btn" @click="onChooseLocation">手动选择地区</button>
      <button class="btn-ghost btn" @click="goHome">暂不定位，先进入</button>
    </view>

    <view v-if="location && location.latitude" class="card next">
      <view class="next-row">
        <text class="next-title">已获取定位</text>
        <text class="next-sub text-muted">现在去查看天气，并生成 AI 农事建议</text>
      </view>
      <button class="btn-primary btn" @click="goWeather">查看天气</button>
      <button class="btn-ghost btn" @click="goHome">进入首页</button>
    </view>
  </view>
</template>

<script>
import { setLocationCache, getLocationCache } from '@/utils/storage'

export default {
  data() {
    return {
      loading: false,
      location: null
    }
  },
  computed: {
    locationText() {
      const l = this.location
      if (!l) return ''
      return l.address || [l.province, l.city, l.district, l.township].filter(Boolean).join('')
    },
    coordsText() {
      const l = this.location
      if (!l || !l.latitude) return ''
      return `${Number(l.latitude).toFixed(6)}, ${Number(l.longitude).toFixed(6)}`
    }
  },
  onLoad() {
    const cached = getLocationCache()
    if (cached) this.location = cached
  },
  methods: {
    async onRequestLocation() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await new Promise((resolve, reject) => {
          uni.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            highAccuracyExpireTime: 3000,
            success: resolve,
            fail: reject
          })
        })
        const loc = {
          latitude: res.latitude,
          longitude: res.longitude,
          address: '',
          province: '',
          city: '',
          district: '',
          township: ''
        }
        this.location = loc
        setLocationCache(loc)
        // 保存到后端（失败不阻断）
        this.$api.user.saveLocation(loc).catch(() => {})
        uni.showToast({ title: '定位成功', icon: 'none' })
      } catch (e) {
        uni.showToast({ title: '定位失败，可手动选择地区', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async onChooseLocation() {
      try {
        const res = await new Promise((resolve, reject) => {
          uni.chooseLocation({ success: resolve, fail: reject })
        })
        const loc = {
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address || res.name || '',
          province: '',
          city: '',
          district: '',
          township: ''
        }
        this.location = loc
        setLocationCache(loc)
        this.$api.user.saveLocation(loc).catch(() => {})
        uni.showToast({ title: '已更新位置', icon: 'none' })
      } catch (e) {
        // 用户取消不提示
      }
    },
    goWeather() {
      uni.navigateTo({ url: '/pages/weather/index' })
    },
    goHome() {
      uni.switchTab({ url: '/pages/tabs/home/index' })
    }
  }
}
</script>

<style lang="scss">
.loc {
  padding: 28rpx 32rpx 60rpx;
}
.hero {
  padding: 26rpx 22rpx;
}
.hero-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.badge {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(11, 109, 59, 0.12);
  color: #0B6D3B;
  font-size: 22rpx;
  font-weight: 800;
}
.hero-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #101828;
}
.hero-sub {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 40rpx;
}
.info {
  margin-top: 18rpx;
  padding: 18rpx 22rpx;
}
.info-line {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #EAECF0;
}
.info-line:last-child {
  border-bottom: none;
}
.k {
  color: #667085;
  font-size: 24rpx;
}
.v {
  color: #101828;
  font-size: 24rpx;
  max-width: 420rpx;
  text-align: right;
}
.actions {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.btn {
  height: 96rpx;
  line-height: 96rpx;
  font-size: 28rpx;
  font-weight: 800;
  border: none;
}
.next {
  margin-top: 18rpx;
  padding: 18rpx 22rpx 22rpx;
}
.next-row {
  margin-bottom: 14rpx;
}
.next-title {
  font-size: 30rpx;
  font-weight: 900;
}
.next-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
}
</style>

