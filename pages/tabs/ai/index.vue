<template>
  <view class="page ai">
    <view class="card top">
      <view class="title-row">
        <text class="title">AI 农业生产分析</text>
        <text class="pill" @click="goWeather">查看天气</text>
        <text class="pill" @click="goLocation">更改定位</text>
      </view>
      <text class="sub text-muted">
        支持上传作物图片进行诊断，也支持文字/语音问答。后端接入 Doubao-Seed-2.0-pro 后会返回标准化报告。
      </text>
    </view>

    <view class="card tools">
      <button class="btn-ghost tool" @click="pickImage">上传图片分析</button>
      <button class="btn-ghost tool" @click="startVoice">语音输入（占位）</button>
    </view>

    <view class="card chat">
      <view class="msgs">
        <view v-for="m in messages" :key="m.id" class="msg" :class="m.role">
          <text class="bubble">{{ m.text }}</text>
        </view>
      </view>
      <view class="composer">
        <input class="input" v-model.trim="text" placeholder="问：浇灌多少？如何防治蚜虫？" @confirm="sendText" />
        <button class="btn-primary send" @click="sendText">发送</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getLocationCache } from '@/utils/storage'

let mid = 1

export default {
  data() {
    return {
      text: '',
      sessionId: '',
      messages: [
        { id: mid++, role: 'ai', text: '你好，我是农事通 AI。你可以上传作物图片，或直接问我问题。' }
      ]
    }
  },
  methods: {
    goWeather() {
      uni.navigateTo({ url: '/pages/weather/index' })
    },
    goLocation() {
      uni.navigateTo({ url: '/pages/auth/location' })
    },
    async pickImage() {
      try {
        const choose = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['camera', 'album'],
            success: resolve,
            fail: reject
          })
        })
        const filePath = choose?.tempFilePaths?.[0]
        if (!filePath) return
        this.messages.push({ id: mid++, role: 'me', text: '（已上传图片，正在分析…）' })

        // 上传图片到后端，得到图片id/url
        const img = await this.$api.ai.uploadAiImage({ filePath })
        const loc = getLocationCache()
        const payload = {
          location: loc || null,
          weather: null, // 可由后端根据 location 拉取腾讯天气
          crop: null, // 可从“我的作物”选择后填充
          images: [img]
        }
        const report = await this.$api.ai.analyzeCrop(payload)
        this.messages.push({
          id: mid++,
          role: 'ai',
          text: report?.summary || report?.text || '分析完成（后端标准化输出待接入）'
        })
      } catch (e) {
        uni.showToast({ title: '上传/分析失败', icon: 'none' })
      }
    },
    startVoice() {
      uni.showToast({ title: '语音录制与ASR待接入', icon: 'none' })
    },
    async sendText() {
      const t = this.text
      if (!t) return
      this.text = ''
      this.messages.push({ id: mid++, role: 'me', text: t })
      try {
        const loc = getLocationCache()
        const res = await this.$api.ai.chatText({
          sessionId: this.sessionId,
          text: t,
          context: { location: loc || null }
        })
        this.sessionId = res?.sessionId || this.sessionId
        const answer = res?.answer || res?.text || res?.message || '已收到（后端AI接入后返回答案）'
        this.messages.push({ id: mid++, role: 'ai', text: answer })
      } catch (e) {
        this.messages.push({ id: mid++, role: 'ai', text: '请求失败，请稍后再试。' })
      }
    }
  }
}
</script>

<style lang="scss">
.ai {
  padding: 18rpx 22rpx 26rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
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
.tools {
  padding: 14rpx 14rpx;
  display: flex;
  gap: 12rpx;
}
.tool {
  flex: 1;
  height: 86rpx;
  line-height: 86rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 900;
}
.chat {
  flex: 1;
  min-height: 640rpx;
  padding: 14rpx;
  display: flex;
  flex-direction: column;
}
.msgs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.msg {
  display: flex;
}
.msg.me {
  justify-content: flex-end;
}
.bubble {
  max-width: 520rpx;
  padding: 14rpx 16rpx;
  border-radius: 18rpx;
  font-size: 26rpx;
  line-height: 36rpx;
}
.msg.ai .bubble {
  background: #F2F4F7;
  color: #101828;
}
.msg.me .bubble {
  background: rgba(11, 109, 59, 0.12);
  color: #0B6D3B;
  font-weight: 800;
}
.composer {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
  align-items: center;
}
.input {
  flex: 1;
  height: 86rpx;
  padding: 0 18rpx;
  border-radius: 16rpx;
  background: #F9FAFB;
  border: 1rpx solid #EAECF0;
  font-size: 28rpx;
}
.send {
  width: 160rpx;
  height: 86rpx;
  line-height: 86rpx;
  font-size: 26rpx;
  font-weight: 900;
  border: none;
}
</style>

