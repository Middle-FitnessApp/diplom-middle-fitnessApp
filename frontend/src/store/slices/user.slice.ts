import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, BodyMeasurement } from '../types/user.types';

interface UserState {
  profile: UserProfile | null;
  bodyMeasurements: BodyMeasurement[];
  selectedMetric: keyof BodyMeasurement;
  selectedPeriod: 'week' | 'month' | '3months' | 'year';
}

const initialState: UserState = {
  profile: null,
  bodyMeasurements: [],
  selectedMetric: 'weight',
  selectedPeriod: 'month',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setBodyMeasurements: (state, action: PayloadAction<BodyMeasurement[]>) => {
      state.bodyMeasurements = action.payload;
    },
    addBodyMeasurement: (state, action: PayloadAction<BodyMeasurement>) => {
      state.bodyMeasurements.push(action.payload);
    },
    setSelectedMetric: (state, action: PayloadAction<keyof BodyMeasurement>) => {
      state.selectedMetric = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<'week' | 'month' | '3months' | 'year'>) => {
      state.selectedPeriod = action.payload;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setBodyMeasurements,
  addBodyMeasurement,
  setSelectedMetric,
  setSelectedPeriod,
} = userSlice.actions;
export default userSlice.reducer;