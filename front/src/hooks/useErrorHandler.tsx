import { useState } from 'react';
import { translateHttpError, translateBackendError } from '../utils/errorMessages';

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = (error: any) => {
    console.error('Erreur:', error);
    
    let translatedError: string;
    
    if (typeof error === 'string') {
      translatedError = translateBackendError(error);
    } else if (error.message) {
      translatedError = translateBackendError(error.message);
    } else {
      translatedError = translateHttpError(error);
    }
    
    setError(translatedError);
    setLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const executeWithErrorHandling = async (asyncFunction: () => Promise<any>): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setLoading(false);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  return {
    error,
    loading,
    handleError,
    clearError,
    executeWithErrorHandling,
    setLoading,
    setError
  };
};
