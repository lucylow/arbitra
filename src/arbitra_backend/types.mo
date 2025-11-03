import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

module Types {

  // Export all types from this module
  
  public type Dispute = {
    id: Nat;
    title: Text;
    description: Text;
    plaintiff: Principal;
    defendant: Principal;
    amountInDispute: Nat;
    currency: Text;
    governingLaw: Text;
    arbitrationClause: Text;
    // Legal framework compliance fields
    seatOfArbitration: Text; // Jurisdiction where arbitration is seated (required for New York Convention)
    arbitrationAgreementHash: ?Text; // Hash of signed legal contract
    arbitrationAgreementVerified: Bool; // Whether parties have signed separate legal agreement
    arbitrator: ?Principal; // Assigned human arbitrator (required for enforceability)
    // AI and human decision separation
    aiRecommendation: ?AIRecommendation; // Non-binding AI analysis (advisory only)
    ruling: ?Ruling; // Final binding award issued by human arbitrator
    status: DisputeStatus;
    evidence: [EvidenceReference];
    createdAt: Int;
    updatedAt: Int;
  };

  public type DisputeStatus = {
    #Draft;
    #Active;
    #EvidenceSubmission;
    #AIAnalysis;
    #ArbitratorReview;
    #Settled;
    #Appealed;
    #Closed;
  };

  public type EvidenceReference = {
    id: Nat;
    fileName: Text;
    hash: Text;
    uploadedAt: Int;
    uploadedBy: Principal;
  };

  // AI Recommendation (non-binding, advisory only)
  // Per legal framework: decision-making authority cannot be delegated to AI
  public type AIRecommendation = {
    id: Nat;
    disputeId: Nat;
    summary: Text;
    preliminaryRuling: Text; // Non-binding suggestion
    reasoning: Text;
    keyPoints: [Text];
    evidenceAnalysis: Text;
    confidenceScore: Float;
    explainabilityData: Text; // SHAP/LIME outputs for transparency
    generatedAt: Int;
    // Explicitly marked as non-binding
    isBinding: Bool; // Always false - for legal clarity
  };

  // Final Ruling (binding award issued by human arbitrator)
  // Per legal framework: human arbitrator must maintain independent judgment
  public type Ruling = {
    id: Nat;
    disputeId: Nat;
    decision: Text;
    reasoning: Text;
    keyFactors: [Text];
    // Legal compliance fields
    applicableLaw: Text;
    jurisdiction: Text;
    // Reference to AI recommendation (if considered)
    consideredAIRecommendation: Bool;
    // Human arbitrator's independent judgment
    issuedBy: Principal; // Must be human arbitrator (not AI)
    issuedAt: Int;
    // Award enforcement data
    awardNumber: Text; // Unique identifier for enforcement
    isEnforceable: Bool; // Whether award meets New York Convention requirements
  };

  public type UserProfile = {
    principal: Principal;
    username: Text;
    email: Text;
    userType: UserType;
    rating: Float;
    disputesInvolved: Nat;
    createdAt: Int;
  };

  public type UserType = {
    #INDIVIDUAL;
    #BUSINESS;
    #ARBITRATOR;
  };

  // Arbitrator profile with independence verification
  public type ArbitratorProfile = {
    principal: Principal;
    name: Text;
    qualifications: Text;
    jurisdiction: Text;
    verified: Bool; // Whether arbitrator has been vetted
    conflicts: [Principal]; // Parties with potential conflicts
    casesHandled: Nat;
    rating: Float;
    available: Bool;
    independenceVerified: Bool; // Compliance with independence requirements
  };

  // Arbitration Agreement verification
  public type ArbitrationAgreement = {
    disputeId: Nat;
    agreementHash: Text;
    plaintiffSigned: Bool;
    defendantSigned: Bool;
    signedAt: Int;
    governingLaw: Text;
    seatOfArbitration: Text;
    rulesOfProcedure: Text;
  };

  public type Result<T, E> = Result.Result<T, E>;
}

