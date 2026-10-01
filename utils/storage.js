const TOKEN_KEY = 'agri_token'
const USER_KEY = 'agri_user'
const LOC_KEY = 'agri_location'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token || '')
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

export function getUser() {
  return uni.getStorageSync(USER_KEY) || null
}

export function setUser(user) {
  uni.setStorageSync(USER_KEY, user || null)
}

export function clearUser() {
  uni.removeStorageSync(USER_KEY)
}

export function getLocationCache() {
  return uni.getStorageSync(LOC_KEY) || null
}

export function setLocationCache(loc) {
  uni.setStorageSync(LOC_KEY, loc || null)
}

export function clearLocationCache() {
  uni.removeStorageSync(LOC_KEY)
}

