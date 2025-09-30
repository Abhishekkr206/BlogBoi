import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
}

const authSlicer = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setUser: (state,action)=>{
            state.user = action.payload
        },
        clearUser:(state)=>{
            state.user = null
        }
    }
})

export const {setUser, clearUser} = authSlicer.actions
export default authSlicer.reducer;