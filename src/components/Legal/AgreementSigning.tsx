// src/components/Legal/AgreementSigning.tsx
import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';

interface AgreementSigningProps {
  agreementId: string;
  onSigned: (signatureHash: string) => void;
  onError: (error: string) => void;
}

// Type definitions matching the canister interface
interface LegalAgreement {
  id: string;
  version: string;
  type: string;
  title: string;
  content: string;
  hash: string;
  governing_law: string;
  jurisdiction: string;
  effective_date: bigint;
  expiration_date?: bigint;
  parties: Principal[];
  signatures: Signature[];
  status: { Draft?: null; Active?: null; Amended?: null; Terminated?: null };
  parent_agreement?: string;
}

interface Signature {
  party: Principal;
  timestamp: bigint;
  signature_hash: string;
  method: { InternetIdentity?: null; DigitalCertificate?: null; Biometric?: null };
  ip_address?: string;
  user_agent?: string;
}

const AgreementSigning: React.FC<AgreementSigningProps> = ({ 
  agreementId, 
  onSigned, 
  onError 
}) => {
  const [agreement, setAgreement] = useState<LegalAgreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'InternetIdentity' | 'DigitalCertificate' | 'Biometric'>('InternetIdentity');

  useEffect(() => {
    loadAgreement();
  }, [agreementId]);

  const loadAgreement = async () => {
    try {
      // This would call the legal_agreements canister
      // For now, using mock data structure
      // const legalAgreements = await getLegalAgreementsActor();
      // const agreementData = await legalAgreements.getAgreement(agreementId);
      
      // Mock agreement for demonstration
      const mockAgreement: LegalAgreement = {
        id: agreementId,
        version: '1.0',
        type: 'ArbitrationClause',
        title: 'Standard Arbitration Agreement',
        content: standardArbitrationContent,
        hash: 'mock_hash',
        governing_law: 'United Nations Convention on Contracts for the International Sale of Goods (CISG)',
        jurisdiction: 'International',
        effective_date: BigInt(Date.now() * 1_000_000),
        parties: [],
        signatures: [],
        status: { Draft: null }
      };
      
      setAgreement(mockAgreement);
    } catch (error: any) {
      onError(`Failed to load agreement: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAgreement = async () => {
    setIsSigning(true);
    try {
      // This would call the legal_agreements canister
      // const legalAgreements = await getLegalAgreementsActor();
      // const result = await legalAgreements.signAgreement(agreementId, signatureMethod);
      
      // Mock result for demonstration
      const mockResult = {
        success: true,
        signature_hash: `sig_${Date.now()}`,
        error: null
      };
      
      if (mockResult.success && mockResult.signature_hash) {
        onSigned(mockResult.signature_hash);
      } else {
        onError(mockResult.error || 'Signing failed');
      }
    } catch (error: any) {
      onError(`Signing error: ${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const renderLegalClauses = () => {
    if (!agreement) return null;

    return (
      <div className="legal-clauses space-y-4">
        <h4 className="text-lg font-semibold">Key Legal Clauses</h4>
        <div className="clause-section bg-gray-50 p-4 rounded">
          <h5 className="font-medium mb-2">Arbitration Agreement</h5>
          <p className="text-sm text-gray-700">
            All disputes shall be resolved through binding arbitration administered by Arbitra Platform.
          </p>
        </div>
        <div className="clause-section bg-gray-50 p-4 rounded">
          <h5 className="font-medium mb-2">Governing Law</h5>
          <p className="text-sm text-gray-700">
            This agreement shall be governed by: {agreement.governing_law}
          </p>
        </div>
        <div className="clause-section bg-gray-50 p-4 rounded">
          <h5 className="font-medium mb-2">Jurisdiction</h5>
          <p className="text-sm text-gray-700">
            Legal seat of arbitration: {agreement.jurisdiction}
          </p>
        </div>
      </div>
    );
  };

  const renderSignatureOptions = () => {
    return (
      <div className="signature-options space-y-4">
        <h5 className="font-semibold">Select Signature Method</h5>
        <div className="signature-methods space-y-3">
          <label className="signature-method flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="InternetIdentity"
              checked={signatureMethod === 'InternetIdentity'}
              onChange={(e) => setSignatureMethod(e.target.value as any)}
              className="mt-1 mr-3"
            />
            <div className="method-info flex-1">
              <div className="method-name font-medium">Internet Identity</div>
              <div className="method-description text-sm text-gray-600">
                Secure cryptographic signature using your Internet Identity
              </div>
            </div>
          </label>

          <label className="signature-method flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="DigitalCertificate"
              checked={signatureMethod === 'DigitalCertificate'}
              onChange={(e) => setSignatureMethod(e.target.value as any)}
              className="mt-1 mr-3"
            />
            <div className="method-info flex-1">
              <div className="method-name font-medium">Digital Certificate</div>
              <div className="method-description text-sm text-gray-600">
                Professional digital certificate (eIDAS compliant)
              </div>
            </div>
          </label>

          <label className="signature-method flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="Biometric"
              checked={signatureMethod === 'Biometric'}
              onChange={(e) => setSignatureMethod(e.target.value as any)}
              className="mt-1 mr-3"
            />
            <div className="method-info flex-1">
              <div className="method-name font-medium">Biometric</div>
              <div className="method-description text-sm text-gray-600">
                Facial recognition or fingerprint authentication
              </div>
            </div>
          </label>
        </div>
      </div>
    );
  };

  const standardArbitrationContent = `
    ARBITRATION AGREEMENT CLAUSE
    
    1. AGREEMENT TO ARBITRATE: The parties hereby agree to resolve any dispute, claim, or controversy arising out of or relating to this agreement through final and binding arbitration administered by Arbitra Platform.

    2. GOVERNING LAW: This agreement shall be governed by and construed in accordance with the specified governing law.

    3. ARBITRATION RULES: The arbitration shall be conducted in accordance with the Arbitra Platform Rules of Procedure, which are incorporated by reference.

    4. SEAT OF ARBITRATION: The legal seat of arbitration shall be as specified in this agreement.

    5. CONFIDENTIALITY: All aspects of the arbitration proceeding shall be treated as confidential.

    6. COSTS: Each party shall bear its own costs and expenses, including attorney's fees.
  `;

  if (isLoading) {
    return <div className="loading text-center py-8">Loading agreement...</div>;
  }

  if (!agreement) {
    return <div className="error text-red-600 text-center py-8">Agreement not found</div>;
  }

  return (
    <div className="agreement-signing max-w-4xl mx-auto p-6">
      <div className="agreement-header mb-6">
        <h3 className="text-2xl font-bold mb-2">{agreement.title}</h3>
        <div className="agreement-meta flex gap-4 text-sm text-gray-600">
          <span>Version: {agreement.version}</span>
          <span>
            Effective: {new Date(Number(agreement.effective_date) / 1_000_000).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="agreement-content space-y-6">
        <div className="content-section">
          <h4 className="font-semibold mb-3">Agreement Content</h4>
          <div className="legal-text bg-white border rounded p-4 text-sm whitespace-pre-wrap">
            {agreement.content}
          </div>
        </div>

        {renderLegalClauses()}
        {renderSignatureOptions()}

        <div className="signing-actions flex gap-4">
          <button
            onClick={handleSignAgreement}
            disabled={isSigning}
            className="sign-button px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSigning ? 'Signing...' : 'Sign Agreement'}
          </button>
          
          <button className="sign-button px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Download for Review
          </button>
        </div>

        <div className="legal-disclaimer bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm">
            <strong>Legal Notice:</strong> By signing this agreement, you acknowledge that you have read, 
            understood, and agree to be legally bound by all terms and conditions. This agreement creates 
            legally enforceable obligations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgreementSigning;

