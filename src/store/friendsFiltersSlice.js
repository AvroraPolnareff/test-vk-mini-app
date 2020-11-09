import {createSlice} from "@reduxjs/toolkit";

export const initState = {
  sex: 0,
  age: 0,
}

const friendsFiltersSlice = createSlice({
  name: 'friendsFilters',
  initialState: initState,
  reducers: {
    resetFilters: state => {
      state = initState;
    },
    changeFilters: (state, action) => {
      return {...state, ...action.payload}
    }
  }
})

export const {changeFilters, resetFilters} = friendsFiltersSlice.actions

export const friendsFiltersReducer = friendsFiltersSlice.reducer
