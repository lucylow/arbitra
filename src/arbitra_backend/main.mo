import Types "../types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Nat "mo:base/Nat";

actor ArbitraBackend {
    // State variables
    private stable var disputeCounter: Nat = 0;
    private var disputes = HashMap.HashMap<Text, Types.Dispute>(10, Text.equal, Text.hash);
    private var userProfiles = HashMap.HashMap<Principal, Types.UserProfile>(10, Principal.equal, Principal.hash);
    private var arbitrators = HashMap.HashMap<Principal, Types.Arbitrator>(10, Principal.equal, Principal.hash);
    private stable var admin: Principal = Principal.fromText("2vxsx-fae"); // Default anonymous principal

    // Admin function to set the admin principal
    public shared(msg) func setAdmin(newAdmin: Principal) : async Result.Result<Text, Text> {
        if (msg.caller != admin and admin != Principal.fromText("2vxsx-fae")) {
            return #err("Only current admin can set new admin");
        };
        admin := newAdmin;
        #ok("Admin principal updated successfully")
    };

    // Helper function for admin check
    private func isAdmin(p: Principal) : Bool {
        p == admin
    };

    // Create a new dispute
    public shared(msg) func createDispute(
        respondent: Principal,
        title: Text,
        description: Text,
        amount: Nat
    ) : async Result.Result<Text, Text> {
        disputeCounter += 1;
        let disputeId = "DISPUTE-" # Nat.toText(disputeCounter);
        
        let dispute: Types.Dispute = {
            id = disputeId;
            claimant = msg.caller;
            respondent = respondent;
            arbitrator = null;
            title = title;
            description = description;
            amount = amount;
            status = #Pending;
            createdAt = Time.now();
            updatedAt = Time.now();
            decision = null;
            escrowId = null;
        };
        
        disputes.put(disputeId, dispute);
        #ok(disputeId)
    };

    // Get dispute by ID
    public query func getDispute(disputeId: Text) : async ?Types.Dispute {
        disputes.get(disputeId)
    };

    // Get all disputes
    public query func getAllDisputes() : async [Types.Dispute] {
        Iter.toArray(disputes.vals())
    };

    // Get disputes by user
    public query func getDisputesByUser(user: Principal) : async [Types.Dispute] {
        let allDisputes = Iter.toArray(disputes.vals());
        Array.filter<Types.Dispute>(allDisputes, func(d) {
            d.claimant == user or d.respondent == user or 
            (switch(d.arbitrator) { case(?arb) { arb == user }; case(null) { false } })
        })
    };

    // Assign arbitrator to dispute
    public shared(msg) func assignArbitrator(disputeId: Text, arbitrator: Principal) : async Result.Result<Text, Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can assign an arbitrator");
        };
        switch(disputes.get(disputeId)) {
            case(?dispute) {
                let updatedDispute: Types.Dispute = {
                    id = dispute.id;
                    claimant = dispute.claimant;
                    respondent = dispute.respondent;
                    arbitrator = ?arbitrator;
                    title = dispute.title;
                    description = dispute.description;
                    amount = dispute.amount;
                    status = #EvidenceSubmission;
                    createdAt = dispute.createdAt;
                    updatedAt = Time.now();
                    decision = dispute.decision;
                    escrowId = dispute.escrowId;
                };
                disputes.put(disputeId, updatedDispute);
                #ok("Arbitrator assigned successfully")
            };
            case(null) {
                #err("Dispute not found")
            };
        }
    };

    // Update dispute status
    public shared(msg) func updateDisputeStatus(disputeId: Text, status: Types.DisputeStatus) : async Result.Result<Text, Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can update dispute status");
        };
        switch(disputes.get(disputeId)) {
            case(?dispute) {
                let updatedDispute: Types.Dispute = {
                    id = dispute.id;
                    claimant = dispute.claimant;
                    respondent = dispute.respondent;
                    arbitrator = dispute.arbitrator;
                    title = dispute.title;
                    description = dispute.description;
                    amount = dispute.amount;
                    status = status;
                    createdAt = dispute.createdAt;
                    updatedAt = Time.now();
                    decision = dispute.decision;
                    escrowId = dispute.escrowId;
                };
                disputes.put(disputeId, updatedDispute);
                #ok("Status updated successfully")
            };
            case(null) {
                #err("Dispute not found")
            };
        }
    };

    // Submit decision
    public shared(msg) func submitDecision(disputeId: Text, decision: Text) : async Result.Result<Text, Text> {
        switch(disputes.get(disputeId)) {
            case(?dispute) {
                // Verify caller is the assigned arbitrator
                switch(dispute.arbitrator) {
                    case(?arb) {
                        if (arb != msg.caller) {
                            return #err("Only assigned arbitrator can submit decision");
                        };
                    };
                    case(null) {
                        return #err("No arbitrator assigned");
                    };
                };

                let updatedDispute: Types.Dispute = {
                    id = dispute.id;
                    claimant = dispute.claimant;
                    respondent = dispute.respondent;
                    arbitrator = dispute.arbitrator;
                    title = dispute.title;
                    description = dispute.description;
                    amount = dispute.amount;
                    status = #Decided;
                    createdAt = dispute.createdAt;
                    updatedAt = Time.now();
                    decision = ?decision;
                    escrowId = dispute.escrowId;
                };
                disputes.put(disputeId, updatedDispute);
                #ok("Decision submitted successfully")
            };
            case(null) {
                #err("Dispute not found")
            };
        }
    };

    // Register user profile
    public shared(msg) func registerUser(name: Text, email: Text, role: Types.UserRole) : async Result.Result<Text, Text> {
        let profile: Types.UserProfile = {
            principal = msg.caller;
            name = name;
            email = email;
            role = role;
            joinedAt = Time.now();
            casesInvolved = [];
        };
        userProfiles.put(msg.caller, profile);
        #ok("User registered successfully")
    };

    // Get user profile
    public query func getUserProfile(user: Principal) : async ?Types.UserProfile {
        userProfiles.get(user)
    };

    // Register arbitrator
    public shared(msg) func registerArbitrator(name: Text, expertise: [Text]) : async Result.Result<Text, Text> {
        let arbitrator: Types.Arbitrator = {
            principal = msg.caller;
            name = name;
            expertise = expertise;
            casesHandled = 0;
            rating = 0.0;
            available = true;
        };
        arbitrators.put(msg.caller, arbitrator);
        #ok("Arbitrator registered successfully")
    };

    // Get all available arbitrators
    public query func getAvailableArbitrators() : async [Types.Arbitrator] {
        let allArbitrators = Iter.toArray(arbitrators.vals());
        Array.filter<Types.Arbitrator>(allArbitrators, func(a) { a.available })
    };

    // Link escrow to dispute
    public shared(msg) func linkEscrow(disputeId: Text, escrowId: Text) : async Result.Result<Text, Text> {
        switch(disputes.get(disputeId)) {
            case(?dispute) {
                let updatedDispute: Types.Dispute = {
                    id = dispute.id;
                    claimant = dispute.claimant;
                    respondent = dispute.respondent;
                    arbitrator = dispute.arbitrator;
                    title = dispute.title;
                    description = dispute.description;
                    amount = dispute.amount;
                    status = dispute.status;
                    createdAt = dispute.createdAt;
                    updatedAt = Time.now();
                    decision = dispute.decision;
                    escrowId = ?escrowId;
                };
                disputes.put(disputeId, updatedDispute);
                #ok("Escrow linked successfully")
            };
            case(null) {
                #err("Dispute not found")
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
