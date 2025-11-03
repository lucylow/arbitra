import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Result "mo:base/Result";
import Hash "mo:base/Hash";
import Option "mo:base/Option";
import Int "mo:base/Int";

actor EvidenceChain {
  
  // ========== EVIDENCE CHAIN OF CUSTODY ==========
  
  public type EvidenceItem = {
    id: Text;
    disputeId: Text;
    type: EvidenceType;
    content: EvidenceContent;
    metadata: EvidenceMetadata;
    chainOfCustody: [CustodyRecord];
    integrity: IntegrityVerification;
    accessControl: AccessControl;
  };

  public type EvidenceType = {
    category: Text; // DOCUMENT, DIGITAL, TESTIMONY, EXPERT_REPORT
    subType: Text;
    format: Text;
  };

  public type EvidenceContent = {
    hash: Text;
    storageLocation: Text; // IPFS, Constellation, On-chain
    encryptedData: ?Blob;
    originalFilename: Text;
    fileSize: Nat;
  };

  public type EvidenceMetadata = {
    description: Text;
    relevance: Text;
    confidentiality: ConfidentialityLevel;
    legalBasis: Text;
    submittedBy: Principal;
    submittedAt: Int;
    source: Text;
  };

  public type ConfidentialityLevel = {
    level: Text; // PUBLIC, CONFIDENTIAL, HIGHLY_CONFIDENTIAL
    accessRules: [AccessRule];
  };

  public type AccessRule = {
    principal: Principal;
    permission: Text; // VIEW, DOWNLOAD, MODIFY
    grantedAt: Int;
    expiresAt: ?Int;
  };

  public type CustodyRecord = {
    timestamp: Int;
    action: Text; // SUBMITTED, ACCESSED, MODIFIED, VERIFIED
    principal: Principal;
    details: Text;
    hashBefore: ?Text;
    hashAfter: ?Text;
  };

  public type IntegrityVerification = {
    constellationTxId: Text;
    ipfsCid: ?Text;
    verificationHistory: [VerificationRecord];
    isTamperProof: Bool;
  };

  public type VerificationRecord = {
    timestamp: Int;
    method: Text;
    result: Bool;
    verifiedBy: Principal;
    details: Text;
  };

  public type AccessControl = {
    owner: Principal;
    authorizedParties: [Principal];
    permissions: HashMap.HashMap<Principal, [Text]>;
  };

  // ========== STORAGE ==========
  private stable var evidenceArray: [(Text, EvidenceItem)] = [];
  private stable var disputeEvidenceMap: [(Text, [Text])] = [];
  private let evidenceStore = HashMap.HashMap<Text, EvidenceItem>(10, Text.equal, Text.hash);
  private let disputeEvidence = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash);

  // ========== UPGRADE HOOKS ==========
  system func preupgrade() {
    let buffer = Buffer.Buffer<(Text, EvidenceItem)>(evidenceStore.size());
    for ((id, evidence) in evidenceStore.entries()) {
      buffer.add((id, evidence));
    };
    evidenceArray := Buffer.toArray(buffer);

    let disputeBuffer = Buffer.Buffer<(Text, [Text])>(disputeEvidence.size());
    for ((disputeId, evidenceIds) in disputeEvidence.entries()) {
      disputeBuffer.add((disputeId, evidenceIds));
    };
    disputeEvidenceMap := Buffer.toArray(disputeBuffer);
  };

  system func postupgrade() {
    for ((id, evidence) in evidenceArray.vals()) {
      evidenceStore.put(id, evidence);
    };
    for ((disputeId, evidenceIds) in disputeEvidenceMap.vals()) {
      disputeEvidence.put(disputeId, evidenceIds);
    };
  };

  // ========== EVIDENCE SUBMISSION WITH INTEGRITY VERIFICATION ==========
  
  public shared ({ caller }) func submitEvidence(
    disputeId: Text,
    evidence: {
      type: EvidenceType;
      content: EvidenceContent;
      metadata: {
        description: Text;
        relevance: Text;
        confidentiality: ConfidentialityLevel;
        legalBasis: Text;
        source: Text;
      };
    }
  ) : async Result.Result<Text, Text> {
    
    let evidenceId = "EVID_" # disputeId # "_" # Int.toText(Time.now());

    // Create initial custody record
    let initialCustody: CustodyRecord = {
      timestamp = Time.now();
      action = "SUBMITTED";
      principal = caller;
      details = "Initial evidence submission";
      hashBefore = null;
      hashAfter = ?evidence.content.hash;
    };

    // Submit to Constellation for immutable anchoring
    let constellationTxId = await _submitToConstellation(
      evidence.content.hash,
      evidence.metadata.description
    );

    let permissions = HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);
    permissions.put(caller, ["VIEW", "DOWNLOAD"]);

    let evidenceItem: EvidenceItem = {
      id = evidenceId;
      disputeId = disputeId;
      type = evidence.type;
      content = evidence.content;
      metadata = {
        description = evidence.metadata.description;
        relevance = evidence.metadata.relevance;
        confidentiality = evidence.metadata.confidentiality;
        legalBasis = evidence.metadata.legalBasis;
        submittedBy = caller;
        submittedAt = Time.now();
        source = evidence.metadata.source;
      };
      chainOfCustody = [initialCustody];
      integrity = {
        constellationTxId = constellationTxId;
        ipfsCid = null;
        verificationHistory = [];
        isTamperProof = true;
      };
      accessControl = {
        owner = caller;
        authorizedParties = [caller];
        permissions = permissions;
      };
    };

    evidenceStore.put(evidenceId, evidenceItem);

    // Update dispute evidence list
    switch (disputeEvidence.get(disputeId)) {
      case (null) {
        disputeEvidence.put(disputeId, [evidenceId]);
      };
      case (?existing) {
        disputeEvidence.put(disputeId, Array.append(existing, [evidenceId]));
      };
    };

    #ok(evidenceId)
  };

  // ========== CHAIN OF CUSTODY TRACKING ==========
  
  public shared ({ caller }) func recordCustodyEvent(
    evidenceId: Text,
    action: Text,
    details: Text
  ) : async Result.Result<(), Text> {
    
    switch (evidenceStore.get(evidenceId)) {
      case (null) { return #err("Evidence not found") };
      case (?evidence) {
        
        // Verify caller has permission for this action
        if (not _hasPermission(caller, evidence, action)) {
          return #err("Unauthorized action");
        };

        let custodyRecord: CustodyRecord = {
          timestamp = Time.now();
          action = action;
          principal = caller;
          details = details;
          hashBefore = ?evidence.content.hash;
          hashAfter = ?evidence.content.hash; // Hash remains same for access events
        };

        let updatedChain = Array.append(evidence.chainOfCustody, [custodyRecord]);
        
        let updatedEvidence: EvidenceItem = {
          evidence with
          chainOfCustody = updatedChain;
        };

        evidenceStore.put(evidenceId, updatedEvidence);
        #ok(())
      };
    };
  };

  // ========== EXPERT VERIFICATION INTEGRATION ==========
  
  public shared ({ caller }) func requestExpertVerification(
    evidenceId: Text,
    expertId: Text,
    verificationType: Text
  ) : async Result.Result<Text, Text> {
    
    switch (evidenceStore.get(evidenceId)) {
      case (null) { return #err("Evidence not found") };
      case (?evidence) {
        
        // Record verification request in chain of custody
        let verificationRecord: CustodyRecord = {
          timestamp = Time.now();
          action = "VERIFICATION_REQUESTED";
          principal = caller;
          details = "Requested " # verificationType # " verification from expert " # expertId;
          hashBefore = ?evidence.content.hash;
          hashAfter = ?evidence.content.hash;
        };

        let updatedChain = Array.append(evidence.chainOfCustody, [verificationRecord]);
        
        let updatedEvidence: EvidenceItem = {
          evidence with
          chainOfCustody = updatedChain;
        };

        evidenceStore.put(evidenceId, updatedEvidence);

        // In production, this would notify the expert and integrate with expert system
        #ok("VERIFICATION_REQ_" # evidenceId # "_" # expertId)
      };
    };
  };

  public shared ({ caller }) func recordExpertVerification(
    evidenceId: Text,
    expertId: Text,
    result: Bool,
    findings: Text
  ) : async Result.Result<(), Text> {
    
    switch (evidenceStore.get(evidenceId)) {
      case (null) { return #err("Evidence not found") };
      case (?evidence) {
        
        let verificationRecord: VerificationRecord = {
          timestamp = Time.now();
          method = "EXPERT_ANALYSIS";
          result = result;
          verifiedBy = caller;
          details = findings;
        };

        let updatedHistory = Array.append(evidence.integrity.verificationHistory, [verificationRecord]);
        
        let updatedIntegrity: IntegrityVerification = {
          evidence.integrity with
          verificationHistory = updatedHistory;
        };

        // Record in chain of custody
        let custodyRecord: CustodyRecord = {
          timestamp = Time.now();
          action = "EXPERT_VERIFIED";
          principal = caller;
          details = "Expert " # expertId # " completed verification: " # (if result "PASS" else "FAIL");
          hashBefore = ?evidence.content.hash;
          hashAfter = ?evidence.content.hash;
        };

        let updatedChain = Array.append(evidence.chainOfCustody, [custodyRecord]);
        
        let updatedEvidence: EvidenceItem = {
          evidence with
          integrity = updatedIntegrity;
          chainOfCustody = updatedChain;
        };

        evidenceStore.put(evidenceId, updatedEvidence);
        #ok(())
      };
    };
  };

  // ========== INTEGRITY VERIFICATION ==========
  
  public shared ({ caller }) func verifyEvidenceIntegrity(
    evidenceId: Text
  ) : async Result.Result<Bool, Text> {
    
    switch (evidenceStore.get(evidenceId)) {
      case (null) { return #err("Evidence not found") };
      case (?evidence) {
        
        // Verify Constellation transaction
        let constellationValid = await _verifyConstellationTransaction(
          evidence.integrity.constellationTxId,
          evidence.content.hash
        );

        if (not constellationValid) {
          return #err("Constellation verification failed");
        };

        // Verify chain of custody integrity
        let custodyValid = _verifyChainOfCustody(evidence.chainOfCustody);
        
        if (not custodyValid) {
          return #err("Chain of custody verification failed");
        };

        // Record verification in history
        let verificationRecord: VerificationRecord = {
          timestamp = Time.now();
          method = "FULL_INTEGRITY_CHECK";
          result = true;
          verifiedBy = caller;
          details = "Complete evidence integrity verification passed";
        };

        let updatedHistory = Array.append(evidence.integrity.verificationHistory, [verificationRecord]);
        
        let updatedIntegrity: IntegrityVerification = {
          evidence.integrity with
          verificationHistory = updatedHistory;
        };

        let updatedEvidence: EvidenceItem = {
          evidence with
          integrity = updatedIntegrity;
        };

        evidenceStore.put(evidenceId, updatedEvidence);

        #ok(true)
      };
    };
  };

  // ========== PRIVATE HELPER FUNCTIONS ==========
  
  private func _submitToConstellation(hash: Text, description: Text) : async Text {
    // Integration with Constellation Network
    // This would make HTTPS outcalls to Constellation's API
    "CONSTELLATION_TX_" # hash # "_" # Int.toText(Time.now())
  };

  private func _verifyConstellationTransaction(txId: Text, expectedHash: Text) : async Bool {
    // Verify transaction on Constellation network
    // This would query Constellation's blockchain
    true // Mock implementation
  };

  private func _verifyChainOfCustody(chain: [CustodyRecord]) : Bool {
    if (chain.size() == 0) { return false };
    
    var previousHash: ?Text = null;
    
    for (record in chain.vals()) {
      switch (record.action) {
        case ("SUBMITTED") {
          if (record.hashBefore != null) {
            return false; // First record shouldn't have previous hash
          };
        };
        case ("MODIFIED") {
          // For modifications, hashBefore should match previous hashAfter
          switch (previousHash, record.hashBefore) {
            case (?prev, ?current) {
              if (prev != current) {
                return false;
              };
            };
            case (_, _) { return false };
          };
        };
        case (_) {
          // For access events, hash should remain unchanged
          switch (previousHash, record.hashBefore, record.hashAfter) {
            case (?prev, ?before, ?after) {
              if (prev != before or before != after) {
                return false;
              };
            };
            case (_, _, _) { return false };
          };
        };
      };
      
      previousHash := record.hashAfter;
    };
    
    true
  };

  private func _hasPermission(principal: Principal, evidence: EvidenceItem, action: Text) : Bool {
    // Check if principal is owner
    if (principal == evidence.accessControl.owner) {
      return true;
    };

    // Check if principal is in authorized parties
    if (Array.contains<Principal>(evidence.accessControl.authorizedParties, principal, Principal.equal)) {
      return true;
    };

    // Check permissions map
    switch (evidence.accessControl.permissions.get(principal)) {
      case (?permissions) {
        Array.contains<Text>(permissions, action, Text.equal)
      };
      case (null) { false };
    };
  };

  // ========== QUERY METHODS ==========
  
  public query func getEvidence(evidenceId: Text) : async ?EvidenceItem {
    evidenceStore.get(evidenceId)
  };

  public query func getEvidenceChain(evidenceId: Text) : async ?[CustodyRecord] {
    switch (evidenceStore.get(evidenceId)) {
      case (null) { null };
      case (?evidence) { ?evidence.chainOfCustody };
    }
  };

  public query func getDisputeEvidence(disputeId: Text) : async [EvidenceItem] {
    switch (disputeEvidence.get(disputeId)) {
      case (null) { [] };
      case (?evidenceIds) {
        let results = Buffer.Buffer<EvidenceItem>(0);
        for (id in evidenceIds.vals()) {
          switch (evidenceStore.get(id)) {
            case (?evidence) { results.add(evidence) };
            case (null) {};
          };
        };
        results.toArray()
      };
    }
  };

  // Health check
  public query func health(): async Text {
    "Evidence Chain is operational";
  };
}

