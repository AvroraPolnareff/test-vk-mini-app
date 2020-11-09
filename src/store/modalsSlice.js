import {createSlice} from "@reduxjs/toolkit";

export const Modals = {
  FRIENDS_FILTERS: 'FRIENDS_FILTERS'
}

const modalsSlice = createSlice({
  name: 'modals',
  initialState: null,
  reducers: {
    showModal(state, action) {
      return action.payload
    },
    closeModal(state) {
      return null
    }
  }
})

export const {showModal, closeModal} = modalsSlice.actions

export const modalsReducer = modalsSlice.reducer
