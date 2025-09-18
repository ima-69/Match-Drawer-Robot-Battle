import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams } from "../store/slices/teamSlice";
import { fetchTournament, fetchAllTournaments } from "../store/slices/tournamentSlice";
import TournamentTree from "../components/TournamentTree";
import { useRealTimeUpdates } from "../hooks/useRealTimeUpdates";

function ViewerPage() {
  const dispatch = useDispatch();
  const { list: teams, status: teamsStatus } = useSelector((state) => state.teams);
  const { all: tournaments, current: currentTournament, loading: tournamentLoading, currentVersion, lastUpdated } = useSelector((state) => state.tournaments);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchAllTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTournamentId) {
      dispatch(fetchTournament(selectedTournamentId));
    }
  }, [selectedTournamentId, dispatch]);

  // Enable real-time updates when a tournament is selected
  const { isPolling } = useRealTimeUpdates(selectedTournamentId, !!selectedTournamentId);

  const handleTournamentChange = (e) => {
    setSelectedTournamentId(e.target.value);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Tournament Viewer</h2>
        
        {/* Real-time Status */}
        {selectedTournamentId && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-blue-700">
                  {isPolling ? 'Live Updates Active' : 'Updates Paused'}
                </span>
              </div>
              <div className="text-xs text-blue-600">
                Version: {currentVersion} | Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        )}
        
        {/* Tournament Selection */}
        <div className="mb-6">
          <label htmlFor="tournament-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Tournament to View:
          </label>
          <select
            id="tournament-select"
            value={selectedTournamentId}
            onChange={handleTournamentChange}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a tournament...</option>
            {tournaments.map((tournament) => (
              <option key={tournament._id} value={tournament._id}>
                {tournament.name} ({tournament.teams?.length || 0} teams)
              </option>
            ))}
          </select>
        </div>

        {/* Tournament Tree Display */}
        {selectedTournamentId && (
          <div className="mt-8">
            {tournamentLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading tournament data...</p>
              </div>
            ) : currentTournament && Object.keys(currentTournament).length > 0 ? (
              <TournamentTree tournament={currentTournament} />
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>No tournament data available</p>
              </div>
            )}
          </div>
        )}

        {/* Teams Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">All Teams</h3>
          {teamsStatus === "loading" ? (
            <p>Loading teams...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {teams.map((team) => (
                <div key={team._id} className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
                  <img src={team.logoUrl} alt={team.name} className="w-20 h-20 rounded-full"/>
                  <p className="mt-2 text-white">{team.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewerPage;