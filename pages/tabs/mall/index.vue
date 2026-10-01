<template>
  <view class="page mall">
    <view class="top card">
      <view class="search">
        <input class="search-input" v-model.trim="keyword" placeholder="搜索种子/肥料/农资" @confirm="reload" />
        <text class="search-btn" @click="reload">搜索</text>
      </view>
      <view class="sort">
        <view class="s" :class="{ on: sort === 'sales' }" @click="setSort('sales')">销量</view>
        <view class="s" :class="{ on: sort === 'settled' }" @click="setSort('settled')">入住时间</view>
        <view class="s" :class="{ on: sort === 'popularity' }" @click="setSort('popularity')">人气</view>
      </view>
    </view>

    <scroll-view class="cats" scroll-x>
      <view class="cat" :class="{ on: !categoryId }" @click="pickCat('')">全部</view>
      <view v-for="c in categories" :key="c.id" class="cat" :class="{ on: categoryId === c.id }" @click="pickCat(c.id)">
        {{ c.name }}
      </view>
    </scroll-view>

    <view class="list">
      <view v-for="g in goods" :key="g.id" class="card item" @click="openDetail(g)">
        <image class="pic" :src="g.cover || '/static/logo.png'" mode="aspectFill" />
        <view class="meta">
          <text class="name">{{ g.name }}</text>
          <text class="desc text-muted">{{ g.desc || '适用作物/阶段：待后端补齐' }}</text>
          <view class="row">
            <text class="price">￥{{ g.price || '0.00' }}</text>
            <text class="badge">{{ g.tag || '惠农' }}</text>
          </view>
        </view>
      </view>

      <view v-if="!loading && goods.length === 0" class="empty text-muted">暂无商品</view>
      <view v-if="loading" class="empty text-muted">加载中…</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      categories: [],
      categoryId: '',
      sort: 'sales',
      keyword: '',
      goods: [],
      loading: false
    }
  },
  onShow() {
    this.init()
  },
  methods: {
    async init() {
      await this.loadCats()
      await this.reload()
    },
    async loadCats() {
      try {
        const list = await this.$api.mall.listCategories()
        this.categories = (list || []).map((x, idx) => ({
          id: x.id ?? x.categoryId ?? idx + 1,
          name: x.name ?? x.categoryName ?? `分类${idx + 1}`
        }))
      } catch (e) {
        this.categories = [
          { id: 'seed', name: '种子' },
          { id: 'fert', name: '肥料' },
          { id: 'pesticide', name: '农药' },
          { id: 'subsidy', name: '补贴专区' }
        ]
      }
    },
    async reload() {
      this.loading = true
      try {
        const list = await this.$api.mall.listGoods({
          categoryId: this.categoryId,
          sort: this.sort,
          keyword: this.keyword,
          pageNum: 1,
          pageSize: 20
        })
        const arr = list?.rows || list?.list || list || []
        this.goods = arr.map((x, idx) => ({
          id: x.id ?? x.goodsId ?? idx + 1,
          name: x.name ?? x.goodsName ?? '商品',
          cover: x.cover ?? x.pic ?? x.image,
          price: x.price ?? x.salePrice,
          desc: x.brief ?? x.desc,
          tag: x.tag
        }))
      } catch (e) {
        this.goods = []
      } finally {
        this.loading = false
      }
    },
    setSort(s) {
      this.sort = s
      this.reload()
    },
    pickCat(id) {
      this.categoryId = id
      this.reload()
    },
    openDetail(g) {
      uni.showToast({ title: `详情页待接入：${g.name}`, icon: 'none' })
    }
  }
}
</script>

<style lang="scss">
.mall {
  padding: 18rpx 22rpx 28rpx;
}
.top {
  padding: 18rpx 16rpx 14rpx;
}
.search {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.search-input {
  flex: 1;
  height: 84rpx;
  padding: 0 20rpx;
  border-radius: 16rpx;
  background: #F9FAFB;
  border: 1rpx solid #EAECF0;
  font-size: 28rpx;
}
.search-btn {
  padding: 0 18rpx;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 16rpx;
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
  font-weight: 900;
  font-size: 26rpx;
}
.sort {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}
.s {
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background: #F2F4F7;
  color: #667085;
  font-size: 24rpx;
}
.s.on {
  background: rgba(11, 109, 59, 0.12);
  color: #0B6D3B;
  font-weight: 900;
}
.cats {
  margin-top: 14rpx;
  white-space: nowrap;
}
.cat {
  display: inline-block;
  margin-right: 12rpx;
  padding: 12rpx 16rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid #EAECF0;
  color: #344054;
  font-size: 24rpx;
}
.cat.on {
  border-color: rgba(11, 109, 59, 0.35);
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
  font-weight: 900;
}
.list {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.item {
  display: flex;
  gap: 14rpx;
  padding: 14rpx;
}
.pic {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #F2F4F7;
}
.meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.name {
  font-size: 28rpx;
  font-weight: 900;
  color: #101828;
}
.desc {
  margin-top: 6rpx;
  font-size: 24rpx;
  line-height: 34rpx;
}
.row {
  margin-top: 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  color: #D92D20;
  font-weight: 900;
  font-size: 28rpx;
}
.badge {
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(11, 109, 59, 0.10);
  color: #0B6D3B;
  font-size: 22rpx;
  font-weight: 900;
}
.empty {
  text-align: center;
  padding: 50rpx 0;
  font-size: 24rpx;
}
</style>

