import {combineReducers} from "redux";
import {friendsFiltersReducer} from "./friendsFiltersSlice";
import {modalsReducer} from "./modalsSlice";

export const rootReducer = combineReducers({
  friendsFilters: friendsFiltersReducer,
  modals: modalsReducer
})
