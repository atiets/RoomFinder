import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import menuReducer from "./menuSlice";
import newsReducer from "./newsSlice";
import postReducer from "./postSlice";
import userReducer from "./userSlice";
import reviewReducer from "./reviewSlice";
import notificationReducer from "./notificationSlice";

import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "users"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  posts: postReducer,
  news: newsReducer,
  menu: menuReducer,
  reviews: reviewReducer,
  notifications: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
