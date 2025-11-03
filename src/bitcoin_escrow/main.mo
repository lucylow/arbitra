import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";

actor BitcoinEscrow {
  
  // Types
  public type EscrowStatus = {
    #Pending;
    #Funded;
    #Released;
    #Refunded;
    #Disputed;
  };

  public type Escrow = {
    id: Nat;
    disputeId: Nat;
    depositor: Principal;
    beneficiary: Principal;
    amount: Nat;
    status: EscrowStatus;
    createdAt: Int;
    updatedAt: Int;
    releasedAt: ?Int;
    refundedAt: ?Int;
  };

  // State
  private stable var escrowArray: [Escrow] = [];
  private stable var nextEscrowId: Nat = 1;
  private func natHash(n: Nat): Hash.Hash {
    Text.hash(Nat.toText(n));
  };
  private let escrowMap = HashMap.HashMap<Nat, Escrow>(10, Nat.equal, natHash);
  private let disputeToEscrowMap = HashMap.HashMap<Nat, Nat>(10, Nat.equal, natHash);

  // Pre-upgrade
  system func preupgrade() {
    let buffer = Buffer.Buffer<Escrow>(escrowMap.size());
    for ((_, escrow) in escrowMap.entries()) {
      buffer.add(escrow);
    };
    escrowArray := Buffer.toArray(buffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for (escrow in escrowArray.vals()) {
      escrowMap.put(escrow.id, escrow);
      disputeToEscrowMap.put(escrow.disputeId, escrow.id);
    };
  };

  // Create escrow
  public shared(msg) func createEscrow(
    disputeId: Nat,
    beneficiary: Principal,
    amount: Nat
  ): async Result.Result<Nat, Text> {
    // Validation
    if (amount == 0) {
      return #err("Amount must be greater than 0");
    };
    if (msg.caller == beneficiary) {
      return #err("Depositor and beneficiary must be different");
    };

    // Check if escrow already exists for this dispute
    switch (disputeToEscrowMap.get(disputeId)) {
      case (?existingId) {
        return #err("Escrow already exists for this dispute");
      };
      case null {};
    };

    let escrowId = nextEscrowId;
    nextEscrowId += 1;

    let newEscrow: Escrow = {
      id = escrowId;
      disputeId = disputeId;
      depositor = msg.caller;
      beneficiary = beneficiary;
      amount = amount;
      status = #Pending;
      createdAt = Time.now();
      updatedAt = Time.now();
      releasedAt = null;
      refundedAt = null;
    };

    escrowMap.put(escrowId, newEscrow);
    disputeToEscrowMap.put(disputeId, escrowId);
    #ok(escrowId);
  };

  // Fund escrow
  public shared(msg) func fundEscrow(escrowId: Nat): async Result.Result<(), Text> {
    switch (escrowMap.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) {
        if (escrow.depositor != msg.caller) {
          return #err("Only depositor can fund escrow");
        };
        if (escrow.status != #Pending) {
          return #err("Escrow must be in Pending status to fund");
        };

        let updated: Escrow = {
          escrow with
          status = #Funded;
          updatedAt = Time.now();
        };

        escrowMap.put(escrowId, updated);
        #ok();
      };
    };
  };

  // Release escrow
  public shared(msg) func releaseEscrow(escrowId: Nat): async Result.Result<(), Text> {
    switch (escrowMap.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) {
        if (escrow.status != #Funded) {
          return #err("Escrow must be funded to release");
        };

        let updated: Escrow = {
          escrow with
          status = #Released;
          updatedAt = Time.now();
          releasedAt = ?Time.now();
        };

        escrowMap.put(escrowId, updated);
        #ok();
      };
    };
  };

  // Refund escrow
  public shared(msg) func refundEscrow(escrowId: Nat): async Result.Result<(), Text> {
    switch (escrowMap.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) {
        if (escrow.status != #Funded) {
          return #err("Escrow must be funded to refund");
        };

        let updated: Escrow = {
          escrow with
          status = #Refunded;
          updatedAt = Time.now();
          refundedAt = ?Time.now();
        };

        escrowMap.put(escrowId, updated);
        #ok();
      };
    };
  };

  // Get escrow by ID
  public query func getEscrow(escrowId: Nat): async ?Escrow {
    escrowMap.get(escrowId);
  };

  // Get escrow by dispute ID
  public query func getEscrowByDispute(disputeId: Nat): async ?Escrow {
    switch (disputeToEscrowMap.get(disputeId)) {
      case (?escrowId) { escrowMap.get(escrowId) };
      case null { null };
    };
  };

  // Get all escrows
  public query func getAllEscrows(): async [Escrow] {
    let buffer = Buffer.Buffer<Escrow>(10);
    for (escrow in escrowMap.vals()) {
      buffer.add(escrow);
    };
    Buffer.toArray(buffer);
  };

  // Health check
  public query func health(): async Text {
    "Bitcoin Escrow is operational";
  };
};

