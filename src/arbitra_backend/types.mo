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
    status: DisputeStatus;
    evidence: [EvidenceReference];
    ruling: ?Ruling;
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

  public type Ruling = {
    id: Nat;
    disputeId: Nat;
    decision: Text;
    reasoning: Text;
    keyFactors: [Text];
    confidenceScore: Float;
    issuedBy: Principal;
    issuedAt: Int;
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

  public type Result<T, E> = Result.Result<T, E>;
}

