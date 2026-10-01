<script>
	export default {
		onLaunch: function() {
			// 小程序启动页由 pages.json 的首屏决定（当前为 pages/auth/boot）
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
@import "@/styles/theme.scss";
</style>
