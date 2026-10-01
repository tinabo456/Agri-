<template>
  <view class="page home">
    <TopWeatherBar :place="place" :temp="temp" @click-weather="goWeather" @click-notice="onNotice" />

    <view class="banner-wrap">
      <swiper class="banner" circular autoplay interval="4200" duration="450" easing-function="easeInOutCubic" @change="onBannerChange">
        <swiper-item v-for="b in banners" :key="b.id">
          <view class="card banner-card" :class="b.theme" @click="onBanner(b)">
            <view class="b-left">
              <text class="b-kicker">{{ b.kicker }}</text>
              <text class="b-title">{{ b.title }}</text>
              <text class="b-sub">{{ b.sub }}</text>
              <view class="b-cta">{{ b.cta }}</view>
            </view>
            <view class="b-right">
              <view class="b-icon">{{ b.icon }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view class="dots">
        <view v-for="(b, i) in banners" :key="b.id" class="dot" :class="{ on: i === bannerIndex }"></view>
      </view>
    </view>

    <view class="hero card">
      <view class="hero-top">
        <view class="hero-left">
          <text class="hero-title">AI 农业生产大屏</text>
          <text class="hero-sub text-muted">结合定位与天气，生成可执行的水肥/病虫害/种植计划</text>
        </view>
        <view class="hero-right">
          <view class="badge" :class="alertLevelClass">{{ alertText }}</view>
          <text class="mini text-muted">{{ dateText }}</text>
        </view>
      </view>
      <view class="hero-stats">
        <view class="stat">
          <text class="k text-muted">当前位置</text>
          <text class="v">{{ place || '未定位' }}</text>
        </view>
        <view class="stat">
          <text class="k text-muted">当前温度</text>
          <text class="v green">{{ tempText }}</text>
        </view>
        <view class="stat">
          <text class="k text-muted">降水概率</text>
          <text class="v">{{ popText }}</text>
        </view>
      </view>
      <view class="hero-actions">
        <button class="btn-primary btn" @click="goAI">立即诊断</button>
        <button class="btn-ghost btn" @click="goCrops">上传作物</button>
      </view>
    </view>

    <view class="quick card">
      <view class="quick-item" @click="goCrops">
        <text class="qi">📷</text>
        <text class="qt">上传影像</text>
      </view>
      <view class="quick-item" @click="goAI">
        <text class="qi">🤖</text>
        <text class="qt">AI 诊断</text>
      </view>
      <view class="quick-item" @click="goCircle">
        <text class="qi">🌾</text>
        <text class="qt">本地圈子</text>
      </view>
      <view class="quick-item" @click="goMall">
        <text class="qi">🛒</text>
        <text class="qt">补贴农资</text>
      </view>
    </view>

    <view class="grid">
      <view class="card entry ai" @click="goAI">
        <text class="t1">AI 农事助理</text>
        <text class="t2">诊断 · 计划 · 预警</text>
        <text class="tag">图文/语音问答</text>
      </view>
      <view class="card entry mall" @click="goMall">
        <text class="t1">惠农商城</text>
        <text class="t2">种子 · 肥料 · 农资</text>
        <text class="tag">销量/人气排序</text>
      </view>
      <view class="card entry circle" @click="goCircle">
        <text class="t1">本地圈子</text>
        <text class="t2">看同乡种植动态</text>
        <text class="tag">点赞 · 评论</text>
      </view>
      <view class="card entry weather" @click="goWeather">
        <text class="t1">天气与预警</text>
        <text class="t2">24小时降水概率</text>
        <text class="tag">一键刷新</text>
      </view>
    </view>

    <view class="card report">
      <view class="section-hd">
        <text class="h">本月 AI 生产报告</text>
        <text class="more" @click="goCrops">去我的作物</text>
      </view>
      <view class="report-body">
        <view class="r-left">
          <text class="r-title">{{ monthTitle }}</text>
          <text class="r-text text-muted">{{ monthSummary }}</text>
          <view class="r-tags">
            <view class="rt">水肥</view>
            <view class="rt">病虫害</view>
            <view class="rt">预警</view>
            <view class="rt">推荐</view>
          </view>
        </view>
        <view class="r-right">
          <image class="r-img" src="/static/logo.png" mode="aspectFill" />
          <view class="r-overlay">
            <text class="r-ov">田间影像</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card section">
      <view class="section-hd">
        <text class="h">今日农事建议</text>
        <text class="more" @click="togglePlan">{{ planOpen ? '收起' : '展开' }}</text>
      </view>
      <view class="hint text-muted">勾选你今天准备做的事，AI 会据此生成更贴合的执行方案。</view>

      <view class="plan">
        <view v-for="item in planItems" :key="item.id" class="plan-item" @click="toggleDone(item.id)">
          <view class="ck" :class="{ on: item.done }"></view>
          <view class="pi-main">
            <text class="pi-title">{{ item.title }}</text>
            <text class="pi-sub text-muted">{{ item.sub }}</text>
          </view>
          <text class="pi-tag" :class="{ on: item.done }">{{ item.done ? '已完成' : '待执行' }}</text>
        </view>

        <view v-show="planOpen" class="plan-detail">
          <view class="pd-row">
            <text class="pd-k text-muted">建议优先级</text>
            <text class="pd-v">{{ planPriority }}</text>
          </view>
          <view class="pd-row">
            <text class="pd-k text-muted">风险提示</text>
            <text class="pd-v warn">{{ planRisk }}</text>
          </view>
          <view class="pd-row">
            <text class="pd-k text-muted">一句话建议</text>
            <text class="pd-v">{{ planOneLine }}</text>
          </view>

          <view class="pd-actions">
            <button class="btn-primary btn" @click="goAI">一键生成AI方案</button>
            <button class="btn-ghost btn" @click="goWeather">查看天气详情</button>
          </view>
        </view>
      </view>
    </view>

    <view class="card duo">
      <view class="duo-left">
        <view class="section-hd">
          <text class="h">本地圈子热帖</text>
          <text class="more" @click="goCircle">更多</text>
        </view>
        <view v-for="p in circlePreview" :key="p.id" class="mini-post" @click="goCircle">
          <text class="mp-title">{{ p.title }}</text>
          <view class="mp-meta text-muted">
            <text>{{ p.user }}</text>
            <text>·</text>
            <text>👍 {{ p.likes }}</text>
          </view>
        </view>
      </view>
      <view class="duo-right">
        <view class="section-hd">
          <text class="h">精选农资</text>
          <text class="more" @click="goMall">去商城</text>
        </view>
        <view v-for="g in goodsPreview" :key="g.id" class="mini-good" @click="goMall">
          <image class="mg-pic" :src="g.pic" mode="aspectFill" />
          <view class="mg-meta">
            <text class="mg-name">{{ g.name }}</text>
            <text class="mg-price">￥{{ g.price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TopWeatherBar from '@/components/TopWeatherBar.vue'
import { getLocationCache } from '@/utils/storage'

export default {
  components: { TopWeatherBar },
  data() {
    return {
      place: '',
      temp: '',
      pop: 0,
      alertLevel: 'low',
      banners: [
        {
          id: 1,
          theme: 't-green',
          kicker: '农业气象预警',
          title: '未来24小时降水概率',
          sub: '提前安排排水与病害预防',
          cta: '去看天气 →',
          icon: '⛅',
          action: 'weather'
        },
        {
          id: 2,
          theme: 't-orange',
          kicker: '惠农补贴专区',
          title: '补贴农资 · 即买即补',
          sub: '肥料/种子/农资一站购齐',
          cta: '去逛商城 →',
          icon: '🎁',
          action: 'mall'
        },
        {
          id: 3,
          theme: 't-purple',
          kicker: 'AI 生产分析',
          title: '上传图片立即诊断',
          sub: '病虫害/缺素/长势异常',
          cta: '去AI诊断 →',
          icon: '🔬',
          action: 'ai'
        }
      ],
      bannerIndex: 0,
      planOpen: true,
      planItems: [
        { id: 'irrigation', title: '浇灌/排水检查', sub: '根据降水概率调整灌溉量', done: false },
        { id: 'fertilize', title: '分次追肥', sub: '控旺促壮，避免一次性过量', done: false },
        { id: 'pest', title: '病虫害巡田', sub: '重点关注蚜虫、锈病与叶面斑点', done: false }
      ],
      circlePreview: [
        { id: 1, title: '本周降雨增多，如何预防锈病？', user: '长清区·王师傅', likes: 18 },
        { id: 2, title: '追肥时机怎么选？分享我的做法', user: '长清区·李大姐', likes: 12 },
        { id: 3, title: '蚜虫低风险，但要提前做哪些准备？', user: '同乡农友', likes: 9 }
      ],
      goodsPreview: [
        { id: 1, name: '高效复合肥 40kg', price: '168.00', pic: '/static/logo.png' },
        { id: 2, name: '抗病小麦种子 10kg', price: '98.00', pic: '/static/logo.png' }
      ]
    }
  },
  computed: {
    dateText() {
      const d = new Date()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${m}-${day}`
    },
    tempText() {
      if (this.temp === '' || this.temp === null || typeof this.temp === 'undefined') return '--℃'
      return `${this.temp}℃`
    },
    popText() {
      return `${Math.round(this.pop || 0)}%`
    },
    alertText() {
      if (this.alertLevel === 'high') return '农业预警：高'
      if (this.alertLevel === 'mid') return '农业预警：中'
      return '农业预警：低'
    },
    alertLevelClass() {
      return `lv-${this.alertLevel}`
    },
    planPriority() {
      const done = this.planItems.filter((x) => x.done).length
      if (done === 0) return '先巡田 → 再水肥 → 最后复盘'
      if (done === 1) return '继续推进剩余两项'
      if (done === 2) return '收尾：检查细节并记录'
      return '已完成，建议上传影像交给AI复核'
    },
    planRisk() {
      if (this.pop >= 60) return '降雨概率偏高，注意排水与病害'
      if (this.pop >= 30) return '关注天气变化，适度调整水肥'
      return '天气较稳，按计划执行即可'
    },
    planOneLine() {
      return '今天以“巡田+控旺促壮”为主，见雨前先排水、雨后及时防病。'
    },
    monthTitle() {
      const m = new Date().getMonth() + 1
      return `${m}月生长阶段：旺盛生长期`
    },
    monthSummary() {
      return '建议分次追肥、合理控旺；关注未来24小时降水概率波动，提前做好排水与病害预防。'
    }
  },
  onShow() {
    this.loadWeather()
  },
  methods: {
    onBannerChange(e) {
      this.bannerIndex = e?.detail?.current || 0
    },
    onBanner(b) {
      if (b.action === 'weather') return this.goWeather()
      if (b.action === 'mall') return this.goMall()
      if (b.action === 'ai') return this.goAI()
      return uni.showToast({ title: '活动待接入', icon: 'none' })
    },
    togglePlan() {
      this.planOpen = !this.planOpen
    },
    toggleDone(id) {
      const idx = this.planItems.findIndex((x) => x.id === id)
      if (idx >= 0) this.planItems[idx].done = !this.planItems[idx].done
    },
    async loadWeather() {
      const loc = getLocationCache()
      if (!loc) {
        this.place = '未定位'
        this.temp = ''
        this.pop = 0
        this.alertLevel = 'low'
        return
      }
      this.place = loc.address || loc.district || loc.city || '当前位置'
      try {
        const now = await this.$api.weather.getWeatherNow({
          latitude: loc.latitude,
          longitude: loc.longitude
        })
        // 兼容不同后端字段命名
        this.temp = now?.temp || now?.temperature || now?.data?.temp || ''
        // 预览：后端未接入时给一个更真实的展示
        this.pop = Number(now?.pop || now?.precipProb || 25) || 25
        this.alertLevel = this.pop >= 60 ? 'mid' : 'low'
      } catch (e) {
        this.temp = ''
        this.pop = 25
        this.alertLevel = 'low'
      }
    },
    goAI() {
      uni.switchTab({ url: '/pages/tabs/ai/index' })
    },
    goCrops() {
      uni.switchTab({ url: '/pages/tabs/crops/index' })
    },
    goMall() {
      uni.switchTab({ url: '/pages/tabs/mall/index' })
    },
    goCircle() {
      uni.navigateTo({ url: '/pages/circle/index' })
    },
    goWeather() {
      uni.navigateTo({ url: '/pages/weather/index' })
    },
    onNotice() {
      uni.showToast({ title: '消息中心待接入', icon: 'none' })
    }
  }
}
</script>

<style lang="scss">
.home {
  padding-bottom: 32rpx;
}
.banner-wrap {
  margin: 6rpx 28rpx 10rpx;
}
.banner {
  height: 200rpx;
}
.banner-card {
  height: 200rpx;
  padding: 16rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  border: 1rpx solid rgba(16, 24, 40, 0.06);
}
.banner-card.t-green {
  background: radial-gradient(120% 120% at 0% 0%, rgba(15, 138, 74, 0.22) 0%, rgba(11, 109, 59, 0.12) 40%, #FFFFFF 100%);
}
.banner-card.t-orange {
  background: radial-gradient(120% 120% at 0% 0%, rgba(245, 158, 11, 0.20) 0%, rgba(217, 45, 32, 0.08) 40%, #FFFFFF 100%);
}
.banner-card.t-purple {
  background: radial-gradient(120% 120% at 0% 0%, rgba(88, 86, 214, 0.18) 0%, rgba(0, 122, 255, 0.08) 45%, #FFFFFF 100%);
}
.b-left {
  display: flex;
  flex-direction: column;
}
.b-kicker {
  font-size: 22rpx;
  color: #0B6D3B;
  font-weight: 900;
}
.banner-card.t-orange .b-kicker {
  color: #B54708;
}
.banner-card.t-purple .b-kicker {
  color: #3634A3;
}
.b-title {
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 900;
  color: #101828;
}
.b-sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #667085;
}
.b-cta {
  margin-top: 10rpx;
  display: inline-flex;
  width: fit-content;
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(16, 24, 40, 0.10);
  color: rgba(16, 24, 40, 0.90);
  font-size: 22rpx;
  font-weight: 900;
}
.b-right {
  width: 140rpx;
  height: 140rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.65);
  border: 1rpx solid rgba(16, 24, 40, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.b-icon {
  font-size: 54rpx;
}
.dots {
  margin-top: 10rpx;
  display: flex;
  justify-content: center;
  gap: 10rpx;
}
.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: rgba(16, 24, 40, 0.16);
}
.dot.on {
  width: 26rpx;
  background: rgba(11, 109, 59, 0.70);
}
.hero {
  margin: 10rpx 28rpx 14rpx;
  padding: 18rpx 18rpx 16rpx;
  background: radial-gradient(120% 120% at 10% 0%, rgba(15, 138, 74, 0.18) 0%, rgba(11, 109, 59, 0.10) 45%, #FFFFFF 100%);
  border: 1rpx solid rgba(11, 109, 59, 0.10);
}
.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.hero-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #101828;
}
.hero-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 36rpx;
}
.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
}
.badge {
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 900;
}
.badge.lv-low {
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
}
.badge.lv-mid {
  background: rgba(245, 158, 11, 0.14);
  color: #B54708;
}
.badge.lv-high {
  background: rgba(217, 45, 32, 0.14);
  color: #B42318;
}
.mini {
  font-size: 22rpx;
}
.hero-stats {
  margin-top: 14rpx;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12rpx;
}
.stat {
  padding: 12rpx 12rpx;
  border-radius: 16rpx;
  background: rgba(249, 250, 251, 0.85);
  border: 1rpx solid #EAECF0;
}
.k {
  font-size: 22rpx;
}
.v {
  margin-top: 8rpx;
  display: block;
  font-size: 26rpx;
  font-weight: 900;
  color: #101828;
}
.v.green {
  color: #0B6D3B;
}
.hero-actions {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}
.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 26rpx;
  font-weight: 900;
  border: none;
}
.quick {
  margin: 0 28rpx 14rpx;
  padding: 14rpx 10rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6rpx;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  border-radius: 16rpx;
  background: rgba(242, 244, 247, 0.75);
}
.qi {
  font-size: 34rpx;
}
.qt {
  margin-top: 6rpx;
  font-size: 22rpx;
  font-weight: 900;
  color: #344054;
}
.grid {
  padding: 0 28rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 18rpx;
}
.entry {
  padding: 22rpx 18rpx;
  min-height: 170rpx;
  position: relative;
  overflow: hidden;
}
.t1 {
  font-size: 30rpx;
  font-weight: 900;
  color: #101828;
}
.t2 {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #667085;
}
.tag {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.92);
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(16, 24, 40, 0.25);
}
.entry.ai {
  background: linear-gradient(135deg, rgba(11, 109, 59, 0.14) 0%, rgba(15, 138, 74, 0.10) 100%);
}
.entry.mall {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.14) 0%, rgba(255, 59, 48, 0.08) 100%);
}
.entry.circle {
  background: linear-gradient(135deg, rgba(88, 86, 214, 0.14) 0%, rgba(0, 122, 255, 0.08) 100%);
}
.entry.weather {
  background: linear-gradient(135deg, rgba(0, 199, 190, 0.14) 0%, rgba(11, 109, 59, 0.08) 100%);
}
.section {
  margin: 18rpx 28rpx 0;
  padding: 20rpx 18rpx;
}
.report {
  margin: 14rpx 28rpx 0;
  padding: 18rpx 18rpx 16rpx;
}
.report-body {
  margin-top: 12rpx;
  display: flex;
  gap: 14rpx;
}
.r-left {
  flex: 1;
}
.r-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #101828;
}
.r-text {
  margin-top: 10rpx;
  display: block;
  font-size: 24rpx;
  line-height: 36rpx;
}
.r-tags {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.rt {
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
  font-size: 22rpx;
  font-weight: 900;
}
.r-right {
  width: 200rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
  border: 1rpx solid #EAECF0;
}
.r-img {
  width: 100%;
  height: 180rpx;
  background: #F2F4F7;
}
.r-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10rpx 10rpx;
  background: linear-gradient(180deg, rgba(16, 24, 40, 0) 0%, rgba(16, 24, 40, 0.55) 100%);
}
.r-ov {
  color: rgba(255, 255, 255, 0.95);
  font-size: 22rpx;
  font-weight: 900;
}
.duo {
  margin: 14rpx 28rpx 0;
  padding: 16rpx 16rpx 12rpx;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14rpx;
}
.duo-left,
.duo-right {
  display: flex;
  flex-direction: column;
}
.mini-post {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #EAECF0;
}
.mini-post:first-of-type {
  border-top: none;
  padding-top: 0;
}
.mp-title {
  font-size: 24rpx;
  font-weight: 900;
  color: #101828;
  line-height: 34rpx;
}
.mp-meta {
  margin-top: 6rpx;
  display: flex;
  gap: 8rpx;
  font-size: 22rpx;
}
.mini-good {
  margin-top: 12rpx;
  display: flex;
  gap: 10rpx;
  align-items: center;
}
.mg-pic {
  width: 72rpx;
  height: 72rpx;
  border-radius: 14rpx;
  background: #F2F4F7;
}
.mg-meta {
  display: flex;
  flex-direction: column;
}
.mg-name {
  font-size: 22rpx;
  font-weight: 900;
  color: #101828;
}
.mg-price {
  margin-top: 4rpx;
  font-size: 22rpx;
  font-weight: 900;
  color: #D92D20;
}
.section-hd {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.h {
  font-size: 28rpx;
  font-weight: 900;
}
.more {
  font-size: 24rpx;
  color: #0B6D3B;
  font-weight: 800;
}
.hint {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 38rpx;
}
.plan {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.plan-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 12rpx;
  border-radius: 18rpx;
  background: #F9FAFB;
  border: 1rpx solid #EAECF0;
}
.ck {
  width: 34rpx;
  height: 34rpx;
  border-radius: 10rpx;
  border: 2rpx solid rgba(11, 109, 59, 0.35);
  background: #fff;
}
.ck.on {
  background: rgba(11, 109, 59, 0.90);
  border-color: rgba(11, 109, 59, 0.90);
}
.pi-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.pi-title {
  font-size: 26rpx;
  font-weight: 900;
  color: #101828;
}
.pi-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
}
.pi-tag {
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(16, 24, 40, 0.08);
  color: #344054;
  font-size: 22rpx;
  font-weight: 900;
}
.pi-tag.on {
  background: rgba(11, 109, 59, 0.12);
  color: #0B6D3B;
}
.plan-detail {
  padding: 12rpx 12rpx 14rpx;
  border-radius: 18rpx;
  background: rgba(11, 109, 59, 0.06);
  border: 1rpx solid rgba(11, 109, 59, 0.12);
}
.pd-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(16, 24, 40, 0.06);
}
.pd-row:last-child {
  border-bottom: none;
}
.pd-k {
  font-size: 22rpx;
}
.pd-v {
  flex: 1;
  text-align: right;
  font-size: 22rpx;
  font-weight: 900;
  color: #101828;
}
.pd-v.warn {
  color: #B54708;
}
.pd-actions {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
}
.chips {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.chip {
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background: #F2F4F7;
  color: #344054;
  font-size: 22rpx;
}
</style>

