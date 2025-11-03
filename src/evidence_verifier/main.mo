// Evidence Verification Module with Constellation Integration
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";

actor EvidenceVerifier {
    
    public type VerificationResult = {
        evidenceId: Text;
        verified: Bool;
        constellationTxId: Text;
        verifiedAt: Int;
        method: Text;
    };

    private stable var verificationArray: [(Text, VerificationResult)] = [];
    private func textHash(t: Text): Hash.Hash { 
        Text.hash(t)
    };
    private let verifications = HashMap.HashMap<Text, VerificationResult>(0, Text.equal, Text.hash);

    // Pre-upgrade hook
    system func preupgrade() {
        let buffer = Buffer.Buffer<(Text, VerificationResult)>(verifications.size());
        for ((id, result) in verifications.entries()) {
            buffer.add((id, result));
        };
        verificationArray := Buffer.toArray(buffer);
    };

    // Post-upgrade hook
    system func postupgrade() {
        for ((id, result) in verificationArray.vals()) {
            verifications.put(id, result);
        };
    };

    // Submits evidence hash to Constellation network for immutable anchoring
    public shared func verifyEvidenceWithConstellation(
        evidenceId: Text,
        contentHash: Text,
        metadata: Text
    ) : async Result.Result<VerificationResult, Text> {
        
        try {
            // This would integrate with Constellation's Hypergraph
            // Using their JavaScript SDK or direct API calls via HTTPS outcalls
            
            let constellationTxId = await _submitToConstellation(contentHash, metadata);
            
            let result: VerificationResult = {
                evidenceId = evidenceId;
                verified = true;
                constellationTxId = constellationTxId;
                verifiedAt = Time.now();
                method = "CONSTELLATION_HYPERGRAPH";
            };

            verifications.put(evidenceId, result);
            #ok(result)
            
        } catch (e) {
            #err("Constellation verification failed: " # Error.message(e))
        }
    };

    // Verifies evidence integrity against Constellation network
    public shared func verifyEvidenceIntegrity(
        evidenceId: Text,
        currentHash: Text
    ) : async Result.Result<Bool, Text> {
        
        switch (verifications.get(evidenceId)) {
            case (null) { #err("No verification record found") };
            case (?verification) {
                // In production, this would query Constellation network
                // to verify the hash is still valid and unchanged
                let stillValid = await _checkConstellationValidity(verification.constellationTxId, currentHash);
                #ok(stillValid)
            };
        };
    };

    public query func getVerification(evidenceId: Text) : async Result.Result<VerificationResult, Text> {
        switch (verifications.get(evidenceId)) {
            case (null) { #err("Verification record not found") };
            case (?result) { #ok(result) };
        };
    };

    public query func getAllVerifications() : async [VerificationResult] {
        let buffer = Buffer.Buffer<VerificationResult>(0);
        for (result in verifications.vals()) {
            buffer.add(result);
        };
        Buffer.toArray(buffer);
    };

    private func _submitToConstellation(hash: Text, metadata: Text) : async Text {
        // Integration with Constellation network
        // This would use their testnet/mainnet API via HTTPS outcalls
        // In production, this would make an HTTPS outcall to Constellation's API
        "CONSTELLATION_TX_" # hash # "_" # Int.toText(Time.now())
    };

    private func _checkConstellationValidity(txId: Text, currentHash: Text) : async Bool {
        // Query Constellation to verify transaction and hash integrity
        // In production, this would make an HTTPS outcall to Constellation's API
        // to verify the transaction and check the hash hasn't changed
        true // Mock response
    };

    // Health check
    public query func health() : async Text {
        "Evidence Verifier is operational"
    };
};

