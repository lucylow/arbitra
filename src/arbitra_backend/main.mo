import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Hash "mo:base/Hash";
import Types "types";

actor ArbitraBackend {

  // Use proper types
  public type Dispute = Types.Dispute;
  public type DisputeStatus = Types.DisputeStatus;
  public type Evidence = Types.EvidenceReference;
  public type Ruling = Types.Ruling;
  public type UserProfile = Types.UserProfile;
  public type UserType = Types.UserType;

  // State management - use stable memory
  private stable var disputeArray: [Dispute] = [];
  private stable var nextDisputeId: Nat = 1;
  // Use a stable hashing function for Nat
  private func natHash(n: Nat) : Hash.Hash { 
    Text.hash(Nat.toText(n))
  };
  private let disputeMap = HashMap.HashMap<Nat, Dispute>(10, Nat.equal, natHash);

  // User profiles
  private stable var userArray: [(Principal, UserProfile)] = [];
  private let userMap = HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, Principal.hash);

  // Pre-upgrade hook - save state
  system func preupgrade() {
    let disputeBuffer = Buffer.Buffer<Dispute>(disputeMap.size());
    for ((_, dispute) in disputeMap.entries()) {
      disputeBuffer.add(dispute);
    };
    disputeArray := Buffer.toArray(disputeBuffer);
    
    let userBuffer = Buffer.Buffer<(Principal, UserProfile)>(userMap.size());
    for ((principal, profile) in userMap.entries()) {
      userBuffer.add((principal, profile));
    };
    userArray := Buffer.toArray(userBuffer);
  };

  // Post-upgrade hook - restore state
  system func postupgrade() {
    for (dispute in disputeArray.vals()) {
      disputeMap.put(dispute.id, dispute);
    };
    for ((principal, profile) in userArray.vals()) {
      userMap.put(principal, profile);
    };
  };

  // ====== DISPUTE MANAGEMENT ======

  // Comprehensive createDispute method
  private func createDisputeComprehensive(
    title: Text,
    description: Text,
    defendant: Principal,
    amountInDispute: Nat,
    currency: Text,
    governingLaw: Text,
    arbitrationClause: Text,
    plaintiff: Principal
  ) : Result.Result<Nat, Text> {

    // Input validation
    if (Text.size(title) < 5) {
      return #err("Title must be at least 5 characters");
    };
    if (Text.size(description) < 10) {
      return #err("Description must be at least 10 characters");
    };
    if (amountInDispute < 100000) { // $1.00 minimum in cents
      return #err("Minimum dispute amount is $1.00");
    };
    if (plaintiff == defendant) {
      return #err("Plaintiff and defendant must be different");
    };

    let disputeId = nextDisputeId;
    nextDisputeId += 1;

    let newDispute: Dispute = {
      id = disputeId;
      title = title;
      description = description;
      plaintiff = plaintiff;
      defendant = defendant;
      amountInDispute = amountInDispute;
      currency = currency;
      governingLaw = governingLaw;
      arbitrationClause = arbitrationClause;
      status = #Draft;
      evidence = [];
      ruling = null;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    disputeMap.put(disputeId, newDispute);

    // Ensure profiles exist
    let _ = ensureUserProfile(plaintiff);
    let _ = ensureUserProfile(defendant);

    #ok(disputeId);
  };

  // Public comprehensive createDispute method (with all fields)
  public shared(msg) func createDisputeFull(
    title: Text,
    description: Text,
    defendant: Principal,
    amountInDispute: Nat,
    currency: Text,
    governingLaw: Text,
    arbitrationClause: Text
  ) : async Result.Result<Nat, Text> {
    createDisputeComprehensive(title, description, defendant, amountInDispute, currency, governingLaw, arbitrationClause, msg.caller);
  };

  private func ensureUserProfile(principal: Principal) : () {
    switch (userMap.get(principal)) {
      case (?_) { }; // Already exists
      case null {
        let profile: UserProfile = {
          principal = principal;
          username = "";
          email = "";
          userType = #INDIVIDUAL;
          rating = 5.0;
          disputesInvolved = 0;
          createdAt = Time.now();
        };
        userMap.put(principal, profile);
      };
    };
  };

  // Internal getDispute (uses Nat ID and returns Dispute type)
  public query func getDisputeInternal(disputeId: Nat) : async Result.Result<Dispute, Text> {
    switch (disputeMap.get(disputeId)) {
      case null { #err("Dispute not found") };
      case (?dispute) { #ok(dispute) };
    };
  };

  public query func getUserDisputes(user: Principal) : async [Dispute] {
    let buffer = Buffer.Buffer<Dispute>(10);
    
    for (dispute in disputeMap.vals()) {
      if (dispute.plaintiff == user or dispute.defendant == user) {
        buffer.add(dispute);
      };
    };
    
    Buffer.toArray(buffer);
  };

  // Internal getAllDisputes (returns Dispute type)
  public query func getAllDisputesInternal() : async [Dispute] {
    let buffer = Buffer.Buffer<Dispute>(10);
    for (dispute in disputeMap.vals()) {
      buffer.add(dispute);
    };
    Buffer.toArray(buffer);
  };

  public shared(msg) func activateDispute(disputeId: Nat) : async Result.Result<(), Text> {
    switch (disputeMap.get(disputeId)) {
      case null { #err("Dispute not found") };
      case (?dispute) {
        if (dispute.plaintiff != msg.caller) {
          return #err("Only plaintiff can activate dispute");
        };
        if (dispute.status != #Draft) {
          return #err("Dispute is not in draft state");
        };

        let updated: Dispute = {
          dispute with
          status = #Active;
          updatedAt = Time.now();
        };

        disputeMap.put(disputeId, updated);
        #ok();
      };
    };
  };

  // ====== SIMPLIFIED API (for frontend compatibility) ======
  
  // Simplified createDispute matching frontend expectations
  public shared(msg) func createDispute(
    respondent: Principal,
    title: Text,
    description: Text,
    amount: Nat
  ) : async Result.Result<Text, Text> {
    // Use default values for required fields
    let result = createDisputeComprehensive(
      title,
      description,
      respondent,
      amount,
      "USD", // default currency
      "", // default governing law
      "", // default arbitration clause
      msg.caller
    );
    
    switch (result) {
      case (#ok(id)) { #ok(Nat.toText(id)) };
      case (#err(msg)) { #err(msg) };
    };
  };

  // Helper to convert Dispute to frontend format
  private func disputeToFrontendFormat(dispute: Dispute) : {
    id: Text;
    claimant: Principal;
    respondent: Principal;
    arbitrator: ?Principal;
    title: Text;
    description: Text;
    amount: Nat;
    status: {
      #Pending;
      #EvidenceSubmission;
      #UnderReview;
      #Decided;
      #Appealed;
      #Closed;
    };
    createdAt: Int;
    updatedAt: Int;
    decision: ?Text;
    escrowId: ?Text;
  } {
    {
      id = Nat.toText(dispute.id);
      claimant = dispute.plaintiff;
      respondent = dispute.defendant;
      arbitrator = null;
      title = dispute.title;
      description = dispute.description;
      amount = dispute.amountInDispute;
      status = switch (dispute.status) {
        case (#Draft) { #Pending };
        case (#Active) { #Pending };
        case (#EvidenceSubmission) { #EvidenceSubmission };
        case (#AIAnalysis) { #UnderReview };
        case (#ArbitratorReview) { #UnderReview };
        case (#Settled) { #Decided };
        case (#Appealed) { #Appealed };
        case (#Closed) { #Closed };
      };
      createdAt = dispute.createdAt;
      updatedAt = dispute.updatedAt;
      decision = switch (dispute.ruling) {
        case null { null };
        case (?r) { ?r.decision };
      };
      escrowId = null;
    };
  };

  // Frontend-compatible getAllDisputes
  public query func getAllDisputes() : async [{
    id: Text;
    claimant: Principal;
    respondent: Principal;
    arbitrator: ?Principal;
    title: Text;
    description: Text;
    amount: Nat;
    status: {
      #Pending;
      #EvidenceSubmission;
      #UnderReview;
      #Decided;
      #Appealed;
      #Closed;
    };
    createdAt: Int;
    updatedAt: Int;
    decision: ?Text;
    escrowId: ?Text;
  }] {
    let buffer = Buffer.Buffer<{
      id: Text;
      claimant: Principal;
      respondent: Principal;
      arbitrator: ?Principal;
      title: Text;
      description: Text;
      amount: Nat;
      status: {
        #Pending;
        #EvidenceSubmission;
        #UnderReview;
        #Decided;
        #Appealed;
        #Closed;
      };
      createdAt: Int;
      updatedAt: Int;
      decision: ?Text;
      escrowId: ?Text;
    }>(10);
    
    for (dispute in disputeMap.vals()) {
      buffer.add(disputeToFrontendFormat(dispute));
    };
    
    Buffer.toArray(buffer);
  };

  // Frontend-compatible getDispute (takes Text ID)
  public query func getDispute(disputeId: Text) : async ?{
    id: Text;
    claimant: Principal;
    respondent: Principal;
    arbitrator: ?Principal;
    title: Text;
    description: Text;
    amount: Nat;
    status: {
      #Pending;
      #EvidenceSubmission;
      #UnderReview;
      #Decided;
      #Appealed;
      #Closed;
    };
    createdAt: Int;
    updatedAt: Int;
    decision: ?Text;
    escrowId: ?Text;
  } {
    switch (Nat.fromText(disputeId)) {
      case null { null };
      case (?id) {
        switch (disputeMap.get(id)) {
          case null { null };
          case (?dispute) { ?disputeToFrontendFormat(dispute) };
        };
      };
    };
  };

  // Frontend-compatible getDisputesByUser
  public query func getDisputesByUser(user: Principal) : async [{
    id: Text;
    claimant: Principal;
    respondent: Principal;
    arbitrator: ?Principal;
    title: Text;
    description: Text;
    amount: Nat;
    status: {
      #Pending;
      #EvidenceSubmission;
      #UnderReview;
      #Decided;
      #Appealed;
      #Closed;
    };
    createdAt: Int;
    updatedAt: Int;
    decision: ?Text;
    escrowId: ?Text;
  }] {
    let buffer = Buffer.Buffer<{
      id: Text;
      claimant: Principal;
      respondent: Principal;
      arbitrator: ?Principal;
      title: Text;
      description: Text;
      amount: Nat;
      status: {
        #Pending;
        #EvidenceSubmission;
        #UnderReview;
        #Decided;
        #Appealed;
        #Closed;
      };
      createdAt: Int;
      updatedAt: Int;
      decision: ?Text;
      escrowId: ?Text;
    }>(10);
    
    for (dispute in disputeMap.vals()) {
      if (dispute.plaintiff == user or dispute.defendant == user) {
        buffer.add(disputeToFrontendFormat(dispute));
      };
    };
    
    Buffer.toArray(buffer);
  };

  // Stub implementations for frontend compatibility
  public shared(_msg) func assignArbitrator(disputeId: Text, _arbitrator: Principal) : async Result.Result<Text, Text> {
    switch (Nat.fromText(disputeId)) {
      case null { #err("Invalid dispute ID") };
      case (?id) {
        switch (disputeMap.get(id)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            // TODO: Implement arbitrator assignment logic
            #ok("Arbitrator assigned");
          };
        };
      };
    };
  };

  public shared(_msg) func updateDisputeStatus(
    disputeId: Text,
    status: {
      #Pending;
      #EvidenceSubmission;
      #UnderReview;
      #Decided;
      #Appealed;
      #Closed;
    }
  ) : async Result.Result<Text, Text> {
    switch (Nat.fromText(disputeId)) {
      case null { #err("Invalid dispute ID") };
      case (?id) {
        switch (disputeMap.get(id)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            // Map frontend status to backend status
            let backendStatus: DisputeStatus = switch (status) {
              case (#Pending) { #Active };
              case (#EvidenceSubmission) { #EvidenceSubmission };
              case (#UnderReview) { #ArbitratorReview };
              case (#Decided) { #Settled };
              case (#Appealed) { #Appealed };
              case (#Closed) { #Closed };
            };
            
            let updated: Dispute = {
              dispute with
              status = backendStatus;
              updatedAt = Time.now();
            };
            
            disputeMap.put(id, updated);
            #ok("Status updated");
          };
        };
      };
    };
  };

  public shared(msg) func submitDecision(disputeId: Text, decision: Text) : async Result.Result<Text, Text> {
    switch (Nat.fromText(disputeId)) {
      case null { #err("Invalid dispute ID") };
      case (?id) {
        switch (disputeMap.get(id)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            // TODO: Implement decision submission logic
            let ruling: Ruling = {
              id = 1;
              disputeId = id;
              decision = decision;
              reasoning = "";
              keyFactors = [];
              confidenceScore = 0.0;
              issuedBy = msg.caller;
              issuedAt = Time.now();
            };
            
            let updated: Dispute = {
              dispute with
              ruling = ?ruling;
              status = #Settled;
              updatedAt = Time.now();
            };
            
            disputeMap.put(id, updated);
            #ok("Decision submitted");
          };
        };
      };
    };
  };

  public shared(msg) func registerUser(name: Text, email: Text, role: {
    #Claimant;
    #Respondent;
    #Arbitrator;
    #Admin;
  }) : async Result.Result<Text, Text> {
    let userType: UserType = switch (role) {
      case (#Arbitrator) { #ARBITRATOR };
      case (_) { #INDIVIDUAL };
    };
    
    let profile: UserProfile = {
      principal = msg.caller;
      username = name;
      email = email;
      userType = userType;
      rating = 5.0;
      disputesInvolved = 0;
      createdAt = Time.now();
    };
    
    userMap.put(msg.caller, profile);
    #ok("User registered");
  };

  public shared(_msg) func linkEscrow(_disputeId: Text, _escrowId: Text) : async Result.Result<Text, Text> {
    // TODO: Implement escrow linking logic
    #ok("Escrow linked");
  };

  // ====== HEALTH CHECK ======
  
  public query func health() : async Text {
    "Arbitra backend is operational";
  };
};

