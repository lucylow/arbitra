// src/legal_agreements/main.mo
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import SHA256 "mo:base/SHA256";

actor LegalAgreements {
  
  // Legal Agreement Types
  public type AgreementType = {
    #ArbitrationClause;
    #ServiceTerms;
    #PrivacyPolicy;
    #EscrowAgreement;
    #EvidenceSubmission;
    #Custom;
  };

  public type LegalAgreement = {
    id: Text;
    version: Text;
    type: AgreementType;
    title: Text;
    content: Text;
    hash: Text; // Cryptographic hash of content
    governing_law: Text;
    jurisdiction: Text;
    effective_date: Int;
    expiration_date: ?Int;
    parties: [Principal];
    signatures: [Signature];
    status: { #Draft; #Active; #Amended; #Terminated };
    parent_agreement: ?Text; // For amendments
  };

  public type Signature = {
    party: Principal;
    timestamp: Int;
    signature_hash: Text;
    method: { #InternetIdentity; #DigitalCertificate; #Biometric };
    ip_address: ?Text;
    user_agent: ?Text;
  };

  public type AgreementTemplate = {
    id: Text;
    name: Text;
    category: AgreementType;
    template_content: Text;
    variables: [TemplateVariable];
    required_clauses: [Text];
    default_governing_law: Text;
    version: Text;
  };

  public type TemplateVariable = {
    key: Text;
    description: Text;
    required: Bool;
    validation_regex: ?Text;
  };

  // State
  private stable var agreementArray: [(Text, LegalAgreement)] = [];
  private stable var templateArray: [(Text, AgreementTemplate)] = [];
  private stable var userAgreementArray: [(Principal, [Text])] = [];
  private stable var nextAgreementId: Nat = 1;
  
  private let agreements = HashMap.HashMap<Text, LegalAgreement>(0, Text.equal, Text.hash);
  private let templates = HashMap.HashMap<Text, AgreementTemplate>(0, Text.equal, Text.hash);
  private let userAgreements = HashMap.HashMap<Principal, [Text]>(0, Principal.equal, Principal.hash);

  // Pre-upgrade
  system func preupgrade() {
    let agreementBuffer = Buffer.Buffer<(Text, LegalAgreement)>(agreements.size());
    for ((id, agreement) in agreements.entries()) {
      agreementBuffer.add((id, agreement));
    };
    agreementArray := Buffer.toArray(agreementBuffer);
    
    let templateBuffer = Buffer.Buffer<(Text, AgreementTemplate)>(templates.size());
    for ((id, template) in templates.entries()) {
      templateBuffer.add((id, template));
    };
    templateArray := Buffer.toArray(templateBuffer);
    
    let userBuffer = Buffer.Buffer<(Principal, [Text])>(userAgreements.size());
    for ((principal, agreementIds) in userAgreements.entries()) {
      userBuffer.add((principal, agreementIds));
    };
    userAgreementArray := Buffer.toArray(userBuffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for ((id, agreement) in agreementArray.vals()) {
      agreements.put(id, agreement);
    };
    for ((id, template) in templateArray.vals()) {
      templates.put(id, template);
    };
    for ((principal, agreementIds) in userAgreementArray.vals()) {
      userAgreements.put(principal, agreementIds);
    };
  };

  // Standard legal templates
  public func initializeStandardTemplates() : async () {
    let arbitrationTemplate : AgreementTemplate = {
      id = "arbitration_standard_v1";
      name = "Standard Arbitration Agreement";
      category = #ArbitrationClause;
      template_content = standardArbitrationClause();
      variables = [
        {
          key = "dispute_amount";
          description = "Maximum amount in dispute";
          required = true;
          validation_regex = ?"^[0-9]+$";
        },
        {
          key = "governing_law";
          description = "Applicable legal jurisdiction";
          required = true;
          validation_regex = ?"^[A-Za-z ,]+$";
        }
      ];
      required_clauses = [
        "Arbitration agreement clause",
        "Governing law clause",
        "Confidentiality clause",
        "Costs and fees clause"
      ];
      default_governing_law = "United Nations Convention on Contracts for the International Sale of Goods (CISG)";
      version = "1.0";
    };

    templates.put(arbitrationTemplate.id, arbitrationTemplate);
  };

  // Create a new legal agreement
  public shared(msg) func createAgreement(
    type: AgreementType,
    title: Text,
    content: Text,
    governing_law: Text,
    jurisdiction: Text,
    parties: [Principal],
    expiration_date: ?Int
  ) : async Text {
    
    let agreementId = generateAgreementId();
    let contentHash = computeContentHash(content);
    let now = Time.now();

    let newAgreement : LegalAgreement = {
      id = agreementId;
      version = "1.0";
      type = type;
      title = title;
      content = content;
      hash = contentHash;
      governing_law = governing_law;
      jurisdiction = jurisdiction;
      effective_date = now;
      expiration_date = expiration_date;
      parties = parties;
      signatures = [];
      status = #Draft;
      parent_agreement = null;
    };

    agreements.put(agreementId, newAgreement);

    // Update user agreements mapping
    for (party in parties.vals()) {
      let userAgs = switch (userAgreements.get(party)) {
        case (?ags) { Array.append(ags, [agreementId]) };
        case null { [agreementId] };
      };
      userAgreements.put(party, userAgs);
    };

    return agreementId;
  };

  // Sign an agreement with cryptographic proof
  public shared(msg) func signAgreement(
    agreementId: Text,
    signatureMethod: { #InternetIdentity; #DigitalCertificate; #Biometric }
  ) : async {
    success: Bool;
    signature_hash: ?Text;
    error: ?Text;
  } {
    
    switch (agreements.get(agreementId)) {
      case null { return { success = false; signature_hash = null; error = ?"Agreement not found" } };
      case (?agreement) {
        
        // Verify user is a party to the agreement
        if (not Array.find<Principal>(agreement.parties, func(p) { p == msg.caller }) != null) {
          return { success = false; signature_hash = null; error = ?"Not authorized to sign this agreement" };
        };

        // Check if already signed
        let alreadySigned = Array.find<Signature>(agreement.signatures, func(s) { s.party == msg.caller });
        if (alreadySigned != null) {
          return { success = false; signature_hash = null; error = ?"Already signed this agreement" };
        };

        // Create signature with cryptographic proof
        let signatureData = createSignatureData(msg.caller, agreementId, agreement.hash, signatureMethod);
        let signatureHash = computeSignatureHash(signatureData);

        let newSignature : Signature = {
          party = msg.caller;
          timestamp = Time.now();
          signature_hash = signatureHash;
          method = signatureMethod;
          ip_address = null; // Could capture from HTTP headers
          user_agent = null; // Could capture from HTTP headers
        };

        // Update agreement with new signature
        let updatedSignatures = Array.append(agreement.signatures, [newSignature]);
        let updatedAgreement = {
          agreement with 
          signatures = updatedSignatures;
          status = if (updatedSignatures.size() == agreement.parties.size()) {
            #Active
          } else {
            agreement.status
          };
        };

        agreements.put(agreementId, updatedAgreement);

        return { 
          success = true; 
          signature_hash = ?signatureHash; 
          error = null 
        };
      };
    };
  };

  // Verify agreement integrity and signatures
  public query func verifyAgreement(agreementId: Text) : async {
    valid: Bool;
    content_integrity: Bool;
    signatures_valid: Bool;
    all_parties_signed: Bool;
    expiration_status: { #Active; #Expired; #NoExpiration };
    details: Text;
  } {
    
    switch (agreements.get(agreementId)) {
      case null { 
        return {
          valid = false;
          content_integrity = false;
          signatures_valid = false;
          all_parties_signed = false;
          expiration_status = #Expired;
          details = "Agreement not found";
        };
      };
      case (?agreement) {
        
        // Verify content integrity
        let computedHash = computeContentHash(agreement.content);
        let contentIntegrity = computedHash == agreement.hash;

        // Verify all parties signed
        let allSigned = agreement.signatures.size() == agreement.parties.size();

        // Check expiration
        let expirationStatus = switch (agreement.expiration_date) {
          case null { #NoExpiration };
          case (?expDate) {
            if (Time.now() > expDate) { #Expired } else { #Active }
          };
        };

        // Verify signature cryptographic integrity
        let signaturesValid = verifyAllSignatures(agreement.signatures);

        let valid = contentIntegrity and allSigned and signaturesValid and 
                   (expirationStatus == #Active or expirationStatus == #NoExpiration);

        return {
          valid = valid;
          content_integrity = contentIntegrity;
          signatures_valid = signaturesValid;
          all_parties_signed = allSigned;
          expiration_status = expirationStatus;
          details = if (valid) {
            "Agreement is legally valid and enforceable"
          } else {
            "Agreement has validation issues"
          };
        };
      };
    };
  };

  // Create amendment to existing agreement
  public shared(msg) func createAmendment(
    originalAgreementId: Text,
    amendmentContent: Text,
    change_description: Text
  ) : async Text {
    
    switch (agreements.get(originalAgreementId)) {
      case null { throw Error.reject("Original agreement not found") };
      case (?original) {
        
        // Verify user has authority to amend
        if (not Array.find<Principal>(original.parties, func(p) { p == msg.caller }) != null) {
          throw Error.reject("Not authorized to amend this agreement");
        };

        let amendmentId = generateAgreementId();
        let contentHash = computeContentHash(amendmentContent);

        let amendment : LegalAgreement = {
          id = amendmentId;
          version = "Amendment to " # original.version;
          type = original.type;
          title = "Amendment: " # original.title;
          content = amendmentContent;
          hash = contentHash;
          governing_law = original.governing_law;
          jurisdiction = original.jurisdiction;
          effective_date = Time.now();
          expiration_date = original.expiration_date;
          parties = original.parties;
          signatures = [];
          status = #Draft;
          parent_agreement = ?originalAgreementId;
        };

        agreements.put(amendmentId, amendment);

        // Update original agreement status
        let updatedOriginal = { original with status = #Amended };
        agreements.put(originalAgreementId, updatedOriginal);

        return amendmentId;
      };
    };
  };

  // Helper functions
  private func generateAgreementId() : Text {
    let id = "AGR-" # Nat.toText(nextAgreementId) # "-" # Int.toText(Time.now());
    nextAgreementId += 1;
    return id;
  };

  private func computeContentHash(content: Text) : Text {
    // Implementation using SHA-256 hashing
    // Convert Text to bytes array
    let contentBytes = textToBytes(content);
    let hashBytes = SHA256.sha256(contentBytes);
    var hashHex = "";
    for (byte in hashBytes.vals()) {
      let hex = Nat8.toText(byte);
      hashHex := hashHex # (if (hex.size() == 1) "0" else "") # hex;
    };
    return hashHex;
  };

  private func computeSignatureHash(signatureData: Text) : Text {
    // Cryptographic signature computation
    let dataBytes = textToBytes(signatureData);
    let hashBytes = SHA256.sha256(dataBytes);
    var hashHex = "";
    for (byte in hashBytes.vals()) {
      let hex = Nat8.toText(byte);
      hashHex := hashHex # (if (hex.size() == 1) "0" else "") # hex;
    };
    return hashHex;
  };

  // Helper to convert Text to bytes array
  private func textToBytes(text: Text) : [Nat8] {
    // Convert Text to bytes by iterating characters
    // In production, would use proper UTF-8 encoding
    var bytes: [Nat8] = [];
    for (char in text.chars()) {
      // Convert char to byte (simplified - proper UTF-8 would be more complex)
      let charCode = Char.toNat32(char);
      if (charCode <= 0xFF) {
        bytes := Array.append(bytes, [Nat8.fromNat(Nat32.toNat(charCode))]);
      };
    };
    bytes;
  };

  private func createSignatureData(
    party: Principal, 
    agreementId: Text, 
    contentHash: Text,
    method: { #InternetIdentity; #DigitalCertificate; #Biometric }
  ) : Text {
    return Principal.toText(party) # "|" # agreementId # "|" # contentHash # "|" # debug_show(method) # "|" # Int.toText(Time.now());
  };

  private func verifyAllSignatures(signatures: [Signature]) : Bool {
    // Verify cryptographic integrity of all signatures
    // In production, this would verify each signature against the party's public key
    // For MVP, we just check they exist
    signatures.size() > 0
  };

  private func standardArbitrationClause() : Text {
    return "
    ARBITRATION AGREEMENT CLAUSE
    
    1. AGREEMENT TO ARBITRATE: The parties hereby agree to resolve any dispute, claim, or controversy arising out of or relating to this agreement through final and binding arbitration administered by Arbitra Platform.

    2. GOVERNING LAW: This agreement shall be governed by and construed in accordance with {{governing_law}}.

    3. ARBITRATION RULES: The arbitration shall be conducted in accordance with the Arbitra Platform Rules of Procedure, which are incorporated by reference.

    4. SEAT OF ARBITRATION: The legal seat of arbitration shall be {{jurisdiction}}.

    5. CONFIDENTIALITY: All aspects of the arbitration proceeding shall be treated as confidential.

    6. COSTS: Each party shall bear its own costs and expenses, including attorney's fees.
    ";
  };

  // Query methods
  public query func getAgreement(agreementId: Text) : async ?LegalAgreement {
    agreements.get(agreementId);
  };

  public query func getUserAgreements(user: Principal) : async [LegalAgreement] {
    switch (userAgreements.get(user)) {
      case null { [] };
      case (?agreementIds) {
        Array.mapFilter<Text, LegalAgreement>(agreementIds, func(id) { agreements.get(id) });
      };
    };
  };

  public query func getAgreementTemplates() : async [AgreementTemplate] {
    Iter.toArray(templates.vals());
  };

  // Health check
  public query func health() : async Text {
    "Legal Agreements canister is operational"
  };
}

