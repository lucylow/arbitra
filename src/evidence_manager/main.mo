import Types "../types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import SHA256 "mo:sha2/Sha256";

actor EvidenceManager {
    // State variables
    private stable var evidenceCounter: Nat = 0;
    private var evidences = HashMap.HashMap<Text, Types.Evidence>(10, Text.equal, Text.hash);
    private var disputeEvidences = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash);

    // Helper function to compute SHA256 hash
    private func computeHash(content: Blob) : Text {
        let hash = SHA256.fromBlob(#sha256, content);
        Blob.toHex(hash)
    };

    // Submit evidence
    public shared(msg) func submitEvidence(
        disputeId: Text,
        evidenceType: Types.EvidenceType,
        content: Blob,
        description: Text
    ) : async Result.Result<Text, Text> {
        evidenceCounter += 1;
        let evidenceId = "EVIDENCE-" # Nat.toText(evidenceCounter);
        
        // Compute content hash for verification
        let contentHash = computeHash(content);
        
        let evidence: Types.Evidence = {
            id = evidenceId;
            disputeId = disputeId;
            submittedBy = msg.caller;
            evidenceType = evidenceType;
            contentHash = contentHash;
            description = description;
            timestamp = Time.now();
            verified = true;
        };
        
        evidences.put(evidenceId, evidence);
        
        // Add to dispute's evidence list
        let currentEvidences = switch(disputeEvidences.get(disputeId)) {
            case(?list) { list };
            case(null) { [] };
        };
        let updatedEvidences = Array.append<Text>(currentEvidences, [evidenceId]);
        disputeEvidences.put(disputeId, updatedEvidences);
        
        #ok(evidenceId)
    };

    // Get evidence by ID
    public query func getEvidence(evidenceId: Text) : async ?Types.Evidence {
        evidences.get(evidenceId)
    };

    // Get all evidence for a dispute
    public query func getDisputeEvidence(disputeId: Text) : async [Types.Evidence] {
        switch(disputeEvidences.get(disputeId)) {
            case(?evidenceIds) {
                let evidenceList = Array.mapFilter<Text, Types.Evidence>(
                    evidenceIds,
                    func(id) { evidences.get(id) }
                );
                evidenceList
            };
            case(null) { [] };
        }
    };

    // Verify evidence integrity
    public func verifyEvidence(evidenceId: Text, content: Blob) : async Result.Result<Bool, Text> {
        switch(evidences.get(evidenceId)) {
            case(?evidence) {
                let computedHash = computeHash(content);
                if (computedHash == evidence.contentHash) {
                    #ok(true)
                } else {
                    #ok(false)
                }
            };
            case(null) {
                #err("Evidence not found")
            };
        }
    };

    // Get evidence count for dispute
    public query func getEvidenceCount(disputeId: Text) : async Nat {
        switch(disputeEvidences.get(disputeId)) {
            case(?evidenceIds) { evidenceIds.size() };
            case(null) { 0 };
        }
    };

    // Get all evidence submitted by user
    public query func getEvidenceByUser(user: Principal) : async [Types.Evidence] {
        let allEvidence = Iter.toArray(evidences.vals());
        Array.filter<Types.Evidence>(allEvidence, func(e) {
            e.submittedBy == user
        })
    };

    // Mark evidence as verified
    public shared(msg) func markVerified(evidenceId: Text, verified: Bool) : async Result.Result<Text, Text> {
        switch(evidences.get(evidenceId)) {
            case(?evidence) {
                let updatedEvidence: Types.Evidence = {
                    id = evidence.id;
                    disputeId = evidence.disputeId;
                    submittedBy = evidence.submittedBy;
                    evidenceType = evidence.evidenceType;
                    contentHash = evidence.contentHash;
                    description = evidence.description;
                    timestamp = evidence.timestamp;
                    verified = verified;
                };
                evidences.put(evidenceId, updatedEvidence);
                #ok("Evidence verification status updated")
            };
            case(null) {
                #err("Evidence not found")
            };
        }
    };

    // System upgrade hooks
    system func preupgrade() {
        // State is already stable
    };

    system func postupgrade() {
        // Reinitialize if needed
    };
}
