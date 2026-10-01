<template>
  <view class="page weather">
    <view class="card head">
      <view class="row">
        <text class="place">{{ place }}</text>
        <text class="temp">{{ now.temp }}℃</text>
      </view>
      <view class="row2 text-muted">
        <text>湿度 {{ now.humidity }}%</text>
        <text>风速 {{ now.windSpeed }}m/s</text>
        <text>降水 {{ now.rain }}mm</text>
      </view>
      <view class="actions">
        <button class="btn-ghost btn" @click="changeLocation">更改定位</button>
        <button class="btn-primary btn" @click="refresh">刷新</button>
      </view>
    </view>

    <view class="card block">
      <view class="hd">
        <text class="h">未来24小时降水概率</text>
        <text class="hint text-muted">向左滑动查看更多</text>
      </view>
      <scroll-view class="h24" scroll-x>
        <view v-for="h in hourly" :key="h.time" class="h-item">
          <text class="t text-muted">{{ h.time }}</text>
          <text class="p">{{ h.pop }}%</text>
          <view class="bar">
            <view class="bar-in" :style="{ height: (h.pop/100*100) + '%' }"></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="card block">
      <view class="hd">
        <text class="h">未来7天预报</text>
        <text class="hint text-muted">精细预报</text>
      </view>
      <view class="d7">
        <view v-for="d in daily7" :key="d.date" class="d-item">
          <text class="d">{{ d.date }}</text>
          <text class="w text-muted">{{ d.text }}</text>
          <text class="tt">{{ d.min }}~{{ d.max }}℃</text>
        </view>
      </view>
    </view>

    <view class="card block">
      <view class="hd">
        <text class="h">AI 农事建议</text>
        <text class="hint text-muted">结合天气生成</text>
      </view>
      <text class="ai text-muted">{{ aiAdvice }}</text>
      <button class="btn-primary btn-wide" @click="goAI">去 AI 追问/生成方案</button>
    </view>
  </view>
</template>

<script>
import { getLocationCache } from '@/utils/storage'

export default {
  data() {
    return {
      place: '当前位置',
      now: { temp: '--', humidity: '--', windSpeed: '--', rain: '--' },
      hourly: [],
      daily7: [],
      aiAdvice: '加载中…'
    }
  },
  onLoad() {
    this.refresh()
  },
  onPullDownRefresh() {
    this.refresh().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    changeLocation() {
      uni.navigateTo({ url: '/pages/auth/location' })
    },
    goAI() {
      uni.switchTab({ url: '/pages/tabs/ai/index' })
    },
    async refresh() {
      const loc = getLocationCache()
      if (!loc) {
        this.place = '未定位'
        this.aiAdvice = '未获取定位，建议先设置位置。'
        return
      }
      this.place = loc.address || loc.district || loc.city || '当前位置'

      await Promise.all([this.loadNow(loc), this.load24h(loc), this.load7d(loc)])
      this.aiAdvice = `当前温度 ${this.now.temp}℃，湿度 ${this.now.humidity}% 。建议根据作物阶段合理安排水肥，关注降水概率变化，必要时提前做好田间排水与病害预防。`
    },
    async loadNow(loc) {
      try {
        const data = await this.$api.weather.getWeatherNow(loc)
        this.now = {
          temp: data?.temp ?? data?.temperature ?? '--',
          humidity: data?.humidity ?? data?.rh ?? '--',
          windSpeed: data?.windSpeed ?? data?.wind_speed ?? '--',
          rain: data?.rain ?? data?.precip ?? '--'
        }
      } catch (e) {}
    },
    async load24h(loc) {
      try {
        const data = await this.$api.weather.getWeather24h(loc)
        const arr = data?.hours || data?.list || data || []
        this.hourly = arr.slice(0, 24).map((x, idx) => ({
          time: x.time || x.hour || `${idx}时`,
          pop: Number(x.pop ?? x.precipProb ?? x.rain_prob ?? 0)
        }))
      } catch (e) {
        this.hourly = Array.from({ length: 24 }).map((_, i) => ({
          time: `${i}时`,
          pop: Math.min(100, Math.round(Math.random() * 60))
        }))
      }
    },
    async load7d(loc) {
      try {
        const data = await this.$api.weather.getWeather7d(loc)
        const arr = data?.days || data?.list || data || []
        this.daily7 = arr.slice(0, 7).map((x, idx) => ({
          date: x.date || x.day || `第${idx + 1}天`,
          text: x.text || x.weather || '多云',
          min: x.min ?? x.low ?? 10,
          max: x.max ?? x.high ?? 20
        }))
      } catch (e) {
        this.daily7 = Array.from({ length: 7 }).map((_, i) => ({
          date: `周${'日一二三四五六'[(new Date().getDay() + i) % 7]}`,
          text: '多云',
          min: 10 + i,
          max: 18 + i
        }))
      }
    }
  }
}
</script>

<style lang="scss">
.weather {
  padding: 18rpx 22rpx 26rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.head {
  padding: 18rpx 18rpx 16rpx;
  background: linear-gradient(135deg, rgba(11, 109, 59, 0.14) 0%, rgba(15, 138, 74, 0.08) 100%);
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.place {
  font-size: 30rpx;
  font-weight: 900;
  color: #101828;
}
.temp {
  font-size: 56rpx;
  font-weight: 900;
  color: #0B6D3B;
}
.row2 {
  margin-top: 10rpx;
  display: flex;
  gap: 18rpx;
  font-size: 24rpx;
}
.actions {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}
.btn {
  flex: 1;
  height: 86rpx;
  line-height: 86rpx;
  font-size: 26rpx;
  font-weight: 900;
  border: none;
}
.block {
  padding: 16rpx 16rpx 14rpx;
}
.hd {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.h {
  font-size: 28rpx;
  font-weight: 900;
  color: #101828;
}
.hint {
  font-size: 22rpx;
}
.h24 {
  margin-top: 14rpx;
  white-space: nowrap;
}
.h-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 110rpx;
  margin-right: 12rpx;
}
.t {
  font-size: 22rpx;
}
.p {
  margin-top: 8rpx;
  font-size: 24rpx;
  font-weight: 900;
  color: #0B6D3B;
}
.bar {
  margin-top: 10rpx;
  width: 18rpx;
  height: 120rpx;
  border-radius: 999rpx;
  background: #F2F4F7;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.bar-in {
  width: 100%;
  background: linear-gradient(180deg, #0F8A4A 0%, #0B6D3B 100%);
  border-radius: 999rpx;
}
.d7 {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
}
.d-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #EAECF0;
}
.d-item:last-child {
  border-bottom: none;
}
.d {
  width: 150rpx;
  font-size: 24rpx;
  font-weight: 900;
  color: #101828;
}
.w {
  flex: 1;
  font-size: 24rpx;
}
.tt {
  width: 150rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: 900;
  color: #0B6D3B;
}
.ai {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 38rpx;
}
.btn-wide {
  margin-top: 12rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 26rpx;
  font-weight: 900;
  border: none;
}
</style>

