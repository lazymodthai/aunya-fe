import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type UserInfoType = {
  email: string;
  name: string;
};

const initialState = {
  userInfo: {
    email: "",
    name: "",
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUserInfo: (state, actions: PayloadAction<UserInfoType>) => {
      state.userInfo = actions.payload
    },
    clearUser: (state) => {
      state.userInfo = initialState.userInfo
    }
    
  },
  extraReducers: () => {},
})

export const { setUserInfo, clearUser } = userSlice.actions
export const userSelector = (store: RootState) => store.userReducer
export default userSlice.reducer