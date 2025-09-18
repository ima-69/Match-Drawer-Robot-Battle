import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournamentWithUpdates } from '../store/slices/tournamentSlice';

export const useRealTimeUpdates = (tournamentId, enabled = true) => {
  const dispatch = useDispatch();
  const { currentVersion, lastUpdated } = useSelector((state) => state.tournaments);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !tournamentId) return;

    // Function to check for updates
    const checkForUpdates = async () => {
      try {
        await dispatch(fetchTournamentWithUpdates({ 
          id: tournamentId, 
          version: currentVersion 
        }));
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Check for updates immediately
    checkForUpdates();

    // Set up polling interval (every 2 seconds)
    intervalRef.current = setInterval(checkForUpdates, 2000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, tournamentId, currentVersion, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentVersion,
    lastUpdated,
    isPolling: intervalRef.current !== null
  };
};
