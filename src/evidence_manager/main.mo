import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Blob "mo:base/Blob";

actor EvidenceManager {
  
  // Types
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

  // State
  private stable var evidenceArray: [Evidence] = [];
  private stable var nextEvidenceId: Nat = 1;
  private func natHash(n: Nat): Hash.Hash {
    Text.hash(Nat.toText(n));
  };
  private let evidenceMap = HashMap.HashMap<Nat, Evidence>(10, Nat.equal, natHash);

  // Pre-upgrade
  system func preupgrade() {
    let buffer = Buffer.Buffer<Evidence>(evidenceMap.size());
    for ((_, evidence) in evidenceMap.entries()) {
      buffer.add(evidence);
    };
    evidenceArray := Buffer.toArray(buffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for (evidence in evidenceArray.vals()) {
      evidenceMap.put(evidence.id, evidence);
    };
  };

  // Submit evidence
  public shared(msg) func submitEvidence(
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

    let newEvidence: Evidence = {
      id = evidenceId;
      disputeId = disputeId;
      submittedBy = msg.caller;
      fileName = fileName;
      contentHash = contentHash;
      description = description;
      uploadedAt = Time.now();
      verified = false;
    };

    evidenceMap.put(evidenceId, newEvidence);
    #ok(evidenceId);
  };

  // Get evidence by ID
  public query func getEvidence(evidenceId: Nat): async ?Evidence {
    evidenceMap.get(evidenceId);
  };

  // Get all evidence for a dispute
  public query func getEvidenceByDispute(disputeId: Nat): async [Evidence] {
    let buffer = Buffer.Buffer<Evidence>(10);
    for (evidence in evidenceMap.vals()) {
      if (evidence.disputeId == disputeId) {
        buffer.add(evidence);
      };
    };
    Buffer.toArray(buffer);
  };

  // Get all evidence
  public query func getAllEvidence(): async [Evidence] {
    let buffer = Buffer.Buffer<Evidence>(10);
    for (evidence in evidenceMap.vals()) {
      buffer.add(evidence);
    };
    Buffer.toArray(buffer);
  };

  // Verify evidence
  public shared(msg) func verifyEvidence(evidenceId: Nat): async Result.Result<(), Text> {
    switch (evidenceMap.get(evidenceId)) {
      case null { #err("Evidence not found") };
      case (?evidence) {
        let updated: Evidence = {
          evidence with verified = true;
        };
        evidenceMap.put(evidenceId, updated);
        #ok();
      };
    };
  };

  // Health check
  public query func health(): async Text {
    "Evidence Manager is operational";
  };
};
