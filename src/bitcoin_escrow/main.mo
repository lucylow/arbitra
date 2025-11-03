import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";

actor BitcoinEscrow {
  
  // Import Ruling type from ArbitraBackend (would need to be shared in production)
  public type Ruling = {
    id: Nat;
    disputeId: Nat;
    decision: Text;
    reasoning: Text;
    keyFactors: [Text];
    confidenceScore: Float;
    issuedBy: Principal;
    issuedAt: Int;
    plaintiffAward: Nat; // Percentage 0-100 for settlement calculation
  };

  public type EscrowStatus = {
    #PENDING;
    #FUNDED;
    #SETTLED;
    #REFUNDED;
    #DISPUTED;
  };

  public type Escrow = {
    id: Nat;
    disputeId: Nat;
    depositor: Principal;
    beneficiary: Principal;
    amount: Nat;
    currency: Text;
    status: EscrowStatus;
    createdAt: Int;
    updatedAt: Int;
    settledAt: ?Int;
    refundedAt: ?Int;
    transactionHash: ?Text;
  };

  public type SettlementRequest = {
    disputeId: Nat;
    rulingId: Nat;
    plaintiffAward: Nat; // Percentage 0-100
  };

  public type Transaction = {
    txId: Text;
    from: Principal;
    to: Principal;
    amount: Nat;
    currency: Text;
    timestamp: Int;
    disputeId: Nat;
    txType: Text; // "DEPOSIT", "SETTLEMENT", "REFUND"
  };

  // Enhanced Escrow Account with fee tracking
  public type EscrowAccount = {
    dispute_id: Nat;
    total_amount: Nat;
    net_amount: Nat; // Amount after fees
    platform_fee: Nat;
    status: EscrowStatus;
    plaintiff: Principal;
    defendant: Principal;
    funded_at: Int;
    currency: Text;
  };

  public type FeeTransaction = {
    dispute_id: Nat;
    fee_type: Text;
    amount: Nat;
    transaction_hash: Text;
    timestamp: Int;
  };

  // State
  private stable var escrowArray: [Escrow] = [];
  private stable var nextEscrowId: Nat = 1;
  private stable var nextTxId: Nat = 1;
  private stable var feeTransactionsArray: [FeeTransaction] = [];
  private func natHash(n: Nat): Hash.Hash {
    Text.hash(Nat.toText(n));
  };
  private let escrowAccounts = HashMap.HashMap<Nat, Escrow>(10, Nat.equal, natHash);
  private let transactions = HashMap.HashMap<Text, Transaction>(10, Text.equal, Text.hash);
  private let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  private let disputeToEscrowMap = HashMap.HashMap<Nat, Nat>(10, Nat.equal, natHash);
  private let feeTransactions = HashMap.HashMap<Text, FeeTransaction>(10, Text.equal, Text.hash);
  private var platformTreasury: Nat = 0;
  
  // Platform fee configuration (1.5%)
  private let PLATFORM_FEE_PERCENTAGE : Nat = 150; // 1.5% in basis points
  private let PLATFORM_ACCOUNT_ID : Text = "platform_treasury_account_id";

  // Pre-upgrade
  system func preupgrade() {
    let buffer = Buffer.Buffer<Escrow>(escrowAccounts.size());
    for ((_, escrow) in escrowAccounts.entries()) {
      buffer.add(escrow);
    };
    escrowArray := Buffer.toArray(buffer);
    
    let feeBuffer = Buffer.Buffer<FeeTransaction>(feeTransactions.size());
    for ((_, feeTx) in feeTransactions.entries()) {
      feeBuffer.add(feeTx);
    };
    feeTransactionsArray := Buffer.toArray(feeBuffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for (escrow in escrowArray.vals()) {
      escrowAccounts.put(escrow.id, escrow);
      disputeToEscrowMap.put(escrow.disputeId, escrow.id);
    };
    
    for (feeTx in feeTransactionsArray.vals()) {
      feeTransactions.put(feeTx.transaction_hash, feeTx);
    };
  };

  // ===== ESCROW MANAGEMENT =====
  public shared ({ caller }) func createEscrow(
    disputeId: Nat,
    beneficiary: Principal,
    amount: Nat,
    currency: Text
  ) : async Result.Result<Nat, Text> {
    
    // Validation
    if (amount == 0) {
      return #err("Amount must be greater than 0");
    };
    if (caller == beneficiary) {
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

    let escrow: Escrow = {
      id = escrowId;
      disputeId = disputeId;
      depositor = caller;
      beneficiary = beneficiary;
      amount = amount;
      currency = currency;
      status = #PENDING;
      createdAt = Time.now();
      updatedAt = Time.now();
      settledAt = null;
      refundedAt = null;
      transactionHash = null;
    };

    escrowAccounts.put(escrowId, escrow);
    disputeToEscrowMap.put(disputeId, escrowId);
    #ok(escrowId)
  };

  // Legacy createEscrow for compatibility
  public shared ({ caller }) func createEscrow(
    disputeId: Nat,
    beneficiary: Principal,
    amount: Nat
  ): async Result.Result<Nat, Text> {
    createEscrow(disputeId, beneficiary, amount, "USD")
  };

  public shared ({ caller }) func fundEscrow(escrowId: Nat) : async Result.Result<Text, Text> {
    switch (escrowAccounts.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) {
        if (caller != escrow.depositor and caller != escrow.beneficiary) {
          return #err("Unauthorized");
        };

        if (escrow.status != #PENDING) {
          return #err("Escrow must be in Pending status to fund");
        };

        // In production, this would handle actual token transfer
        // For MVP, we'll simulate the funding

        let updatedEscrow: Escrow = {
          escrow with
          status = #FUNDED;
          updatedAt = Time.now();
        };

        escrowAccounts.put(escrowId, updatedEscrow);

        // Record transaction
        let txId = "TX_" # Int.toText(nextTxId);
        nextTxId += 1;

        let transaction: Transaction = {
          txId = txId;
          from = caller;
          to = Principal.fromText("escrow"); // Escrow contract address
          amount = escrow.amount;
          currency = escrow.currency;
          timestamp = Time.now();
          disputeId = escrow.disputeId;
          txType = "DEPOSIT";
        };

        transactions.put(txId, transaction);

        #ok(txId)
      };
    };
  };

  // ===== SETTLEMENT EXECUTION WITH MONETIZATION =====
  public shared ({ caller }) func executeSettlement(
    disputeId: Nat,
    ruling: Ruling
  ) : async Result.Result<{
    success: Bool;
    plaintiff_amount: Nat;
    defendant_amount: Nat;
    platform_fee: Nat;
    transaction_hash: Text;
  }, Text> {
    
    // Find escrow account for this dispute
    var targetEscrow: ?Escrow = null;
    var escrowId: Nat = 0;

    switch (disputeToEscrowMap.get(disputeId)) {
      case (?id) {
        switch (escrowAccounts.get(id)) {
          case (?escrow) {
            targetEscrow := ?escrow;
            escrowId := id;
          };
          case null {};
        };
      };
      case null {};
    };

    switch (targetEscrow) {
      case null { #err("Escrow account not found for dispute") };
      case (?escrow) {
        if (escrow.status != #FUNDED) {
          return #err("Escrow not funded");
        };

        // Calculate platform fee
        let platform_fee = (escrow.amount * PLATFORM_FEE_PERCENTAGE) / 10000;
        let net_amount = escrow.amount - platform_fee;

        // Calculate settlement amounts based on ruling
        // Assuming ruling.plaintiffAward is a percentage 0-100
        let plaintiffAwardPct = if (ruling.plaintiffAward > 100) { 100 } else { ruling.plaintiffAward };
        let plaintiffAmount: Nat = (net_amount * plaintiffAwardPct) / 100;
        let defendantAmount: Nat = net_amount - plaintiffAmount;

        // Execute settlements
        let plaintiffTx = await _transferFunds(escrow.depositor, plaintiffAmount, escrow.currency, disputeId, "SETTLEMENT");
        let defendantTx = await _transferFunds(escrow.beneficiary, defendantAmount, escrow.currency, disputeId, "SETTLEMENT");
        
        // Collect platform fee to treasury
        let fee_tx = await _transferFunds(
          Principal.fromText(PLATFORM_ACCOUNT_ID), 
          platform_fee, 
          escrow.currency,
          disputeId,
          "PLATFORM_FEE"
        );

        // Update platform treasury balance
        platformTreasury += platform_fee;

        // Update escrow status
        let updatedEscrow: Escrow = {
          escrow with
          status = #SETTLED;
          settledAt = ?Time.now();
          transactionHash = ?plaintiffTx;
          updatedAt = Time.now();
        };

        escrowAccounts.put(escrowId, updatedEscrow);

        // Record fee collection
        let collectedFeeTx: FeeTransaction = {
          dispute_id = disputeId;
          fee_type = "platform_fee_collected";
          amount = platform_fee;
          transaction_hash = fee_tx;
          timestamp = Time.now();
        };

        feeTransactions.put(fee_tx, collectedFeeTx);

        #ok({
          success = true;
          plaintiff_amount = plaintiffAmount;
          defendant_amount = defendantAmount;
          platform_fee = platform_fee;
          transaction_hash = fee_tx;
        })
      };
    };
  };

  public shared ({ caller }) func refundEscrow(escrowId: Nat) : async Result.Result<Text, Text> {
    switch (escrowAccounts.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) {
        // Authorization check - only parties can request refund
        if (caller != escrow.depositor and caller != escrow.beneficiary) {
          return #err("Unauthorized");
        };

        if (escrow.status != #FUNDED) {
          return #err("Escrow must be funded to refund");
        };

        // Refund to depositor
        let refundTx = await _transferFunds(escrow.depositor, escrow.amount, escrow.currency, escrow.disputeId, "REFUND");

        let updatedEscrow: Escrow = {
          escrow with
          status = #REFUNDED;
          refundedAt = ?Time.now();
          transactionHash = ?refundTx;
          updatedAt = Time.now();
        };

        escrowAccounts.put(escrowId, updatedEscrow);

        #ok(refundTx)
      };
    };
  };

  // Legacy functions for compatibility
  public shared ({ caller }) func releaseEscrow(escrowId: Nat): async Result.Result<(), Text> {
    switch (escrowAccounts.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) {
        if (escrow.status != #FUNDED) {
          return #err("Escrow must be funded to release");
        };

        let updated: Escrow = {
          escrow with
          status = #SETTLED;
          updatedAt = Time.now();
          settledAt = ?Time.now();
        };

        escrowAccounts.put(escrowId, updated);
        #ok(())
      };
    };
  };

  // ===== QUERY METHODS =====
  public query func getEscrow(escrowId: Nat) : async Result.Result<Escrow, Text> {
    switch (escrowAccounts.get(escrowId)) {
      case null { #err("Escrow not found") };
      case (?escrow) { #ok(escrow) };
    };
  };

  // Legacy getEscrow
  public query func getEscrow(escrowId: Nat): async ?Escrow {
    escrowAccounts.get(escrowId);
  };

  public query func getEscrowByDispute(disputeId: Nat) : async Result.Result<Escrow, Text> {
    switch (disputeToEscrowMap.get(disputeId)) {
      case (?escrowId) {
        switch (escrowAccounts.get(escrowId)) {
          case (?escrow) { #ok(escrow) };
          case null { #err("Escrow not found") };
        };
      };
      case null { #err("Escrow not found for dispute") };
    };
  };

  // Legacy getEscrowByDispute
  public query func getEscrowByDispute(disputeId: Nat): async ?Escrow {
    switch (disputeToEscrowMap.get(disputeId)) {
      case (?escrowId) { escrowAccounts.get(escrowId) };
      case null { null };
    };
  };

  public query func getAllEscrows(): async [Escrow] {
    let buffer = Buffer.Buffer<Escrow>(10);
    for (escrow in escrowAccounts.vals()) {
      buffer.add(escrow);
    };
    Buffer.toArray(buffer);
  };

  public query func getTransactionHistory(principal: Principal) : async [Transaction] {
    let userTxs = Buffer.Buffer<Transaction>(0);
    for (tx in transactions.vals()) {
      if (tx.from == principal or tx.to == principal) {
        userTxs.add(tx);
      };
    };
    userTxs.toArray()
  };

  // ===== PRIVATE FUNCTIONS =====
  private func _transferFunds(
    to: Principal,
    amount: Nat,
    currency: Text,
    disputeId: Nat,
    txType: Text
  ) : async Text {
    
    // In production, this would interact with actual token canisters (ICP, ckBTC, etc.)
    // For MVP, we'll simulate the transfer

    let txId = "TX_" # Int.toText(nextTxId);
    nextTxId += 1;

    let transaction: Transaction = {
      txId = txId;
      from = Principal.fromText("escrow");
      to = to;
      amount = amount;
      currency = currency;
      timestamp = Time.now();
      disputeId = disputeId;
      txType = txType;
    };

    transactions.put(txId, transaction);

    // Update balance (simulated)
    let currentBalance = switch (balances.get(to)) {
      case null { 0 };
      case (?bal) { bal };
    };
    balances.put(to, currentBalance + amount);

    txId
  };

  // ===== MOCK ckBTC INTEGRATION =====
  public shared ({ caller }) func simulateCkBTCTransfer(
    to: Principal,
    amount: Nat
  ) : async Result.Result<Text, Text> {
    
    // Mock ckBTC transfer for demo purposes
    let txId = "ckBTC_TX_" # Int.toText(nextTxId);
    nextTxId += 1;

    let transaction: Transaction = {
      txId = txId;
      from = caller;
      to = to;
      amount = amount;
      currency = "ckBTC";
      timestamp = Time.now();
      disputeId = 0; // Demo transaction
      txType = "ckBTC_TRANSFER";
    };

    transactions.put(txId, transaction);
    #ok(txId)
  };

  // ===== MONETIZATION & REVENUE TRACKING =====
  public query func getPlatformRevenue() : async {
    total_fees_collected: Nat;
    treasury_balance: Nat;
    recent_transactions: [FeeTransaction];
  } {
    // Get recent transactions from last 30 days
    let thirtyDaysAgo = Time.now() - 30 * 24 * 60 * 60 * 1000000000; // nanoseconds
    let recentBuffer = Buffer.Buffer<FeeTransaction>(0);
    
    for (feeTx in feeTransactions.vals()) {
      if (feeTx.timestamp > thirtyDaysAgo) {
        recentBuffer.add(feeTx);
      };
    };

    return {
      total_fees_collected = platformTreasury;
      treasury_balance = platformTreasury;
      recent_transactions = Buffer.toArray(recentBuffer);
    };
  };

  // Enhanced createEscrow with fee calculation
  public shared ({ caller }) func createEscrowWithFees(
    dispute_id: Nat,
    plaintiff: Principal,
    defendant: Principal,
    total_amount: Nat,
    currency: { #ICP; #ckBTC }
  ) : async Result.Result<Text, Text> {
    
    if (total_amount == 0) {
      return #err("Amount must be greater than 0");
    };
    if (caller == defendant) {
      return #err("Plaintiff and defendant must be different");
    };

    // Check if escrow already exists for this dispute
    switch (disputeToEscrowMap.get(dispute_id)) {
      case (?existingId) {
        return #err("Escrow already exists for this dispute");
      };
      case null {};
    };

    // Calculate platform fee
    let platform_fee = (total_amount * PLATFORM_FEE_PERCENTAGE) / 10000;
    let net_amount = total_amount - platform_fee;

    let escrow_id = nextEscrowId;
    nextEscrowId += 1;

    let escrow: Escrow = {
      id = escrow_id;
      disputeId = dispute_id;
      depositor = plaintiff;
      beneficiary = defendant;
      amount = total_amount;
      currency = switch (currency) {
        case (#ICP) { "ICP" };
        case (#ckBTC) { "ckBTC" };
      };
      status = #PENDING;
      createdAt = Time.now();
      updatedAt = Time.now();
      settledAt = null;
      refundedAt = null;
      transactionHash = null;
    };

    escrowAccounts.put(escrow_id, escrow);
    disputeToEscrowMap.put(dispute_id, escrow_id);

    // Record fee reservation
    let feeTx: FeeTransaction = {
      dispute_id = dispute_id;
      fee_type = "platform_fee_reserved";
      amount = platform_fee;
      transaction_hash = "fee_reserved_" # Nat.toText(escrow_id);
      timestamp = Time.now();
    };

    feeTransactions.put(feeTx.transaction_hash, feeTx);

    #ok(feeTx.transaction_hash)
  };

  // Health check
  public query func health(): async Text {
    "Bitcoin Escrow is operational";
  };
}
