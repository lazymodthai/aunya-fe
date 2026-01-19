import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type UserInfoType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

const initialState = {
  userData: {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    isActive: false,
    isAdmin: false,
    createdAt: "",
    updatedAt: ""
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser: (state, actions: PayloadAction<UserInfoType>) => {
      state.userData = actions.payload
    },
    clearUser: (state) => {
      state.userData = initialState.userData
    }

  },
  extraReducers: () => { },
})

export const { setUser, clearUser } = userSlice.actions
export const userSelector = (store: RootState) => store.userReducer
export default userSlice.reducer