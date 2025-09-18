import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchTeams = createAsyncThunk("teams/fetchTeams", async () => {
  const res = await api.get("/teams");
  return res.data;
});

export const addTeam = createAsyncThunk("teams/addTeam", async ({ name, logo }) => {
  const formData = new FormData();
  formData.append("name", name);
  if (logo) formData.append("logo", logo);

  const res = await api.post("/teams", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-admin-key": "supersecretpassword123", // ⚠️ secure in real app
    },
  });
  return res.data.team;
});

export const deleteTeam = createAsyncThunk("teams/deleteTeam", async (teamId) => {
  const res = await api.delete(`/teams/${teamId}`, {
    headers: {
      "x-admin-key": "supersecretpassword123", // ⚠️ secure in real app
    },
  });
  return teamId;
});

const teamSlice = createSlice({
  name: "teams",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addTeam.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addTeam.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addTeam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.list = state.list.filter(team => team._id !== action.payload);
      });
  },
});

export default teamSlice.reducer;