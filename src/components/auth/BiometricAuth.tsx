import React, { useState, useEffect } from 'react';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onSuccess,
  onError
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
      } catch (error) {
        setIsSupported(false);
      }
    }
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      if (!isSupported) {
        throw new Error('Biometric authentication not available on this device');
      }

      // This would integrate with Internet Identity's biometric flow
      // For now, we'll simulate the check
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required'
        } as any
      });

      if (credential) {
        onSuccess();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Biometric authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleBiometricAuth}
      disabled={isAuthenticating}
      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
    >
      {isAuthenticating ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          Authenticating...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04c.026-.885.086-1.8.183-2.749m.183-2.748C7.744 9.974 9.939 7.547 12.5 7.547c2.56 0 4.756 2.427 5.831 5.487m.183 2.748c-.026.885-.086 1.8-.183 2.749m-2.753-9.57c1.744 2.772 2.753 6.054 2.753 9.57m-5.5 0a25.15 25.15 0 01-4.244 0m4.244 0a25.15 25.15 0 00-4.244 0" />
          </svg>
          Use Biometric
        </div>
      )}
    </button>
  );
};

