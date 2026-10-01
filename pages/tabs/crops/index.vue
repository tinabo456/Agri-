<template>
  <view class="page crops">
    <view class="top card">
      <view class="title-row">
        <text class="title">我的作物</text>
        <text class="pill" @click="goAI">去 AI 板块</text>
        <text class="pill" @click="addStage">上传阶段图片</text>
      </view>
      <text class="sub text-muted">按月份记录作物生长过程，AI 自动生成月度总结：种植计划/水肥/病虫害/预警。</text>
    </view>

    <view class="board card">
      <view class="months">
        <view
          v-for="m in months"
          :key="m"
          class="month"
          :class="{ on: m === month }"
          @click="pickMonth(m)"
        >
          {{ m }}月
        </view>
      </view>

      <view class="center">
        <view class="ai-card">
          <view class="ai-hd">
            <text class="ai-tag">AI 生产报告</text>
            <text class="ai-date text-muted">{{ year }}年{{ month }}月</text>
          </view>
          <text class="ai-title">{{ summary.title }}</text>
          <text class="ai-text text-muted">{{ summary.text }}</text>

          <view class="ai-actions">
            <button class="btn-primary btn" @click="goAI">让 AI 继续完善</button>
            <button class="btn-ghost btn" @click="refreshSummary">重新生成</button>
          </view>
        </view>

        <view class="stats">
          <view class="stat">
            <text class="k text-muted">浇灌执行</text>
            <text class="v">{{ summary.irrigation }}</text>
          </view>
          <view class="stat">
            <text class="k text-muted">施肥执行</text>
            <text class="v">{{ summary.fertilize }}</text>
          </view>
          <view class="stat">
            <text class="k text-muted">病虫害预警</text>
            <text class="v warn">{{ summary.pest }}</text>
          </view>
        </view>
      </view>

      <view class="right">
        <view class="r-title text-muted">田间影像</view>
        <scroll-view class="imgs" scroll-y>
          <view v-for="img in images" :key="img.id" class="img-item" @click="preview(img)">
            <image class="img" :src="img.url || '/static/logo.png'" mode="aspectFill" />
            <text class="cap">{{ img.label }}</text>
          </view>
          <view class="img-item add" @click="addStage">
            <text class="plus">+</text>
            <text class="cap">添加</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
let iid = 1

export default {
  data() {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      months: Array.from({ length: 12 }).map((_, i) => i + 1),
      summary: {
        title: '旺盛生长期',
        text: '本月气温回升较快，作物进入拔节关键期，需肥水需求达到高峰。建议：控旺促壮、分次追肥、关注蚜虫与锈病风险。',
        irrigation: '已灌溉 3 次 / 累计 45m³',
        fertilize: '追施尿素 1 次 / 15kg/亩',
        pest: '低风险（注意蚜虫）'
      },
      images: []
    }
  },
  onShow() {
    this.loadMonth()
  },
  methods: {
    pickMonth(m) {
      this.month = m
      this.loadMonth()
    },
    async loadMonth() {
      await Promise.all([this.loadSummary(), this.loadImages()])
    },
    async loadSummary() {
      try {
        const data = await this.$api.crop.getAiMonthlySummary({ cropId: 1, year: this.year, month: this.month })
        this.summary = {
          title: data?.stageTitle || data?.title || this.summary.title,
          text: data?.content || data?.text || this.summary.text,
          irrigation: data?.irrigation || this.summary.irrigation,
          fertilize: data?.fertilize || this.summary.fertilize,
          pest: data?.pest || this.summary.pest
        }
      } catch (e) {}
    },
    async loadImages() {
      try {
        const list = await this.$api.crop.listMyCropStages({ cropId: 1, year: this.year })
        const arr = list?.rows || list?.list || list || []
        this.images = arr
          .filter((x) => (x.stageMonth || x.month) === this.month)
          .map((x, idx) => ({
            id: x.id ?? x.stageId ?? idx + 1,
            url: x.url ?? x.imageUrl ?? x.pic,
            label: x.label ?? x.stageName ?? `${this.month}月阶段`
          }))
      } catch (e) {
        // 演示占位
        this.images = [
          { id: iid++, url: '/static/logo.png', label: `${this.month}月·拔节` },
          { id: iid++, url: '/static/logo.png', label: `${this.month}月·长势` },
          { id: iid++, url: '/static/logo.png', label: `${this.month}月·叶片` }
        ]
      }
    },
    async addStage() {
      try {
        const choose = await new Promise((resolve, reject) => {
          uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['camera', 'album'], success: resolve, fail: reject })
        })
        const filePath = choose?.tempFilePaths?.[0]
        if (!filePath) return
        await this.$api.crop.uploadStageImage({ cropId: 1, stageMonth: this.month, filePath })
        uni.showToast({ title: '上传成功', icon: 'none' })
        this.loadImages()
        this.refreshSummary()
      } catch (e) {}
    },
    refreshSummary() {
      // 后端实现后可触发重新生成
      this.loadSummary()
      uni.showToast({ title: '已请求重新生成', icon: 'none' })
    },
    preview(img) {
      uni.previewImage({ urls: this.images.map((x) => x.url), current: img.url })
    },
    goAI() {
      uni.switchTab({ url: '/pages/tabs/ai/index' })
    }
  }
}
</script>

<style lang="scss">
.crops {
  padding: 18rpx 22rpx 26rpx;
}
.top {
  padding: 18rpx 18rpx 14rpx;
}
.title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}
.title {
  font-size: 30rpx;
  font-weight: 900;
  color: #101828;
  margin-right: 10rpx;
}
.pill {
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
  font-size: 22rpx;
  font-weight: 900;
}
.sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 36rpx;
}
.board {
  margin-top: 14rpx;
  padding: 16rpx;
  display: flex;
  gap: 14rpx;
  min-height: 720rpx;
}
.months {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 8rpx 0;
}
.month {
  height: 66rpx;
  line-height: 66rpx;
  text-align: center;
  border-radius: 999rpx;
  background: #F2F4F7;
  color: #667085;
  font-weight: 900;
  font-size: 24rpx;
}
.month.on {
  background: linear-gradient(135deg, #0B6D3B 0%, #0F8A4A 100%);
  color: #fff;
}
.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.ai-card {
  border-radius: 18rpx;
  background: rgba(11, 109, 59, 0.08);
  padding: 16rpx 16rpx 14rpx;
}
.ai-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ai-tag {
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(11, 109, 59, 0.12);
  color: #0B6D3B;
  font-size: 22rpx;
  font-weight: 900;
}
.ai-date {
  font-size: 22rpx;
}
.ai-title {
  margin-top: 12rpx;
  display: block;
  font-size: 36rpx;
  font-weight: 900;
  color: #101828;
}
.ai-text {
  margin-top: 10rpx;
  display: block;
  font-size: 24rpx;
  line-height: 36rpx;
}
.ai-actions {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}
.btn {
  flex: 1;
  height: 86rpx;
  line-height: 86rpx;
  font-size: 24rpx;
  font-weight: 900;
  border: none;
}
.stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12rpx;
}
.stat {
  padding: 14rpx 16rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(16, 24, 40, 0.06);
}
.k {
  font-size: 22rpx;
}
.v {
  margin-top: 8rpx;
  display: block;
  font-size: 28rpx;
  font-weight: 900;
  color: #101828;
}
.warn {
  color: #B54708;
}
.right {
  width: 180rpx;
  display: flex;
  flex-direction: column;
}
.r-title {
  font-size: 22rpx;
  padding: 6rpx 6rpx 10rpx;
}
.imgs {
  height: 650rpx;
}
.img-item {
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid #EAECF0;
}
.img {
  width: 100%;
  height: 140rpx;
  background: #F2F4F7;
}
.cap {
  display: block;
  padding: 10rpx 10rpx;
  font-size: 22rpx;
  color: #344054;
}
.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 190rpx;
  background: #F9FAFB;
  border-style: dashed;
}
.plus {
  font-size: 46rpx;
  color: #0B6D3B;
  font-weight: 900;
  margin-top: 6rpx;
}
</style>

