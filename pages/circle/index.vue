<template>
  <view class="page circle">
    <view class="card head">
      <view class="row">
        <text class="title">圈子</text>
        <text class="pill">{{ areaText }}</text>
      </view>
      <text class="sub text-muted">按定位自动加入本地种植圈子，浏览同区域种植动态；支持点赞、评论、查看对方作物阶段。</text>
    </view>

    <view class="card circles">
      <view class="hd">
        <text class="h">本地圈子</text>
        <text class="act" @click="refresh">刷新</text>
      </view>
      <scroll-view class="c-list" scroll-x>
        <view
          v-for="c in circleList"
          :key="c.id"
          class="c-item"
          :class="{ on: c.id === circleId }"
          @click="pickCircle(c)"
        >
          {{ c.name }}
        </view>
      </scroll-view>
    </view>

    <view class="card feed">
      <view class="hd">
        <text class="h">动态</text>
        <text class="act" @click="createPost">发布</text>
      </view>

      <view v-for="p in posts" :key="p.id" class="post">
        <view class="p-hd">
          <text class="u">{{ p.userName }}</text>
          <text class="time text-muted">{{ p.time }}</text>
        </view>
        <text class="content">{{ p.content }}</text>
        <view v-if="p.images && p.images.length" class="imgs">
          <image v-for="(img, idx) in p.images" :key="idx" class="img" :src="img" mode="aspectFill" @click="preview(p.images, img)" />
        </view>
        <view class="ops">
          <text class="op" @click="like(p)">赞 {{ p.likes }}</text>
          <text class="op" @click="comment(p)">评论 {{ p.comments }}</text>
          <text class="op" @click="openCrop(p)">看作物</text>
        </view>
      </view>

      <view v-if="!loading && posts.length === 0" class="empty text-muted">暂无动态</view>
      <view v-if="loading" class="empty text-muted">加载中…</view>
    </view>
  </view>
</template>

<script>
import { getLocationCache } from '@/utils/storage'

export default {
  data() {
    return {
      loc: null,
      circleList: [],
      circleId: '',
      posts: [],
      loading: false
    }
  },
  computed: {
    areaText() {
      const l = this.loc
      return l?.district || l?.city || l?.address || '未定位'
    }
  },
  onShow() {
    this.refresh()
  },
  methods: {
    async refresh() {
      this.loc = getLocationCache()
      await this.loadCircles()
      await this.loadPosts()
    },
    async loadCircles() {
      try {
        const list = await this.$api.circle.listCircles({ adcode: this.loc?.adcode || '' })
        const arr = list?.rows || list?.list || list || []
        this.circleList = arr.map((x, idx) => ({
          id: x.id ?? x.circleId ?? idx + 1,
          name: x.name ?? x.circleName ?? `${this.areaText}种植圈`
        }))
      } catch (e) {
        this.circleList = [
          { id: 'local', name: `${this.areaText}种植圈` },
          { id: 'wheat', name: '小麦交流圈' },
          { id: 'veg', name: '蔬菜管理圈' }
        ]
      }
      if (!this.circleId && this.circleList.length) this.circleId = this.circleList[0].id
    },
    async loadPosts() {
      this.loading = true
      try {
        const res = await this.$api.circle.listPosts({ circleId: this.circleId, pageNum: 1, pageSize: 10 })
        const arr = res?.rows || res?.list || res || []
        this.posts = arr.map((x, idx) => ({
          id: x.id ?? x.postId ?? idx + 1,
          userName: x.userName ?? x.nickName ?? '农户',
          time: x.time ?? x.createTime ?? '刚刚',
          content: x.content ?? '作物长势良好，准备追肥…',
          images: x.images ?? x.pics ?? [],
          likes: x.likes ?? x.likeCount ?? 0,
          comments: x.comments ?? x.commentCount ?? 0,
          cropStageId: x.cropStageId
        }))
      } catch (e) {
        this.posts = [
          {
            id: 1,
            userName: '长清区·张师傅',
            time: '今天',
            content: '本周降水概率上升，我把田里排水沟又清了一遍，大家注意锈病风险。',
            images: ['/static/logo.png'],
            likes: 12,
            comments: 3,
            cropStageId: 0
          }
        ]
      } finally {
        this.loading = false
      }
    },
    pickCircle(c) {
      this.circleId = c.id
      this.loadPosts()
    },
    preview(urls, current) {
      uni.previewImage({ urls, current })
    },
    async like(p) {
      p.likes += 1
      this.$api.circle.likePost({ postId: p.id }).catch(() => {})
    },
    comment(p) {
      uni.showToast({ title: '评论弹窗待完善', icon: 'none' })
      p.comments += 1
    },
    openCrop(p) {
      uni.switchTab({ url: '/pages/tabs/crops/index' })
    },
    createPost() {
      uni.showToast({ title: '发布页待完善（图文上传）', icon: 'none' })
    }
  }
}
</script>

<style lang="scss">
.circle {
  padding: 18rpx 22rpx 26rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.head {
  padding: 18rpx 18rpx 14rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 30rpx;
  font-weight: 900;
  color: #101828;
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
.circles {
  padding: 14rpx 14rpx 12rpx;
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
.act {
  font-size: 24rpx;
  color: #0B6D3B;
  font-weight: 900;
}
.c-list {
  margin-top: 12rpx;
  white-space: nowrap;
}
.c-item {
  display: inline-block;
  margin-right: 12rpx;
  padding: 12rpx 16rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid #EAECF0;
  color: #344054;
  font-size: 24rpx;
}
.c-item.on {
  border-color: rgba(11, 109, 59, 0.35);
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
  font-weight: 900;
}
.feed {
  padding: 14rpx 14rpx 8rpx;
}
.post {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #EAECF0;
}
.post:last-child {
  border-bottom: none;
}
.p-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.u {
  font-size: 26rpx;
  font-weight: 900;
  color: #101828;
}
.time {
  font-size: 22rpx;
}
.content {
  margin-top: 10rpx;
  display: block;
  font-size: 26rpx;
  line-height: 38rpx;
  color: #101828;
}
.imgs {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}
.img {
  width: 210rpx;
  height: 210rpx;
  border-radius: 16rpx;
  background: #F2F4F7;
}
.ops {
  margin-top: 10rpx;
  display: flex;
  gap: 18rpx;
}
.op {
  font-size: 24rpx;
  color: #0B6D3B;
  font-weight: 900;
}
.empty {
  text-align: center;
  padding: 50rpx 0;
  font-size: 24rpx;
}
</style>

