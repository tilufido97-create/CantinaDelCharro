import { useEffect, useState } from 'react';
import { seedDatabase } from '../services/seederService';

export const useFirebaseInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Firebase Realtime Database
        await seedDatabase();
        
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  return { isInitialized, isLoading, error };
};