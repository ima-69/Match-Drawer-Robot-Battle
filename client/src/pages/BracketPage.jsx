import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTournament, reportMatchResult, completeKnockoutRound, completeWildcardRound, startNextKnockoutRound, startNextWildcardRound, startSemifinalRound, completeSemifinalRound, completeFinalRound } from "../store/slices/tournamentSlice";
import { useParams } from "react-router-dom";

function BracketPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.tournaments);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isCompletingRound, setIsCompletingRound] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTournament(id));
    }
  }, [id, dispatch]);

  const handlePickWinner = async (matchId, winnerId) => {
    try {
      await dispatch(reportMatchResult({ tournamentId: id, matchId, winnerId }));
      dispatch(fetchTournament(id));
      setIsDrawerOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error("Error reporting match result:", error);
    }
  };

  const handleCompleteKnockoutRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(completeKnockoutRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error completing knockout round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleCompleteWildcardRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(completeWildcardRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error completing wildcard round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleStartNextKnockoutRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(startNextKnockoutRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error starting next knockout round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleStartNextWildcardRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(startNextWildcardRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error starting next wildcard round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleStartSemifinalRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(startSemifinalRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error starting semifinal round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleCompleteSemifinalRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(completeSemifinalRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error completing semifinal round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleCompleteFinalRound = async () => {
    if (isCompletingRound) return;
    
    try {
      setIsCompletingRound(true);
      await dispatch(completeFinalRound(id));
      dispatch(fetchTournament(id));
    } catch (error) {
      console.error("Error completing final round:", error);
    } finally {
      setIsCompletingRound(false);
    }
  };

  const openMatchDrawer = (match) => {
    setSelectedMatch(match);
    setIsDrawerOpen(true);
  };

  if (!current) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">Loading Tournament...</p>
      </div>
    </div>
  );

  const MatchCard = ({ match, matchNumber, roundType }) => {
    const isCompleted = match.status === "completed";
    const isPending = match.status === "pending";
    const isBye = match.players.length === 1;
    
    return (
      <div 
        className={`relative bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-lg shadow-lg border transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm
          ${isCompleted ? 'border-green-500 shadow-green-500/20' : 
            isPending ? 'border-yellow-500 shadow-yellow-500/20' : 
            isBye ? 'border-blue-500 shadow-blue-500/20' : 
            'border-gray-600 shadow-gray-600/20'}`}
        onClick={() => openMatchDrawer(match)}
      >
        {/* Match Number */}
        <div className="absolute top-1 left-1">
          <span className="text-xs text-gray-400 bg-gray-700 px-1 py-0.5 rounded text-xs">Match {matchNumber}</span>
        </div>
        
        {/* Round Type Badge */}
        <div className="absolute top-1 right-1">
          <span className={`text-xs px-1 py-0.5 rounded text-xs ${
            roundType === 'knockout' ? 'bg-blue-600 text-white' :
            roundType === 'wildcard' ? 'bg-yellow-600 text-white' :
            'bg-purple-600 text-white'
          }`}>
            {roundType === 'wildcard' ? '3v3' : '1v1'}
          </span>
        </div>
        
        <div className="space-y-1 mt-4">
          {match.players.map((player, index) => (
            <div key={player._id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded text-sm">
          <div className="flex items-center gap-2">
                {player.logo && (
                  <img src={player.logo} alt={player.name} className="w-5 h-5 rounded-full border border-gray-600" />
                )}
                <span className="text-white font-medium text-sm truncate">{player.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {isCompleted && match.winner === player._id && (
                  <div className="text-green-400 text-sm">👑</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {isBye && (
          <div className="mt-2 text-center">
            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded text-xs">Direct Advance</span>
          </div>
        )}
        
        {roundType === 'wildcard' && !isBye && (
          <div className="mt-2 text-center">
            <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded text-xs">3-Player Match</span>
          </div>
        )}
      </div>
    );
  };

  const RoundSection = ({ title, rounds, roundType, color, isCurrentRound, onCompleteRound }) => {
    const currentRound = rounds && rounds.length > 0 ? rounds[rounds.length - 1] : null;
    const isCompleted = currentRound ? currentRound.isCompleted : false;
    
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border ${color} backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-500')}`}></div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded text-xs">
              Round {currentRound ? currentRound.roundNumber : 0}
            </span>
            {isCompleted && (
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                ✓ Completed
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentRound && currentRound.matches && currentRound.matches.length > 0 ? (
            currentRound.matches.map((match, index) => (
              <MatchCard key={match._id} match={match} matchNumber={index + 1} roundType={roundType} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-6">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm">No matches yet</p>
            </div>
          )}
        </div>
        
        {/* Complete Round Button */}
        {isCurrentRound && !isCompleted && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="text-center">
              <button
                onClick={onCompleteRound}
                disabled={isCompletingRound}
                className={`${isCompletingRound ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transform hover:scale-105 text-sm`}
              >
                {isCompletingRound ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete {title} Round
                  </>
                )}
              </button>
            </div>
          </div>
        )}
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{current.name}</h1>
              <p className="text-gray-300 text-sm">Tournament Bracket System</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium shadow-md
                ${current.currentRound === 'knockout' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                  current.currentRound === 'wildcard' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
                  current.currentRound === 'semifinal' ? 'bg-gradient-to-r from-purple-600 to-purple-700' :
                  'bg-gradient-to-r from-indigo-600 to-indigo-700'}`}>
                {current.currentRound?.charAt(0).toUpperCase() + current.currentRound?.slice(1)}
              </div>
            </div>
          </div>
            </div>
          </div>

      {/* Tournament Stats */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 mb-6 shadow-lg backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{current.teams?.length || 0}</div>
              <div className="text-xs text-blue-200">Total Teams</div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {current.knockoutRounds?.length || 0}
              </div>
              <div className="text-xs text-green-200">Knockout Rounds</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {current.wildcardRounds?.length || 0}
              </div>
              <div className="text-xs text-yellow-200">Wildcard Rounds</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {current.semifinalMatches?.length || 0}
              </div>
              <div className="text-xs text-purple-200">Semifinal Matches</div>
            </div>
          </div>
        </div>

        {/* Tournament Bracket - Sequential Progression */}
        <div className="space-y-6">
          {/* Current Round Display */}
          {current?.currentRound === "knockout" && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-blue-500">
              <h2 className="text-lg font-bold text-white mb-4 text-center">
                Knockout Round {current.currentKnockoutRound}
              </h2>
              
              <RoundSection
                title={`Knockout Round ${current.currentKnockoutRound}`}
                rounds={current.knockoutRounds ? [current.knockoutRounds[current.currentKnockoutRound - 1]] : []}
                roundType="knockout"
                color="border-blue-500"
                isCurrentRound={true}
                onCompleteRound={handleCompleteKnockoutRound}
              />
              
              {/* Show start next round button if teams are stored */}
              {current.nextKnockoutTeams && current.nextKnockoutTeams.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleStartNextKnockoutRound}
                    disabled={isCompletingRound}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
                  >
                    {isCompletingRound ? "Starting..." : `Start Next Knockout Round (${current.nextKnockoutTeams.length} teams)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {current?.currentRound === "wildcard" && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-yellow-500">
              <h2 className="text-lg font-bold text-white mb-4 text-center">
                Wildcard Round {current.currentWildcardRound}
              </h2>
              
              <RoundSection
                title={`Wildcard Round ${current.currentWildcardRound}`}
                rounds={current.wildcardRounds ? [current.wildcardRounds[current.currentWildcardRound - 1]] : []}
                roundType="wildcard"
                color="border-yellow-500"
                isCurrentRound={true}
                onCompleteRound={handleCompleteWildcardRound}
              />
              
              {/* Show start next round button if teams are stored */}
              {current.nextWildcardTeams && current.nextWildcardTeams.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleStartNextWildcardRound}
                    disabled={isCompletingRound}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
                  >
                    {isCompletingRound ? "Starting..." : `Start Next Wildcard Round (${current.nextWildcardTeams.length} teams)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {current?.currentRound === "semifinal" && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-purple-500">
              <h2 className="text-lg font-bold text-white mb-4 text-center">
                Semifinal Round
              </h2>
              
              {/* Show start semifinal button if not started yet */}
              {(!current.semifinalMatches || current.semifinalMatches.length === 0) && (
                <div className="text-center mb-4">
                  <button
                    onClick={handleStartSemifinalRound}
                    disabled={isCompletingRound}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
                  >
                    {isCompletingRound ? "Starting..." : "Start Semifinal Round"}
                  </button>
                </div>
              )}
              
              {current.semifinalMatches && current.semifinalMatches.length > 0 && (
                <RoundSection
                  title="Semifinal"
                  rounds={[{ matches: current.semifinalMatches, isCompleted: false }]}
                  roundType="semifinal"
                  color="border-purple-500"
                  isCurrentRound={true}
                  onCompleteRound={handleCompleteSemifinalRound}
                />
              )}
            </div>
          )}

          {current?.currentRound === "grandfinal" && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-red-500">
              <h2 className="text-lg font-bold text-white mb-4 text-center">
                Grand Final
              </h2>
              
              {current.finalMatch && (
                <RoundSection
                  title="Grand Final"
                  rounds={[{ matches: [current.finalMatch], isCompleted: false }]}
                  roundType="final"
                  color="border-red-500"
                  isCurrentRound={true}
                  onCompleteRound={handleCompleteFinalRound}
                />
              )}
            </div>
          )}

          {current?.currentRound === "completed" && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-yellow-500 text-center">
              <h2 className="text-xl font-bold text-yellow-300 mb-3">
                🏆 Tournament Completed! 🏆
              </h2>
              <p className="text-sm text-white">
                Congratulations to the champion!
              </p>
            </div>
          )}
            </div>
          </div>

        {/* Action Buttons Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg backdrop-blur-sm border border-gray-600">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Tournament Actions</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {/* Start Next Knockout Round */}
            {current?.nextKnockoutTeams && current.nextKnockoutTeams.length > 0 && (
              <button
                onClick={handleStartNextKnockoutRound}
                disabled={isCompletingRound}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Next Knockout Round ({current.nextKnockoutTeams.length} teams)
              </button>
            )}

            {/* Start Next Wildcard Round */}
            {current?.nextWildcardTeams && current.nextWildcardTeams.length > 0 && (
              <button
                onClick={handleStartNextWildcardRound}
                disabled={isCompletingRound}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Next Wildcard Round ({current.nextWildcardTeams.length} teams)
              </button>
            )}

            {/* Start Semifinal Round */}
            {current?.wildcardFinalWinner && current?.knockoutFinalLoser && current?.currentRound === "semifinal" && (
              <button
                onClick={handleStartSemifinalRound}
                disabled={isCompletingRound}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Semifinal Round
              </button>
            )}

            {/* Show message if no actions available */}
            {(!current?.nextKnockoutTeams || current.nextKnockoutTeams.length === 0) && 
             (!current?.nextWildcardTeams || current.nextWildcardTeams.length === 0) && 
             (!current?.wildcardFinalWinner || !current?.knockoutFinalLoser || current?.currentRound !== "semifinal") && (
              <div className="text-gray-400 text-sm text-center">
                Complete current round to unlock next actions
              </div>
            )}
          </div>
        </div>

      {/* Match Drawer */}
      {isDrawerOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-600">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Select Winner</h3>
            <div className="space-y-4">
              {selectedMatch.players.map((player) => (
                <button
                  key={player._id}
                  onClick={() => handlePickWinner(selectedMatch._id, player._id)}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  {player.logo && (
                    <img src={player.logo} alt={player.name} className="w-10 h-10 rounded-full border-2 border-gray-500" />
                  )}
                  <span className="text-white font-medium text-lg">{player.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setSelectedMatch(null);
              }}
              className="w-full mt-6 p-4 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BracketPage;