import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth.slice'
import uiReducer from './slices/ui.slice'
import userReducer from './slices/user.slice'
import { authApi } from './api/auth.api'
import { userApi } from './api/user.api'
import { nutritionApi } from './api/nutrition.api'
import { progressApi } from './api/progress.api'
import { trainerApi } from './api/trainer.api'
import { chatApi } from './api/chat.api'

export const store = configureStore({
  reducer: {
    // Слайсы
    auth: authReducer,
    ui: uiReducer,
    user: userReducer,
    
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [nutritionApi.reducerPath]: nutritionApi.reducer,
    [progressApi.reducerPath]: progressApi.reducer,
    [trainerApi.reducerPath]: trainerApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(
        authApi.middleware,
        userApi.middleware,
        nutritionApi.middleware,
        progressApi.middleware,
        trainerApi.middleware,
        chatApi.middleware
      ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch