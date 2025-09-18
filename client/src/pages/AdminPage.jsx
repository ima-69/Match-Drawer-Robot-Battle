import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTeam, deleteTeam, fetchTeams } from "../store/slices/teamSlice";
import { createTournament, deleteTournament, fetchAllTournaments } from "../store/slices/tournamentSlice";
import { useNavigate } from "react-router-dom";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", type = "danger" }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const buttonClass = type === "danger" 
    ? "bg-red-600 hover:bg-red-700 text-white" 
    : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                type === "danger" ? "bg-red-600" : "bg-blue-600"
              }`}>
                {type === "danger" ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            
            <p className="text-gray-300 mb-6">{message}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg transition-colors ${buttonClass}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [logo, setLogo] = useState(null);
  const [tournamentName, setTournamentName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const { list, status: teamsStatus } = useSelector((state) => state.teams);
  const { current: currentTournament, status, all: tournaments } = useSelector(
    (state) => state.tournaments
  );

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchAllTournaments());
  }, [dispatch]);

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    dispatch(addTeam({ name: teamName, logo }))
      .then(() => {
        // Refetch teams to ensure we have the latest data
        dispatch(fetchTeams());
        setTeamName("");
        setLogo(null);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSuccessMessage(`Team "${teamName}" added successfully!`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Error adding team:", error);
      });
  };

  const handleTournamentSubmit = (e) => {
    e.preventDefault();
    if (selectedTeams.length < 2) {
      setSuccessMessage("Please select at least 2 teams for the tournament");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    dispatch(createTournament({ name: tournamentName, selectedTeamIds: selectedTeams }))
      .then((action) => {
        if (action.payload && action.payload.tournamentId) {
          // Refetch tournaments to ensure we have the latest data
          dispatch(fetchAllTournaments());
          setShowTeamSelection(false);
          setSelectedTeams([]);
          setTournamentName("");
          navigate(`/bracket/${action.payload.tournamentId}`);
        }
      })
      .catch((error) => {
        console.error("Error creating tournament:", error);
      });
  };

  const handleDeleteTeam = (teamId, teamName) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Team",
      message: `Are you sure you want to delete "${teamName}"? This action cannot be undone.`,
      onConfirm: () => {
        dispatch(deleteTeam(teamId));
        setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger" });
      },
      type: "danger"
    });
  };

  const handleDeleteTournament = (tournamentId, tournamentName) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Tournament",
      message: `Are you sure you want to delete "${tournamentName}"? This will also delete all associated matches and cannot be undone.`,
      onConfirm: () => {
        dispatch(deleteTournament(tournamentId));
        setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger" });
      },
      type: "danger"
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger" });
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAllTeams = () => {
    if (selectedTeams.length === list.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(list.map(team => team._id));
    }
  };

  const handleStartTournamentCreation = () => {
    if (list.length < 2) {
      setSuccessMessage("You need at least 2 teams to create a tournament");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    setShowTeamSelection(true);
  };

  const handleCancelTeamSelection = () => {
    setShowTeamSelection(false);
    setSelectedTeams([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-gray-400 text-lg">Manage teams and create tournaments</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Teams Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Team Management</h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {list.length} teams
            </span>
          </div>

          <form onSubmit={handleTeamSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Logo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setLogo(e.target.files[0])}
                  accept="image/*"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={teamsStatus === "loading"}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {teamsStatus === "loading" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Team
                </>
              )}
            </button>
          </form>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-green-400">✅</div>
                <p className="text-green-400 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Teams List */}
          {list.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Current Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((team) => (
                  <div key={team._id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 group hover:border-red-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {team.logoUrl && (
                          <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div>
                          <h4 className="font-medium text-white">{team.name}</h4>
                          <p className="text-sm text-gray-400">Team</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTeam(team._id, team.name)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200"
                        title="Delete team"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tournament Creation Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Create Tournament</h2>
          </div>

          {list.length < 2 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Need More Teams</h3>
              <p className="text-gray-400">Add at least 2 teams to create a tournament</p>
            </div>
          ) : !showTeamSelection ? (
            <div className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Create Tournament</h3>
                <p className="text-gray-400">You have {list.length} teams available</p>
              </div>
              <button
                onClick={handleStartTournamentCreation}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Select Teams & Create Tournament
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Select Teams for Tournament</h3>
                <button
                  onClick={handleCancelTeamSelection}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleTournamentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tournament Name</label>
                  <input
                    type="text"
                    placeholder="Enter tournament name"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">Available Teams</h4>
                    <button
                      type="button"
                      onClick={handleSelectAllTeams}
                      className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      {selectedTeams.length === list.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {list.map((team) => (
                      <div
                        key={team._id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTeams.includes(team._id)
                            ? "border-purple-500 bg-purple-900 bg-opacity-30"
                            : "border-gray-600 bg-gray-700 hover:border-gray-500"
                        }`}
                        onClick={() => handleTeamToggle(team._id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedTeams.includes(team._id)
                              ? "border-purple-500 bg-purple-500"
                              : "border-gray-400"
                          }`}>
                            {selectedTeams.includes(team._id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {team.logoUrl && (
                            <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
                          )}
                          <span className="font-medium text-white">{team.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-400">
                    {selectedTeams.length} of {list.length} teams selected
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || selectedTeams.length < 2}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Tournament ({selectedTeams.length} teams)
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {currentTournament && (
            <div className="mt-6 p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="text-green-400 font-medium">Active Tournament</p>
                  <p className="text-white">{currentTournament.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tournaments Management Section */}
        {tournaments.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Tournament Management</h2>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {tournaments.length} tournaments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournaments.map((tournament) => (
                <div key={tournament._id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 group hover:border-red-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{tournament.name}</h4>
                      <p className="text-sm text-gray-400">
                        Created {new Date(tournament.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/bracket/${tournament._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        title="View tournament"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTournament(tournament._id, tournament.name)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200"
                        title="Delete tournament"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
      />
    </div>
  );
}

export default AdminPage;