import React from 'react';

const TournamentTree = ({ tournament }) => {
  if (!tournament) return <div>No tournament data available</div>;

  const renderMatchNode = (match, index, isFinal = false) => {
    const isCompleted = match.status === 'completed';
    const hasWinner = match.winner;
    
    return (
      <div key={match._id || index} className="flex flex-col items-center relative">
        {/* Match Card */}
        <div className={`
          relative p-2 rounded-lg border min-w-[100px] text-center shadow-md transition-all duration-300
          ${isCompleted 
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
          }
          ${hasWinner ? 'ring-2 ring-green-300' : ''}
          ${isFinal ? 'scale-105 shadow-lg' : ''}
        `}>
          {/* Round Type Badge */}
          <div className={`
            absolute -top-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold
            ${isFinal 
              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
              : match.roundType === 'knockout' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                : 'bg-gradient-to-r from-purple-400 to-purple-500 text-white'
            }
          `}>
            {isFinal ? 'FINAL' : match.roundType?.toUpperCase() || 'MATCH'}
          </div>

          {/* Teams */}
          <div className="space-y-1 mt-1">
            {match.players?.map((player, playerIndex) => (
              <div key={player._id || playerIndex} className={`
                px-2 py-1 rounded text-xs font-medium transition-all duration-200
                ${match.winner?._id === player._id 
                  ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-600 font-bold' 
                  : match.losers?.some(loser => loser._id === player._id) 
                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700' 
                    : 'bg-white text-gray-700'
                }
              `}>
                <div className="flex items-center justify-center space-x-1">
                  {match.winner?._id === player._id && (
                    <span className="text-green-600 text-xs">👑</span>
                  )}
                  <span className="truncate">{player.name || `Player ${playerIndex + 1}`}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Winner Display */}
          {isCompleted && hasWinner && (
            <div className="mt-1 p-1 bg-gradient-to-r from-green-200 to-green-300 rounded text-xs">
              <div className="text-xs font-bold text-green-600 flex items-center justify-center space-x-1">
                <span>🏆</span>
                <span className="truncate">{match.winner?.name}</span>
              </div>
            </div>
          )}

          {/* Match History - Compact */}
          {match.history && match.history.length > 0 && (
            <div className="mt-1 p-1 bg-gray-50 rounded text-xs">
              <div className="text-xs text-gray-600 mb-0.5 font-medium">History:</div>
              <div className="space-y-0.5 max-h-12 overflow-y-auto">
                {match.history.slice(-2).map((entry, idx) => (
                  <div key={idx} className="text-xs text-gray-500">
                    <span className="text-gray-400 text-xs">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="ml-1 truncate">{entry.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className={`
            absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 px-1 py-0.5 rounded-full text-xs font-medium
            ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}
          `}>
            {isCompleted ? '✓' : '⏳'}
          </div>
        </div>
      </div>
    );
  };

  const renderRound = (round, roundType, roundNumber) => {
    if (!round || !round.matches || round.matches.length === 0) return null;

    return (
      <div key={`${roundType}-${roundNumber}`} className="mb-8">
        {/* Round Header */}
        <div className="text-center mb-4">
          <div className={`
            inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md
            ${roundType === 'knockout' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
            }
          `}>
            <span className="mr-1 text-sm">
              {roundType === 'knockout' ? '🥊' : '🎯'}
            </span>
            {roundType === 'knockout' ? 'Knockout' : 'Wildcard'} Round {roundNumber}
            <span className="ml-1 text-sm">
              {round.isCompleted ? '✅' : '⏳'}
            </span>
          </div>
        </div>
        
        {/* Matches - Horizontal Layout */}
        <div className="flex flex-wrap justify-center gap-3">
          {round.matches.map((match, index) => renderMatchNode(match, index))}
        </div>
      </div>
    );
  };

  const renderFinalRounds = () => {
    const finalRounds = [];
    
    // Semifinal matches
    if (tournament.semifinalMatches && tournament.semifinalMatches.length > 0) {
      finalRounds.push(
        <div key="semifinal" className="mb-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <span className="mr-1 text-sm">⚔️</span>
              Semifinal
              <span className="ml-1 text-sm">
                {tournament.semifinalMatches.every(m => m.status === 'completed') ? '✅' : '⏳'}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            {tournament.semifinalMatches.map((match, index) => renderMatchNode(match, index))}
          </div>
        </div>
      );
    }

    // Final match
    if (tournament.finalMatch) {
      finalRounds.push(
        <div key="final" className="mb-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-5 py-2 rounded-full text-base font-bold shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
              <span className="mr-1">🏆</span>
              Grand Final
              <span className="ml-1">
                {tournament.finalMatch.status === 'completed' ? '✅' : '⏳'}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            {renderMatchNode(tournament.finalMatch, 0, true)}
          </div>
        </div>
      );
    }

    return finalRounds;
  };

  const renderStoredTeams = () => {
    const storedTeams = [];
    
    if (tournament.nextKnockoutTeams && tournament.nextKnockoutTeams.length > 0) {
      storedTeams.push(
        <div key="next-knockout" className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
          <h4 className="font-bold text-blue-800 mb-2 flex items-center text-sm">
            <span className="mr-1">⏭️</span>
            Next Knockout Teams ({tournament.nextKnockoutTeams.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {tournament.nextKnockoutTeams.map((team, index) => (
              <span key={team._id || index} className="px-2 py-1 bg-blue-200 rounded-full text-xs font-medium text-blue-800">
                {team.name}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (tournament.nextWildcardTeams && tournament.nextWildcardTeams.length > 0) {
      storedTeams.push(
        <div key="next-wildcard" className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm">
          <h4 className="font-bold text-purple-800 mb-2 flex items-center text-sm">
            <span className="mr-1">⏭️</span>
            Next Wildcard Teams ({tournament.nextWildcardTeams.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {tournament.nextWildcardTeams.map((team, index) => (
              <span key={team._id || index} className="px-2 py-1 bg-purple-200 rounded-full text-xs font-medium text-purple-800">
                {team.name}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (tournament.knockoutFinalWinner || tournament.knockoutFinalLoser || tournament.wildcardFinalWinner) {
      storedTeams.push(
        <div key="final-teams" className="mb-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
          <h4 className="font-bold text-green-800 mb-2 flex items-center text-sm">
            <span className="mr-1">👑</span>
            Final Teams
          </h4>
          <div className="space-y-2">
            {tournament.knockoutFinalWinner && (
              <div className="px-2 py-1 bg-green-200 rounded-full text-xs font-medium text-green-800">
                <strong>Knockout Winner:</strong> {tournament.knockoutFinalWinner.name}
              </div>
            )}
            {tournament.knockoutFinalLoser && (
              <div className="px-2 py-1 bg-green-200 rounded-full text-xs font-medium text-green-800">
                <strong>Knockout Final Loser:</strong> {tournament.knockoutFinalLoser.name}
              </div>
            )}
            {tournament.wildcardFinalWinner && (
              <div className="px-2 py-1 bg-green-200 rounded-full text-xs font-medium text-green-800">
                <strong>Wildcard Winner:</strong> {tournament.wildcardFinalWinner.name}
              </div>
            )}
          </div>
        </div>
      );
    }

    return storedTeams.length > 0 ? (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Stored Teams for Next Rounds</h3>
        {storedTeams}
      </div>
    ) : null;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Tournament Header */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{tournament.name}</h1>
          <div className="flex items-center justify-center space-x-3 text-sm">
            <div className="px-3 py-1 bg-blue-100 rounded-full text-blue-800 font-medium">
              Current Round: <span className="font-bold capitalize">{tournament.currentRound}</span>
            </div>
            <div className={`px-3 py-1 rounded-full font-medium ${
              tournament.currentRound === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {tournament.currentRound === 'completed' ? '🏆 Complete' : '⏳ In Progress'}
            </div>
          </div>
        </div>
      </div>

      {/* Stored Teams Section */}
      {renderStoredTeams()}

      {/* Knockout Rounds */}
      {tournament.knockoutRounds && tournament.knockoutRounds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <span className="mr-2">🥊</span>
            Knockout Rounds
          </h2>
          {tournament.knockoutRounds.map((round) => 
            renderRound(round, 'knockout', round.roundNumber)
          )}
        </div>
      )}

      {/* Wildcard Rounds */}
      {tournament.wildcardRounds && tournament.wildcardRounds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <span className="mr-2">🎯</span>
            Wildcard Rounds
          </h2>
          {tournament.wildcardRounds.map((round) => 
            renderRound(round, 'wildcard', round.roundNumber)
          )}
        </div>
      )}

      {/* Final Rounds */}
      {renderFinalRounds()}

      {/* Tournament Complete */}
      {tournament.currentRound === 'completed' && tournament.finalMatch && (
        <div className="text-center p-6 bg-gradient-to-r from-green-100 to-green-200 rounded-xl shadow-lg border border-green-300">
          <h2 className="text-2xl font-bold text-green-800 mb-3 flex items-center justify-center">
            <span className="mr-2">🏆</span>
            Tournament Complete!
          </h2>
          <div className="text-lg text-green-700 font-medium">
            Champion: <span className="font-bold text-green-900">{tournament.finalMatch.winner?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentTree;
