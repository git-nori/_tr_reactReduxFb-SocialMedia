import { createSlice } from '@reduxjs/toolkit'

import { setErrors, clearErrors, loadingUi } from '../uiSlice'

import axios from 'axios'

const initialState = {
  authenticated: false,
  credentials: {},
  likes: [],
  notifications: []
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated (state, action) {
      state.authenticated = true
    },
    setUnAuthenticated (state, action) {
      state.authenticated = false
    },
    setUser (state, action) {
      state.authenticated = true
      // credentials, likes, notificationsを格納
      const {credentials, likes, notifications} = action.payload
      state.credentials = credentials
      state.likes = likes
      state.notifications = notifications
    },
  },
})

export const {
  setUser,
  setUnAuthenticated,
  setAuthenticated
} = userSlice.actions

export default userSlice.reducer

/** thunk actions */
// ログイン処理
export const loginUser = (userData, history) => dispatch => {
  dispatch(loadingUi())

  axios.post('/login', userData)
    .then(res => {
      console.log(res.data)

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

// Signup処理
export const signupUser = (userData, history) => dispatch => {
  dispatch(loadingUi())

  axios.post('/signup', userData)
    .then(res => {
      console.log(res.data)

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
  axios.get('/user')
    .then(res => {
      dispatch(setUser(res.data))
    })
    .catch(err => console.error(err))
}

// 認証情報をlocalstorage, axiosの共通ヘッダにセット
const setAuthorizationHeader = token => {
  const FBIdToken = `Bearer ${token}`
  localStorage.setItem('FBIdToken', FBIdToken)
  axios.defaults.headers.common['Authorization'] = FBIdToken
}