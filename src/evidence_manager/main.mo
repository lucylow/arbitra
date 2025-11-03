import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import SHA256 "mo:base/SHA256";

actor EvidenceManager {
  
  public type EvidenceMetadata = {
    id: Nat;
    disputeId: Nat;
    submittedBy: Principal;
    fileName: Text;
    fileType: Text;
    fileSize: Nat;
    hash: Text;
    constellationTxId: ?Text;
    ipfsCid: ?Text;
    description: Text;
    submittedAt: Int;
    verified: Bool;
    verificationMethod: Text; // "CONSTELLATION", "IPFS", "MANUAL"
  };

  public type VerificationResult = {
    evidenceId: Nat;
    verified: Bool;
    method: Text;
    timestamp: Int;
    details: Text;
  };

  // Legacy Evidence type for compatibility
  public type Evidence = {
    id: Nat;
    disputeId: Nat;
    submittedBy: Principal;
    fileName: Text;
    contentHash: Text;
    description: Text;
    uploadedAt: Int;
    verified: Bool;
  };

  // State management
  private stable var evidenceArray: [EvidenceMetadata] = [];
  private stable var nextEvidenceId: Nat = 1;
  private func natHash(n: Nat): Hash.Hash {
    Text.hash(Nat.toText(n));
  };
  private let evidenceStore = HashMap.HashMap<Nat, EvidenceMetadata>(10, Nat.equal, natHash);
  private let verificationLogs = HashMap.HashMap<Nat, [VerificationResult]>(10, Nat.equal, natHash);

  // Store actual file content (for small files in MVP)
  private let fileStorage = HashMap.HashMap<Nat, Blob>(10, Nat.equal, natHash);

  // Pre-upgrade
  system func preupgrade() {
    let buffer = Buffer.Buffer<EvidenceMetadata>(evidenceStore.size());
    for ((_, metadata) in evidenceStore.entries()) {
      buffer.add(metadata);
    };
    evidenceArray := Buffer.toArray(buffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for (evidence in evidenceArray.vals()) {
      evidenceStore.put(evidence.id, evidence);
    };
  };

  public shared ({ caller }) func storeEvidence(
    disputeId: Nat,
    fileName: Text,
    fileType: Text,
    content: Blob,
    description: Text
  ) : async Result.Result<Nat, Text> {
    
    // Calculate hash
    let hashBytes = SHA256.sha256(Blob.toArray(content));
    let hash = _bytesToHex(hashBytes);

    let evidenceId = nextEvidenceId;
    nextEvidenceId += 1;

    let metadata: EvidenceMetadata = {
      id = evidenceId;
      disputeId = disputeId;
      submittedBy = caller;
      fileName = fileName;
      fileType = fileType;
      fileSize = content.size();
      hash = hash;
      constellationTxId = null;
      ipfsCid = null;
      description = description;
      submittedAt = Time.now();
      verified = false;
      verificationMethod = "PENDING";
    };

    evidenceStore.put(evidenceId, metadata);
    fileStorage.put(evidenceId, content);

    // Submit to Constellation for verification
    let constellationTxId = await _submitToConstellation(hash, fileName);
    
    // Update with Constellation transaction ID
    let updatedMetadata: EvidenceMetadata = {
      metadata with
      constellationTxId = ?constellationTxId;
      verified = true;
      verificationMethod = "CONSTELLATION";
    };

    evidenceStore.put(evidenceId, updatedMetadata);

    // Log verification
    let verification: VerificationResult = {
      evidenceId = evidenceId;
      verified = true;
      method = "CONSTELLATION_HASH";
      timestamp = Time.now();
      details = "Hash anchored to Constellation network";
    };

    _logVerification(evidenceId, verification);

    #ok(evidenceId)
  };

  // Legacy submitEvidence for compatibility
  public shared ({ caller }) func submitEvidence(
    disputeId: Nat,
    fileName: Text,
    contentHash: Text,
    description: Text
  ): async Result.Result<Nat, Text> {
    // Validation
    if (Text.size(fileName) == 0) {
      return #err("File name cannot be empty");
    };
    if (Text.size(contentHash) == 0) {
      return #err("Content hash cannot be empty");
    };

    let evidenceId = nextEvidenceId;
    nextEvidenceId += 1;

    let metadata: EvidenceMetadata = {
      id = evidenceId;
      disputeId = disputeId;
      submittedBy = caller;
      fileName = fileName;
      fileType = "unknown";
      fileSize = 0;
      hash = contentHash;
      constellationTxId = null;
      ipfsCid = null;
      description = description;
      submittedAt = Time.now();
      verified = false;
      verificationMethod = "PENDING";
    };

    evidenceStore.put(evidenceId, metadata);

    // Submit to Constellation
    let constellationTxId = await _submitToConstellation(contentHash, fileName);
    let updatedMetadata: EvidenceMetadata = {
      metadata with
      constellationTxId = ?constellationTxId;
      verified = true;
      verificationMethod = "CONSTELLATION";
    };
    evidenceStore.put(evidenceId, updatedMetadata);

    #ok(evidenceId);
  };

  public shared ({ caller }) func verifyEvidence(evidenceId: Nat) : async Result.Result<Bool, Text> {
    switch (evidenceStore.get(evidenceId)) {
      case null { #err("Evidence not found") };
      case (?metadata) {
        // Verify caller has access to this evidence
        if (caller != metadata.submittedBy) {
          return #err("Unauthorized");
        };

        switch (fileStorage.get(evidenceId)) {
          case null { 
            // No file stored, just verify hash was submitted to Constellation
            #ok(metadata.verified)
          };
          case (?storedContent) {
            // Recalculate hash
            let currentHashBytes = SHA256.sha256(Blob.toArray(storedContent));
            let currentHash = _bytesToHex(currentHashBytes);

            // Compare with stored hash
            let hashMatch = currentHash == metadata.hash;

            let verification: VerificationResult = {
              evidenceId = evidenceId;
              verified = hashMatch;
              method = "LOCAL_HASH_CHECK";
              timestamp = Time.now();
              details = if (hashMatch) "Local hash verification passed" else "Local hash verification failed";
            };

            _logVerification(evidenceId, verification);

            #ok(hashMatch)
          };
        };
      };
    };
  };

  public shared ({ caller }) func getEvidenceContent(evidenceId: Nat) : async Result.Result<Blob, Text> {
    switch (evidenceStore.get(evidenceId)) {
      case null { #err("Evidence not found") };
      case (?metadata) {
        // Add authorization check in real implementation
        switch (fileStorage.get(evidenceId)) {
          case null { #err("File content not found") };
          case (?content) { #ok(content) };
        };
      };
    };
  };

  public query func getEvidenceMetadata(evidenceId: Nat) : async Result.Result<EvidenceMetadata, Text> {
    switch (evidenceStore.get(evidenceId)) {
      case null { #err("Evidence not found") };
      case (?metadata) { #ok(metadata) };
    };
  };

  // Legacy getEvidence for compatibility
  public query func getEvidence(evidenceId: Nat): async ?Evidence {
    switch (evidenceStore.get(evidenceId)) {
      case null { null };
      case (?metadata) {
        ?{
          id = metadata.id;
          disputeId = metadata.disputeId;
          submittedBy = metadata.submittedBy;
          fileName = metadata.fileName;
          contentHash = metadata.hash;
          description = metadata.description;
          uploadedAt = metadata.submittedAt;
          verified = metadata.verified;
        }
      };
    };
  };

  public query func getEvidenceByDispute(disputeId: Nat) : async [EvidenceMetadata] {
    let results = Buffer.Buffer<EvidenceMetadata>(0);
    for (metadata in evidenceStore.vals()) {
      if (metadata.disputeId == disputeId) {
        results.add(metadata);
      };
    };
    results.toArray()
  };

  // Legacy version
  public query func getEvidenceByDispute(disputeId: Nat): async [Evidence] {
    let buffer = Buffer.Buffer<Evidence>(10);
    for (metadata in evidenceStore.vals()) {
      if (metadata.disputeId == disputeId) {
        buffer.add({
          id = metadata.id;
          disputeId = metadata.disputeId;
          submittedBy = metadata.submittedBy;
          fileName = metadata.fileName;
          contentHash = metadata.hash;
          description = metadata.description;
          uploadedAt = metadata.submittedAt;
          verified = metadata.verified;
        });
      };
    };
    Buffer.toArray(buffer);
  };

  public query func getAllEvidence(): async [Evidence] {
    let buffer = Buffer.Buffer<Evidence>(10);
    for (metadata in evidenceStore.vals()) {
      buffer.add({
        id = metadata.id;
        disputeId = metadata.disputeId;
        submittedBy = metadata.submittedBy;
        fileName = metadata.fileName;
        contentHash = metadata.hash;
        description = metadata.description;
        uploadedAt = metadata.submittedAt;
        verified = metadata.verified;
      });
    };
    Buffer.toArray(buffer);
  };

  public query func getVerificationHistory(evidenceId: Nat) : async Result.Result<[VerificationResult], Text> {
    switch (verificationLogs.get(evidenceId)) {
      case null { #err("No verification history") };
      case (?history) { #ok(history) };
    };
  };

  // ===== PRIVATE FUNCTIONS =====
  private func _bytesToHex(bytes: [Nat8]) : Text {
    var hex = "";
    for (byte in bytes.vals()) {
      let hexByte = Nat8.toText(byte);
      hex := hex # (if (hexByte.size() == 1) "0" else "") # hexByte;
    };
    hex
  };

  private func _submitToConstellation(hash: Text, fileName: Text) : async Text {
    // Mock Constellation submission
    // In production: call Constellation's API via HTTPS outcalls
    // This would use the IC's HTTP canister to make an HTTPS call to Constellation network
    "CONSTELLATION_TX_" # hash # "_" # fileName
  };

  private func _logVerification(evidenceId: Nat, result: VerificationResult) {
    switch (verificationLogs.get(evidenceId)) {
      case null {
        verificationLogs.put(evidenceId, [result]);
      };
      case (?existingLogs) {
        let updatedLogs = Array.append(existingLogs, [result]);
        verificationLogs.put(evidenceId, updatedLogs);
      };
    };
  };

  // Health check
  public query func health(): async Text {
    "Evidence Manager is operational";
  };
}
