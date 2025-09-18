import { configureStore } from "@reduxjs/toolkit";
import teamReducer from "./slices/teamSlice";
import tournamentReducer from "./slices/tournamentSlice";

const store = configureStore({
  reducer: {
    teams: teamReducer,
    tournaments: tournamentReducer,
  },
});

export default store;