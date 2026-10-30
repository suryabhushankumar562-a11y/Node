import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '../features/auth/authSlice';
import servicesReducer from '../features/services/servicesSlice';
import bookingReducer from '../features/booking/bookingSlice';
import therapistsReducer from '../features/therapists/therapistsSlice';
import adminReducer from '../features/admin/adminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  services: servicesReducer,
  booking: bookingReducer,
  therapists: therapistsReducer,
  admin: adminReducer,
});

const persistConfig = {
  key: 'spa-root',
  storage,
  // Only persist auth (user + isAuthenticated). accessToken is short-lived,
  // but we keep it too so a refresh can happen silently via the refresh cookie.
  whitelist: ['auth'],
};

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
