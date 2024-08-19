import { configureStore } from '@reduxjs/toolkit';
import polygonSlice from '../components/polygon-slice';

const store = configureStore({
    reducer: {
        polygon: polygonSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;