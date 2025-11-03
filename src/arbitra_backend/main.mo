import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Types "types";

actor ArbitraBackend {

  // ===== TYPES =====
  public type DisputeStatus = Types.DisputeStatus;
  public type Dispute = Types.Dispute;
  public type EvidenceReference = Types.EvidenceReference;
  public type Ruling = Types.Ruling;
  public type UserProfile = Types.UserProfile;
  public type UserType = Types.UserType;

  // Extended types for specification
  public type EvidenceSubmission = {
    disputeId: Text;
    fileName: Text;
    fileType: Text;
    fileSize: Nat;
    fileHash: Blob;
    description: Text;
    isConfidential: Bool;
  };

  // ===== STORAGE =====
  private stable var disputeArray: [Dispute] = [];
  private stable var nextDisputeId: Nat = 1;
  private func natHash(n: Nat): Hash.Hash { 
    Text.hash(Nat.toText(n))
  };
  private let disputes = HashMap.HashMap<Nat, Dispute>(10, Nat.equal, natHash);

  private stable var userArray: [(Principal, UserProfile)] = [];
  private let userProfiles = HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, Principal.hash);

  private stable var adminArray: [Principal] = [];
  private let adminSet = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);

  // ===== CONSTANTS =====
  let EVIDENCE_PERIOD_DAYS: Int = 14 * 24 * 60 * 60 * 1_000_000_000; // 14 days in nanoseconds
  let MIN_DISPUTE_AMOUNT: Nat = 10_000; // $10.00 in cents

  // ===== UPGRADE HOOKS =====
  system func preupgrade() {
    let disputeBuffer = Buffer.Buffer<Dispute>(disputes.size());
    for ((_, dispute) in disputes.entries()) {
      disputeBuffer.add(dispute);
    };
    disputeArray := Buffer.toArray(disputeBuffer);
    
    let userBuffer = Buffer.Buffer<(Principal, UserProfile)>(userProfiles.size());
    for ((principal, profile) in userProfiles.entries()) {
      userBuffer.add((principal, profile));
    };
    userArray := Buffer.toArray(userBuffer);

    let adminBuffer = Buffer.Buffer<Principal>(adminSet.size());
    for ((principal, _) in adminSet.entries()) {
      adminBuffer.add(principal);
    };
    adminArray := Buffer.toArray(adminBuffer);
  };

  system func postupgrade() {
    for (dispute in disputeArray.vals()) {
      disputes.put(dispute.id, dispute);
    };
    for ((principal, profile) in userArray.vals()) {
      userProfiles.put(principal, profile);
    };
    for (principal in adminArray.vals()) {
      adminSet.put(principal, true);
    };
  };

  // Initialize admin
  private var initialized = false;
  system func heartbeat(): async () {
    if (not initialized) {
      let controller = Principal.fromActor(ArbitraBackend);
      adminSet.put(controller, true);
      initialized := true;
    };
  };

  private func isAdmin(principal: Principal): Bool {
    switch (adminSet.get(principal)) {
      case (?_) { true };
      case null { false };
    };
  };

  // ===== DISPUTE MANAGEMENT =====
  public shared ({ caller }) func createDispute(
    title: Text,
    description: Text,
    defendant: Principal,
    amountInDispute: Nat,
    currency: Text,
    governingLaw: Text,
    arbitrationClause: Text
  ) : async Result.Result<Text, Text> {

    // Validate inputs
    if (Text.size(title) < 5) {
      return #err("Title must be at least 5 characters");
    };
    if (amountInDispute < MIN_DISPUTE_AMOUNT) {
      return #err("Minimum dispute amount is $10.00");
    };
    if (caller == defendant) {
      return #err("Plaintiff and defendant must be different");
    };

    let disputeId = nextDisputeId;
    nextDisputeId += 1;

    let now = Time.now();

    let dispute: Dispute = {
      id = disputeId;
      title = title;
      description = description;
      plaintiff = caller;
      defendant = defendant;
      amountInDispute = amountInDispute;
      currency = currency;
      governingLaw = governingLaw;
      arbitrationClause = arbitrationClause;
      createdAt = now;
      updatedAt = now;
      status = #Draft;
      evidence = [];
      ruling = null;
    };

    disputes.put(disputeId, dispute);
    
    // Update user profiles
    _updateUserDisputes(caller, disputeId);
    _updateUserDisputes(defendant, disputeId);

    #ok(Nat.toText(disputeId))
  };

  // Simplified version for frontend compatibility
  public shared ({ caller }) func createDispute(
    respondent: Principal,
    title: Text,
    description: Text,
    amount: Nat
  ) : async Result.Result<Text, Text> {
    createDispute(
      title,
      description,
      respondent,
      amount,
      "USD",
      "Uniform Commercial Code",
      "Parties agree to binding arbitration through Arbitra platform"
    );
  };

  public shared ({ caller }) func activateDispute(disputeIdText: Text) : async Result.Result<(), Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            if (dispute.plaintiff != caller) {
              return #err("Only plaintiff can activate dispute");
            };
            if (dispute.status != #Draft) {
              return #err("Dispute is not in draft state");
            };

            let updatedDispute: Dispute = {
              dispute with
              status = #Active;
              updatedAt = Time.now();
            };

            disputes.put(disputeId, updatedDispute);
            #ok(())
          };
        };
      };
    };
  };

  // ===== EVIDENCE MANAGEMENT =====
  public shared ({ caller }) func submitEvidence(
    disputeIdText: Text,
    fileName: Text,
    fileType: Text,
    fileSize: Nat,
    fileHash: Blob,
    description: Text,
    isConfidential: Bool
  ) : async Result.Result<Text, Text> {
    
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            // Verify caller is involved in dispute
            if (caller != dispute.plaintiff and caller != dispute.defendant) {
              return #err("Unauthorized - not a party to this dispute");
            };

            // Verify dispute is in evidence period
            if (dispute.status != #Active and dispute.status != #EvidenceSubmission) {
              return #err("Dispute is not in evidence submission period");
            };

            // Convert blob hash to hex string for Constellation
            let hashHex = _blobToHex(fileHash);

            // Create evidence reference
            let evidenceRef: EvidenceReference = {
              id = disputeId; // Use dispute ID for now, will be replaced by Evidence Manager
              fileName = fileName;
              hash = hashHex;
              uploadedAt = Time.now();
              uploadedBy = caller;
            };

            // Update dispute with new evidence
            let updatedEvidence = Array.append(dispute.evidence, [evidenceRef]);
            let updatedDispute: Dispute = {
              dispute with
              evidence = updatedEvidence;
              status = #EvidenceSubmission;
              updatedAt = Time.now();
            };

            disputes.put(disputeId, updatedDispute);

            // Submit hash to Constellation (mock for now - would call Evidence Manager)
            await _submitToConstellation(hashHex, fileName);

            #ok(hashHex) // Return hash as evidence ID
          };
        };
      };
    };
  };

  public shared ({ caller }) func getEvidence(disputeIdText: Text) : async Result.Result<[EvidenceReference], Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            if (caller != dispute.plaintiff and caller != dispute.defendant) {
              return #err("Unauthorized - not a party to this dispute");
            };

            #ok(dispute.evidence)
          };
        };
      };
    };
  };

  // ===== AI ANALYSIS INTEGRATION =====
  public shared ({ caller }) func triggerAIAnalysis(disputeIdText: Text) : async Result.Result<Text, Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            if (caller != dispute.plaintiff and caller != dispute.defendant) {
              return #err("Unauthorized - not a party to this dispute");
            };

            // Verify we have evidence
            if (dispute.evidence.size() == 0) {
              return #err("No evidence submitted for analysis");
            };

            // Update status
            let updatedDispute: Dispute = {
              dispute with
              status = #AIAnalysis;
              updatedAt = Time.now();
            };
            disputes.put(disputeId, updatedDispute);

            // Call AI Analysis canister
            let aiAnalysis: actor {
              analyzeDispute: (Nat, Text, Text, Nat) -> async Result.Result<Nat, Text>;
            } = actor("rrkah-fqaaa-aaaaa-aaaaq-cai"); // AI Analysis canister ID (will be set dynamically)

            let analysisResult = await aiAnalysis.analyzeDispute(
              disputeId,
              dispute.description,
              "",
              dispute.amountInDispute
            );

            switch (analysisResult) {
              case (#ok(_)) {
                // Analysis started - status already updated
                #ok("Analysis initiated successfully")
              };
              case (#err(msg)) {
                // Reset status on error
                let resetDispute: Dispute = {
                  dispute with
                  status = #EvidenceSubmission;
                  updatedAt = Time.now();
                };
                disputes.put(disputeId, resetDispute);
                #err("Analysis failed: " # msg)
              };
            };
          };
        };
      };
    };
  };

  // ===== SETTLEMENT EXECUTION =====
  public shared ({ caller }) func executeSettlement(disputeIdText: Text) : async Result.Result<Text, Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            switch (dispute.ruling) {
              case null { #err("No ruling available for this dispute") };
              case (?ruling) {
                if (dispute.status != #Settled and dispute.status != #ArbitratorReview) {
                  return #err("Dispute is not ready for settlement");
                };

                // Call Bitcoin Escrow canister to execute settlement
                let escrow: actor {
                  executeSettlement: (Nat, Ruling) -> async Result.Result<Text, Text>;
                } = actor("ryjl3-tyaaa-aaaaa-aaaba-cai"); // Escrow canister ID (will be set dynamically)

                let settlementResult = await escrow.executeSettlement(disputeId, ruling);

                switch (settlementResult) {
                  case (#ok(txHash)) {
                    // Update dispute status
                    let settledDispute: Dispute = {
                      dispute with
                      status = #Settled;
                      updatedAt = Time.now();
                    };
                    disputes.put(disputeId, settledDispute);
                    #ok(txHash)
                  };
                  case (#err(msg)) {
                    #err("Settlement execution failed: " # msg)
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  // ===== QUERY METHODS =====
  public query func getDispute(disputeIdText: Text) : async Result.Result<Dispute, Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
      case null { #err("Dispute not found") };
      case (?dispute) { #ok(dispute) };
        };
      };
    };
  };

  public query func getUserDisputes(user: Principal) : async [Dispute] {
    let userDisputes = Buffer.Buffer<Dispute>(0);
    for (dispute in disputes.vals()) {
      if (dispute.plaintiff == user or dispute.defendant == user) {
        userDisputes.add(dispute);
      };
    };
    userDisputes.toArray()
  };

  public query func getAllDisputes() : async [Dispute] {
    let buffer = Buffer.Buffer<Dispute>(10);
    for (dispute in disputes.vals()) {
      buffer.add(dispute);
    };
    Buffer.toArray(buffer);
  };

  public query func getRuling(disputeIdText: Text) : async Result.Result<Ruling, Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?disputeId) {
        switch (disputes.get(disputeId)) {
      case null { #err("Dispute not found") };
      case (?dispute) {
            switch (dispute.ruling) {
              case null { #err("No ruling found for this dispute") };
              case (?ruling) { #ok(ruling) };
        };
        };
        };
      };
    };
  };

  // Frontend-compatible getDispute (returns frontend format)
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
        switch (disputes.get(id)) {
          case null { null };
          case (?dispute) {
            ?{
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
            }
          };
        };
      };
    };
  };

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
    
    for (dispute in disputes.vals()) {
      if (dispute.plaintiff == user or dispute.defendant == user) {
        buffer.add({
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
        });
      };
    };
    
    Buffer.toArray(buffer);
  };

  // Additional admin functions
  public shared ({ caller }) func assignArbitrator(disputeIdText: Text, arbitrator: Principal) : async Result.Result<(), Text> {
    if (not isAdmin(caller)) {
      return #err("Only admins can assign arbitrators");
    };
    
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?id) {
        switch (disputes.get(id)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            // Update dispute (arbitrator field would be added to Dispute type if needed)
            #ok(())
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateDisputeStatus(
    disputeIdText: Text,
    status: {
      #Pending;
      #EvidenceSubmission;
      #UnderReview;
      #Decided;
      #Appealed;
      #Closed;
    }
  ) : async Result.Result<(), Text> {
    if (not isAdmin(caller)) {
      return #err("Only admins can update dispute status");
    };
    
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?id) {
        switch (disputes.get(id)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
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
            
            disputes.put(id, updated);
            #ok(())
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitDecision(disputeIdText: Text, decision: Text) : async Result.Result<(), Text> {
    switch (Nat.fromText(disputeIdText)) {
      case null { #err("Invalid dispute ID") };
      case (?id) {
        switch (disputes.get(id)) {
          case null { #err("Dispute not found") };
          case (?dispute) {
            let ruling: Ruling = {
              id = id;
              disputeId = id;
              decision = decision;
              reasoning = "";
              keyFactors = [];
              confidenceScore = 0.0;
              issuedBy = caller;
              issuedAt = Time.now();
            };
            
            let updated: Dispute = {
              dispute with
              ruling = ?ruling;
              status = #Settled;
              updatedAt = Time.now();
            };
            
            disputes.put(id, updated);
            #ok(())
          };
        };
      };
    };
  };

  public shared ({ caller }) func registerUser(name: Text, email: Text, role: {
    #Claimant;
    #Respondent;
    #Arbitrator;
    #Admin;
  }) : async Result.Result<(), Text> {
    let userType: UserType = switch (role) {
      case (#Arbitrator) { #ARBITRATOR };
      case (_) { #INDIVIDUAL };
    };
    
    let profile: UserProfile = {
      principal = caller;
      username = name;
      email = email;
      userType = userType;
      rating = 5.0;
      disputesInvolved = 0;
      createdAt = Time.now();
    };
    
    userProfiles.put(caller, profile);
    #ok(())
  };

  public shared (_msg) func linkEscrow(_disputeIdText: Text, _escrowIdText: Text) : async Result.Result<(), Text> {
    // TODO: Implement escrow linking logic
    #ok(())
  };

  // Admin management
  public shared ({ caller }) func addAdmin(principal: Principal): async Result.Result<(), Text> {
    if (not isAdmin(caller)) {
      return #err("Only admins can add other admins");
    };
    adminSet.put(principal, true);
    #ok(())
  };

  public query func isAdminPrincipal(principal: Principal): async Bool {
    isAdmin(principal)
  };

  // ===== PRIVATE HELPER FUNCTIONS =====
  private func _updateUserDisputes(user: Principal, disputeId: Nat) {
    switch (userProfiles.get(user)) {
      case null {
        let profile: UserProfile = {
          principal = user;
          username = "";
          email = "";
          userType = #INDIVIDUAL;
          rating = 5.0;
          disputesInvolved = 1;
          createdAt = Time.now();
        };
        userProfiles.put(user, profile);
      };
      case (?profile) {
        let updatedProfile: UserProfile = {
          profile with
          disputesInvolved = profile.disputesInvolved + 1;
        };
        userProfiles.put(user, updatedProfile);
      };
    };
  };

  private func _blobToHex(blob: Blob) : Text {
    let bytes = Blob.toArray(blob);
    var hex = "";
    for (byte in bytes.vals()) {
      let hexByte = Nat8.toText(byte);
      hex := hex # (if (hexByte.size() == 1) "0" else "") # hexByte;
    };
    hex
  };

  private func _submitToConstellation(hash: Text, fileName: Text) : async Text {
    // Mock Constellation submission
    // In production, this would call Evidence Manager which calls Constellation's API
    "CONSTELLATION_TX_" # hash
  };

  // Health check
  public query func health() : async Text {
    "Arbitra backend is operational"
  };
}
