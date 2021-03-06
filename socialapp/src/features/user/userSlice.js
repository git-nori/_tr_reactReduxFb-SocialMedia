import { createSlice } from '@reduxjs/toolkit'

import { setErrors, clearErrors, loadingUi } from '../uiSlice'

import axios from 'axios'

const initialState = {
  authenticated: false,
  credentials: {},
  likes: [],
  notifications: [],
  loading: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loadingUser (state, action) {
      state.loading = true
    },
    setAuthenticated (state, action) {
      state.authenticated = true
    },
    setUnAuthenticated (state, action) {
      state.authenticated = false
    },
    setUser (state, action) {
      state.authenticated = true
      state.loading = false
      // credentials, likes, notificationsを格納
      const { credentials, likes, notifications } = action.payload
      state.credentials = credentials
      state.likes = likes
      state.notifications = notifications
    },
    likeScream (state, action) {
      const likes = {
        userHandle: state.credentials.handle,
        screamId: action.payload
      }
      state.likes.push(likes)
    },
    unlikeScream (state, action) {
      state.likes = state.likes.filter(like => like.screamId !== action.payload)
    },
    setNotificationsReaded (state, action) {
      state.notifications.forEach(not => not.read = true)
    }
  },
})

export const {
  loadingUser,
  setUser,
  setUnAuthenticated,
  setAuthenticated,
  likeScream,
  unlikeScream,
  setNotificationsReaded
} = userSlice.actions

export default userSlice.reducer

/** thunk actions */
// ログイン処理
export const loginUser = (userData, history) => dispatch => {
  dispatch(loadingUi())

  axios.post('/login', userData)
    .then(res => {
      // 認証情報をlocalstorage, axiosの共通ヘッダにセット
      setAuthorizationHeader(res.data.token)

      dispatch(getUserData())
      dispatch(clearErrors())

      history.push('/')
    })
    .catch(err => {
      console.error(err)
      dispatch(setErrors(err.response.data))
    })
}

export const logoutUser = () => dispatch => {
  // localstorageからデータを削除, axiosの共通ヘッダを削除
  localStorage.removeItem('FBIdToken')
  delete axios.defaults.headers.common
  dispatch(setUnAuthenticated())
}

// Signup処理
export const signupUser = (userData, history) => dispatch => {
  dispatch(loadingUi())

  axios.post('/signup', userData)
    .then(res => {
      setAuthorizationHeader(res.data.token)

      dispatch(getUserData())
      dispatch(clearErrors())

      history.push('/')
    })
    .catch(err => {
      console.error(err)
      dispatch(setErrors(err.response.data))
    })
}

// ユーザー情報を取得
export const getUserData = () => dispatch => {
  dispatch(loadingUser())
  axios.get('/user')
    .then(res => {
      dispatch(setUser(res.data))
    })
    .catch(err => console.error(err))
}

export const uploadImage = formData => dispatch => {
  dispatch(loadingUser())
  axios.post('/user/image', formData)
    .then(res => {
      dispatch(getUserData())
    })
    .catch(err => console.log(err))
}

export const editUserDetails = userDetails => dispatch => {
  dispatch(loadingUser())
  axios.post('/user', userDetails)
    .then(res => {
      dispatch(getUserData())
    })
    .catch(err => console.log(err))
}

export const markNotificationsRead = (notifications) => dispatch => {
  axios.post('/notifications', notifications)
    .then(res => {
      dispatch(setNotificationsReaded())
    })
    .catch(err => console.log(err))
}

// 認証情報をlocalstorage, axiosの共通ヘッダにセット
const setAuthorizationHeader = token => {
  const FBIdToken = `Bearer ${token}`
  localStorage.setItem('FBIdToken', FBIdToken)
  axios.defaults.headers.common = { 'Authorization': FBIdToken }
}