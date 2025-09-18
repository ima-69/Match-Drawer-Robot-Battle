import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchTournament = createAsyncThunk("tournaments/fetchOne", async (id) => {
  const res = await api.get(`/tournaments/${id}`);
  return res.data;
});

export const fetchAllTournaments = createAsyncThunk("tournaments/fetchAll", async () => {
  const res = await api.get("/tournaments");
  return res.data;
});

export const createTournament = createAsyncThunk("tournaments/create", async ({ name, selectedTeamIds }) => {
  const res = await api.post("/tournaments", { name, selectedTeamIds }, {
    headers: { "x-admin-key": "supersecretpassword123" }
  });
  return res.data;
});

export const fetchTournamentWithUpdates = createAsyncThunk("tournaments/fetchTournamentWithUpdates", async ({ id, version = 0 }) => {
  const res = await api.get(`/tournaments/${id}/updates?version=${version}`);
  return res.data;
});

export const reportMatchResult = createAsyncThunk("tournaments/reportMatch", async ({ tournamentId, matchId, winnerId }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/tournaments/${tournamentId}/matches/${matchId}/report-result`, { winnerId }, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const completeKnockoutRound = createAsyncThunk("tournaments/completeKnockoutRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting complete knockout round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/complete-knockout-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Complete knockout round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Complete knockout round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const completeWildcardRound = createAsyncThunk("tournaments/completeWildcardRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting complete wildcard round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/complete-wildcard-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Complete wildcard round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Complete wildcard round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const startNextKnockoutRound = createAsyncThunk("tournaments/startNextKnockoutRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting next knockout round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/start-next-knockout-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Start next knockout round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Start next knockout round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const startNextWildcardRound = createAsyncThunk("tournaments/startNextWildcardRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting next wildcard round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/start-next-wildcard-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Start next wildcard round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Start next wildcard round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const startSemifinalRound = createAsyncThunk("tournaments/startSemifinalRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting semifinal round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/start-semifinal-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Start semifinal round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Start semifinal round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const completeSemifinalRound = createAsyncThunk("tournaments/completeSemifinalRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting complete semifinal round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/complete-semifinal-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Complete semifinal round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Complete semifinal round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const completeFinalRound = createAsyncThunk("tournaments/completeFinalRound", async (tournamentId, { rejectWithValue }) => {
  try {
    console.log("Redux: Starting complete final round for tournament:", tournamentId);
    const res = await api.post(`/tournaments/${tournamentId}/complete-final-round`, {}, {
      headers: { "x-admin-key": "supersecretpassword123" }
    });
    console.log("Redux: Complete final round response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Redux: Complete final round error:", error);
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const deleteTournament = createAsyncThunk("tournaments/deleteTournament", async (tournamentId) => {
  const res = await api.delete(`/tournaments/${tournamentId}`, {
    headers: { "x-admin-key": "supersecretpassword123" }
  });
  return res.data;
});

const tournamentSlice = createSlice({
  name: "tournaments",
  initialState: {
    current: null,
    all: [],
    currentVersion: 0,
    lastUpdated: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournament.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTournament.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
        state.currentVersion = action.payload.version || 0;
        state.lastUpdated = action.payload.lastUpdated || null;
      })
      .addCase(fetchTournamentWithUpdates.fulfilled, (state, action) => {
        if (action.payload.hasUpdates) {
          state.current = action.payload.tournament;
          state.currentVersion = action.payload.currentVersion;
          state.lastUpdated = action.payload.lastUpdated;
        }
      })
      .addCase(fetchTournament.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchAllTournaments.fulfilled, (state, action) => {
        state.all = action.payload;
      })
      .addCase(createTournament.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = {
          _id: action.payload.tournamentId,
          ...action.payload,
        };
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(reportMatchResult.fulfilled, (state, action) => {
        const { match, tournamentVersion } = action.payload;
        if (state.current) {
          // Update matches in knockout rounds
          if (state.current.knockoutRounds) {
            state.current.knockoutRounds.forEach(round => {
              round.matches = round.matches.map(m => m._id === match._id ? match : m);
            });
          }
          
          // Update matches in wildcard rounds
          if (state.current.wildcardRounds) {
            state.current.wildcardRounds.forEach(round => {
              round.matches = round.matches.map(m => m._id === match._id ? match : m);
            });
          }
          
          // Update semifinal matches
          if (state.current.semifinalMatches) {
            state.current.semifinalMatches = state.current.semifinalMatches.map(m => 
              m._id === match._id ? match : m
            );
          }
          
          // Update final match
          if (state.current.finalMatch && state.current.finalMatch._id === match._id) {
            state.current.finalMatch = match;
          }
          
          // Update version
          if (tournamentVersion) {
            state.currentVersion = tournamentVersion;
            state.lastUpdated = new Date().toISOString();
          }
        }
      })
      .addCase(completeKnockoutRound.fulfilled, (state, action) => {
        console.log("Redux: completeKnockoutRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(completeKnockoutRound.rejected, (state, action) => {
        console.error("Redux: completeKnockoutRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(completeWildcardRound.fulfilled, (state, action) => {
        console.log("Redux: completeWildcardRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(completeWildcardRound.rejected, (state, action) => {
        console.error("Redux: completeWildcardRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(startNextKnockoutRound.fulfilled, (state, action) => {
        console.log("Redux: startNextKnockoutRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(startNextKnockoutRound.rejected, (state, action) => {
        console.error("Redux: startNextKnockoutRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(startNextWildcardRound.fulfilled, (state, action) => {
        console.log("Redux: startNextWildcardRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(startNextWildcardRound.rejected, (state, action) => {
        console.error("Redux: startNextWildcardRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(startSemifinalRound.fulfilled, (state, action) => {
        console.log("Redux: startSemifinalRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(startSemifinalRound.rejected, (state, action) => {
        console.error("Redux: startSemifinalRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(completeSemifinalRound.fulfilled, (state, action) => {
        console.log("Redux: completeSemifinalRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(completeSemifinalRound.rejected, (state, action) => {
        console.error("Redux: completeSemifinalRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(completeFinalRound.fulfilled, (state, action) => {
        console.log("Redux: completeFinalRound.fulfilled", action.payload);
        if (action.payload.tournament) {
          state.current = action.payload.tournament;
        }
      })
      .addCase(completeFinalRound.rejected, (state, action) => {
        console.error("Redux: completeFinalRound.rejected", action.payload);
        state.error = action.payload;
      })
      .addCase(deleteTournament.fulfilled, (state, action) => {
        state.all = state.all.filter(tournament => tournament._id !== action.payload.tournamentId);
      });
  },
});

export const { clearError } = tournamentSlice.actions;
export default tournamentSlice.reducer;