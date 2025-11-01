module {
    // User roles
    public type UserRole = {
        #Claimant;
        #Respondent;
        #Arbitrator;
        #Admin;
    };

    // Dispute status
    public type DisputeStatus = {
        #Pending;
        #EvidenceSubmission;
        #UnderReview;
        #Decided;
        #Appealed;
        #Closed;
    };

    // Evidence type
    public type EvidenceType = {
        #Document;
        #Image;
        #Video;
        #Audio;
        #Text;
    };

    // Evidence entry
    public type Evidence = {
        id: Text;
        disputeId: Text;
        submittedBy: Principal;
        evidenceType: EvidenceType;
        contentHash: Text;
        description: Text;
        timestamp: Int;
        verified: Bool;
    };

    // Dispute case
    public type Dispute = {
        id: Text;
        claimant: Principal;
        respondent: Principal;
        arbitrator: ?Principal;
        title: Text;
        description: Text;
        amount: Nat;
        status: DisputeStatus;
        createdAt: Int;
        updatedAt: Int;
        decision: ?Text;
        escrowId: ?Text;
    };

    // Arbitrator profile
    public type Arbitrator = {
        principal: Principal;
        name: Text;
        expertise: [Text];
        casesHandled: Nat;
        rating: Float;
        available: Bool;
    };

    // AI Analysis result
    public type AIAnalysis = {
        disputeId: Text;
        summary: Text;
        keyPoints: [Text];
        recommendation: Text;
        confidence: Float;
        timestamp: Int;
    };

    // Bitcoin escrow
    public type Escrow = {
        id: Text;
        disputeId: Text;
        amount: Nat;
        depositor: Principal;
        beneficiary: Principal;
        status: EscrowStatus;
        createdAt: Int;
        releasedAt: ?Int;
    };

    public type EscrowStatus = {
        #Pending;
        #Funded;
        #Released;
        #Refunded;
        #Disputed;
    };

    // User profile
    public type UserProfile = {
        principal: Principal;
        name: Text;
        email: Text;
        role: UserRole;
        joinedAt: Int;
        casesInvolved: [Text];
    };
}
