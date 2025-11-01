import Types "../types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Nat "mo:base/Nat";

actor BitcoinEscrow {
    // State variables
    private stable var escrowCounter: Nat = 0;
    private var escrows = HashMap.HashMap<Text, Types.Escrow>(10, Text.equal, Text.hash);
    private var disputeEscrows = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);

    // Create escrow for dispute
    public shared(msg) func createEscrow(
        disputeId: Text,
        amount: Nat,
        beneficiary: Principal
    ) : async Result.Result<Text, Text> {
        escrowCounter += 1;
        let escrowId = "ESCROW-" # Nat.toText(escrowCounter);
        
        let escrow: Types.Escrow = {
            id = escrowId;
            disputeId = disputeId;
            amount = amount;
            depositor = msg.caller;
            beneficiary = beneficiary;
            status = #Pending;
            createdAt = Time.now();
            releasedAt = null;
        };
        
        escrows.put(escrowId, escrow);
        disputeEscrows.put(disputeId, escrowId);
        
        #ok(escrowId)
    };

    // Get escrow by ID
    public query func getEscrow(escrowId: Text) : async ?Types.Escrow {
        escrows.get(escrowId)
    };

    // Get escrow by dispute ID
    public query func getEscrowByDispute(disputeId: Text) : async ?Types.Escrow {
        switch(disputeEscrows.get(disputeId)) {
            case(?escrowId) {
                escrows.get(escrowId)
            };
            case(null) { null };
        }
    };

    // Fund escrow (simulated Bitcoin deposit)
    public shared(msg) func fundEscrow(escrowId: Text) : async Result.Result<Text, Text> {
        switch(escrows.get(escrowId)) {
            case(?escrow) {
                if (escrow.depositor != msg.caller) {
                    return #err("Only depositor can fund escrow");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Escrow is not in pending state");
                };
                
                // In a real scenario, this would involve an inter-canister call to the Bitcoin canister
                // to verify the deposit and update the status. For now, we keep the simulation.
                
                let updatedEscrow: Types.Escrow = {
                    id = escrow.id;
                    disputeId = escrow.disputeId;
                    amount = escrow.amount;
                    depositor = escrow.depositor;
                    beneficiary = escrow.beneficiary;
                    status = #Funded;
                    createdAt = escrow.createdAt;
                    releasedAt = null;
                };
                
                escrows.put(escrowId, updatedEscrow);
                #ok("Escrow funded successfully (simulated)")
            };
            case(null) {
                #err("Escrow not found")
            };
        }
    };

    // Release escrow to beneficiary
    public shared(msg) func releaseEscrow(escrowId: Text) : async Result.Result<Text, Text> {
        // NOTE: In a real system, this function should only be callable by the ArbitraBackend canister
        // after a decision has been made, or by a designated admin/controller.
        // For this hackathon submission, we will assume the caller is authorized.
        
        switch(escrows.get(escrowId)) {
            case(?escrow) {
                if (escrow.status != #Funded and escrow.status != #Disputed) {
                    return #err("Escrow must be funded or disputed before release");
                };
                
                let updatedEscrow: Types.Escrow = {
                    id = escrow.id;
                    disputeId = escrow.disputeId;
                    amount = escrow.amount;
                    depositor = escrow.depositor;
                    beneficiary = escrow.beneficiary;
                    status = #Released;
                    createdAt = escrow.createdAt;
                    releasedAt = ?Time.now();
                };
                
                escrows.put(escrowId, updatedEscrow);
                #ok("Escrow released to beneficiary")
            };
            case(null) {
                #err("Escrow not found")
            };
        }
    };

    // Refund escrow to depositor
    public shared(msg) func refundEscrow(escrowId: Text) : async Result.Result<Text, Text> {
        // NOTE: In a real system, this function should only be callable by the ArbitraBackend canister
        // after a decision has been made, or by a designated admin/controller.
        // For this hackathon submission, we will assume the caller is authorized.
        
        switch(escrows.get(escrowId)) {
            case(?escrow) {
                if (escrow.status != #Funded and escrow.status != #Disputed) {
                    return #err("Escrow cannot be refunded in current state");
                };
                
                let updatedEscrow: Types.Escrow = {
                    id = escrow.id;
                    disputeId = escrow.disputeId;
                    amount = escrow.amount;
                    depositor = escrow.depositor;
                    beneficiary = escrow.beneficiary;
                    status = #Refunded;
                    createdAt = escrow.createdAt;
                    releasedAt = ?Time.now();
                };
                
                escrows.put(escrowId, updatedEscrow);
                #ok("Escrow refunded to depositor")
            };
            case(null) {
                #err("Escrow not found")
            };
        }
    };

    // Mark escrow as disputed
    public shared(msg) func markDisputed(escrowId: Text) : async Result.Result<Text, Text> {
        switch(escrows.get(escrowId)) {
            case(?escrow) {
                let updatedEscrow: Types.Escrow = {
                    id = escrow.id;
                    disputeId = escrow.disputeId;
                    amount = escrow.amount;
                    depositor = escrow.depositor;
                    beneficiary = escrow.beneficiary;
                    status = #Disputed;
                    createdAt = escrow.createdAt;
                    releasedAt = null;
                };
                
                escrows.put(escrowId, updatedEscrow);
                #ok("Escrow marked as disputed")
            };
            case(null) {
                #err("Escrow not found")
            };
        }
    };

    // Get all escrows
    public query func getAllEscrows() : async [Types.Escrow] {
        Iter.toArray(escrows.vals())
    };

    // Get escrows by depositor
    public query func getEscrowsByDepositor(depositor: Principal) : async [Types.Escrow] {
        let allEscrows = Iter.toArray(escrows.vals());
        Array.filter<Types.Escrow>(allEscrows, func(e) {
            e.depositor == depositor
        })
    };

    // Get escrows by beneficiary
    public query func getEscrowsByBeneficiary(beneficiary: Principal) : async [Types.Escrow] {
        let allEscrows = Iter.toArray(escrows.vals());
        Array.filter<Types.Escrow>(allEscrows, func(e) {
            e.beneficiary == beneficiary
        })
    };

    // Get escrow balance (for display purposes)
    public query func getEscrowBalance(escrowId: Text) : async ?Nat {
        switch(escrows.get(escrowId)) {
            case(?escrow) {
                switch(escrow.status) {
                    case(#Funded) { ?escrow.amount };
                    case(#Disputed) { ?escrow.amount };
                    case(_) { ?0 };
                }
            };
            case(null) { null };
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
