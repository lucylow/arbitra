// src/legal_compliance/main.mo
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";

actor LegalCompliance {
  
  public type Jurisdiction = {
    code: Text; // ISO country code + region
    name: Text;
    governing_laws: [Text];
    arbitration_act: Text;
    enforcement_treaty: Bool; // New York Convention signatory
    data_protection_law: Text;
    digital_signature_law: Text;
    restrictions: [LegalRestriction];
  };

  public type LegalRestriction = {
    category: RestrictionCategory;
    description: Text;
    severity: { #Warning; #Prohibited; #Conditional };
    conditions: ?Text;
  };

  public type RestrictionCategory = {
    #Industry; // Gambling, cannabis, etc.
    #DataPrivacy; // GDPR, CCPA, etc.
    #Financial; // Securities, banking regulations
    #ConsumerProtection;
    #InternationalSanctions;
  };

  public type ComplianceCheck = {
    jurisdiction: Text;
    check_type: ComplianceType;
    timestamp: Int;
    result: { #Compliant; #NonCompliant; #Conditional };
    details: Text;
    required_actions: [Text];
  };

  public type ComplianceType = {
    #DataProtection;
    #ConsumerRights;
    #FinancialRegulations;
    #ArbitrationEnforceability;
    #DigitalSignatures;
  };

  public type UserConsent = {
    id: Text;
    type: ConsentType;
    jurisdiction: Text;
    granted_at: Int;
    revoked_at: ?Int;
    purpose: Text;
    data_categories: [Text];
  };

  public type ConsentType = {
    #DataProcessing;
    #ArbitrationAgreement;
    #CrossBorderTransfer;
    #Marketing;
  };

  public type DisputeCharacteristics = {
    amount: Nat;
    category: Text;
    parties_type: { #B2B; #B2C; #C2C };
    cross_border: Bool;
    industry: Text;
  };

  // State
  private stable var jurisdictionArray: [(Text, Jurisdiction)] = [];
  private stable var complianceCheckArray: [(Text, [ComplianceCheck])] = [];
  private stable var userConsentArray: [(Principal, [UserConsent])] = [];
  
  private let jurisdictions = HashMap.HashMap<Text, Jurisdiction>(0, Text.equal, Text.hash);
  private let complianceChecks = HashMap.HashMap<Text, [ComplianceCheck]>(0, Text.equal, Text.hash);
  private let userConsents = HashMap.HashMap<Principal, [UserConsent]>(0, Principal.equal, Principal.hash);

  // Pre-upgrade
  system func preupgrade() {
    let jurisdictionBuffer = Buffer.Buffer<(Text, Jurisdiction)>(jurisdictions.size());
    for ((code, jurisdiction) in jurisdictions.entries()) {
      jurisdictionBuffer.add((code, jurisdiction));
    };
    jurisdictionArray := Buffer.toArray(jurisdictionBuffer);
    
    let complianceBuffer = Buffer.Buffer<(Text, [ComplianceCheck])>(complianceChecks.size());
    for ((id, checks) in complianceChecks.entries()) {
      complianceBuffer.add((id, checks));
    };
    complianceCheckArray := Buffer.toArray(complianceBuffer);
    
    let consentBuffer = Buffer.Buffer<(Principal, [UserConsent])>(userConsents.size());
    for ((principal, consents) in userConsents.entries()) {
      consentBuffer.add((principal, consents));
    };
    userConsentArray := Buffer.toArray(consentBuffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for ((code, jurisdiction) in jurisdictionArray.vals()) {
      jurisdictions.put(code, jurisdiction);
    };
    for ((id, checks) in complianceCheckArray.vals()) {
      complianceChecks.put(id, checks);
    };
    for ((principal, consents) in userConsentArray.vals()) {
      userConsents.put(principal, consents);
    };
  };

  // Initialize with standard jurisdictions
  public func initializeJurisdictions() : async () {
    let euJurisdiction: Jurisdiction = {
      code = "EU";
      name = "European Union";
      governing_laws = ["Rome I Regulation", "Brussels I Regulation"];
      arbitration_act = "European Convention on International Commercial Arbitration";
      enforcement_treaty = true;
      data_protection_law = "GDPR";
      digital_signature_law = "eIDAS Regulation";
      restrictions = [
        {
          category = #DataPrivacy;
          description = "GDPR compliance required for personal data processing";
          severity = #Prohibited;
          conditions = ?"Must have lawful basis for processing and implement data protection measures";
        }
      ];
    };

    let usJurisdiction: Jurisdiction = {
      code = "US";
      name = "United States";
      governing_laws = ["Federal Arbitration Act", "Uniform Commercial Code"];
      arbitration_act = "Federal Arbitration Act";
      enforcement_treaty = true;
      data_protection_law = "CCPA/State Laws";
      digital_signature_law = "ESIGN Act";
      restrictions = [
        {
          category = #ConsumerProtection;
          description = "Consumer arbitration agreements must be conspicuous and fair";
          severity = #Conditional;
          conditions = ?"Must comply with state-specific consumer protection laws";
        }
      ];
    };

    jurisdictions.put(euJurisdiction.code, euJurisdiction);
    jurisdictions.put(usJurisdiction.code, usJurisdiction);
  };

  // Comprehensive compliance check for dispute
  public shared(msg) func checkDisputeCompliance(
    dispute_id: Text,
    parties: [Principal],
    jurisdictions_involved: [Text],
    dispute_amount: Nat,
    dispute_category: Text
  ) : async [ComplianceCheck] {
    
    var allChecks: [ComplianceCheck] = [];

    for (jurisdiction_code in jurisdictions_involved.vals()) {
      switch (jurisdictions.get(jurisdiction_code)) {
        case null { /* Skip unknown jurisdiction */ };
        case (?jurisdiction) {
          
          // Data protection compliance
          let dataProtectionCheck = await checkDataProtectionCompliance(jurisdiction, parties);
          allChecks := Array.append(allChecks, [dataProtectionCheck]);

          // Arbitration enforceability
          let arbitrationCheck = await checkArbitrationEnforceability(jurisdiction, dispute_amount, dispute_category);
          allChecks := Array.append(allChecks, [arbitrationCheck]);

          // Consumer protection (if applicable)
          let consumerCheck = await checkConsumerProtection(jurisdiction, parties, dispute_category);
          allChecks := Array.append(allChecks, [consumerCheck]);
        };
      };
    };

    // Store compliance checks
    complianceChecks.put(dispute_id, allChecks);

    return allChecks;
  };

  // Record user consent for legal compliance
  public shared(msg) func recordConsent(
    consent_type: ConsentType,
    jurisdiction: Text,
    purpose: Text,
    data_categories: [Text]
  ) : async Text {
    
    let consentId = generateConsentId();
    let now = Time.now();

    let consent: UserConsent = {
      id = consentId;
      type = consent_type;
      jurisdiction = jurisdiction;
      granted_at = now;
      revoked_at = null;
      purpose = purpose;
      data_categories = data_categories;
    };

    let userConsentsList = switch (userConsents.get(msg.caller)) {
      case null { [consent] };
      case (?consents) { Array.append(consents, [consent]) };
    };

    userConsents.put(msg.caller, userConsentsList);

    return consentId;
  };

  // Revoke consent
  public shared(msg) func revokeConsent(consent_id: Text) : async Bool {
    
    switch (userConsents.get(msg.caller)) {
      case null { return false };
      case (?consents) {
        
        let updatedConsents = Array.map<UserConsent, UserConsent>(consents, func(consent) {
          if (consent.id == consent_id) {
            { consent with revoked_at = ?Time.now() }
          } else {
            consent
          }
        });

        userConsents.put(msg.caller, updatedConsents);
        return true;
      };
    };
  };

  // Verify if dispute is legally enforceable in target jurisdiction
  public query func verifyEnforceability(
    jurisdiction_code: Text,
    dispute_characteristics: DisputeCharacteristics
  ) : async {
    enforceable: Bool;
    requirements: [Text];
    risks: [Text];
    recommended_clauses: [Text];
  } {
    
    switch (jurisdictions.get(jurisdiction_code)) {
      case null { 
        return {
          enforceable = false;
          requirements = ["Jurisdiction not supported"];
          risks = ["Unknown legal framework"];
          recommended_clauses = [];
        };
      };
      case (?jurisdiction) {
        
        let (enforceable, requirements, risks) = analyzeEnforceability(jurisdiction, dispute_characteristics);
        let recommendedClauses = generateRecommendedClauses(jurisdiction, dispute_characteristics);

        return {
          enforceable = enforceable;
          requirements = requirements;
          risks = risks;
          recommended_clauses = recommendedClauses;
        };
      };
    };
  };

  // Helper functions
  private func generateConsentId() : Text {
    "CONS-" # Int.toText(Time.now()) # "-" # (debug_show(Principal.toText(Principal.fromActor(this))));
  };

  private func checkDataProtectionCompliance(
    jurisdiction: Jurisdiction,
    parties: [Principal]
  ) : async ComplianceCheck {
    
    let now = Time.now();
    
    // Check GDPR compliance for EU
    if (jurisdiction.code == "EU") {
      // Verify all parties have given necessary consents
      let allConsented = await verifyAllPartiesConsented(parties, #DataProcessing, jurisdiction.code);
      
      return {
        jurisdiction = jurisdiction.code;
        check_type = #DataProtection;
        timestamp = now;
        result = if (allConsented) { #Compliant } else { #NonCompliant };
        details = "GDPR data processing compliance check";
        required_actions = if (allConsented) { [] } else { ["Obtain data processing consent from all parties"] };
      };
    };

    // Default compliant for other jurisdictions
    return {
      jurisdiction = jurisdiction.code;
      check_type = #DataProtection;
      timestamp = now;
      result = #Compliant;
      details = "Data protection compliance check passed";
      required_actions = [];
    };
  };

  private func checkArbitrationEnforceability(
    jurisdiction: Jurisdiction,
    dispute_amount: Nat,
    dispute_category: Text
  ) : async ComplianceCheck {
    
    let now = Time.now();
    var enforceable = true;
    var requirements: [Text] = [];
    var risks: [Text] = [];

    // Check jurisdiction-specific arbitration rules
    switch (jurisdiction.code) {
      case "EU" {
        // EU-specific arbitration checks
        if (dispute_category == "Consumer" and dispute_amount < 5000) {
          enforceable := false;
          risks := Array.append(risks, ["Low-value consumer disputes may not be arbitrable in some EU jurisdictions"]);
        };
      };
      case "US" {
        // US-specific checks
        if (dispute_category == "Employment") {
          requirements := Array.append(requirements, ["Must comply with state-specific employment arbitration laws"]);
        };
      };
      case _ { /* Other jurisdictions */ };
    };

    return {
      jurisdiction = jurisdiction.code;
      check_type = #ArbitrationEnforceability;
      timestamp = now;
      result = if (enforceable) { #Compliant } else { #NonCompliant };
      details = "Arbitration agreement enforceability check";
      required_actions = requirements;
    };
  };

  private func checkConsumerProtection(
    jurisdiction: Jurisdiction,
    parties: [Principal],
    dispute_category: Text
  ) : async ComplianceCheck {
    
    let now = Time.now();
    
    if (dispute_category == "Consumer") {
      return {
        jurisdiction = jurisdiction.code;
        check_type = #ConsumerRights;
        timestamp = now;
        result = #Conditional;
        details = "Consumer protection compliance check";
        required_actions = [
          "Ensure arbitration clause is conspicuous",
          "Provide clear opt-out procedure",
          "Maintain fair fee structure"
        ];
      };
    };

    return {
      jurisdiction = jurisdiction.code;
      check_type = #ConsumerRights;
      timestamp = now;
      result = #Compliant;
      details = "Not a consumer dispute - consumer protection rules not applicable";
      required_actions = [];
    };
  };

  private func verifyAllPartiesConsented(
    parties: [Principal],
    consent_type: ConsentType,
    jurisdiction: Text
  ) : async Bool {
    
    for (party in parties.vals()) {
      switch (userConsents.get(party)) {
        case null { return false };
        case (?consents) {
          let validConsent = Array.find<UserConsent>(consents, func(c) {
            c.type == consent_type and 
            c.jurisdiction == jurisdiction and 
            c.revoked_at == null
          });
          if (validConsent == null) return false;
        };
      };
    };
    
    return true;
  };

  private func analyzeEnforceability(
    jurisdiction: Jurisdiction,
    characteristics: DisputeCharacteristics
  ) : (Bool, [Text], [Text]) {
    
    var enforceable = true;
    var requirements: [Text] = [];
    var risks: [Text] = [];

    // Implementation would contain detailed legal analysis
    // based on jurisdiction-specific laws and dispute characteristics
    
    return (enforceable, requirements, risks);
  };

  private func generateRecommendedClauses(
    jurisdiction: Jurisdiction,
    characteristics: DisputeCharacteristics
  ) : [Text] {
    
    var clauses: [Text] = [];

    // Jurisdiction-specific recommended clauses
    switch (jurisdiction.code) {
      case "EU" {
        clauses := Array.append(clauses, ["GDPR data processing clause", "Brussels I jurisdiction clause"]);
      };
      case "US" {
        clauses := Array.append(clauses, ["Class action waiver", "Jury trial waiver"]);
      };
      case _ {};
    };

    return clauses;
  };

  // Query methods
  public query func getJurisdiction(code: Text) : async ?Jurisdiction {
    jurisdictions.get(code);
  };

  public query func getSupportedJurisdictions() : async [Jurisdiction] {
    Iter.toArray(jurisdictions.vals());
  };

  public query func getUserConsents(user: Principal) : async [UserConsent] {
    switch (userConsents.get(user)) {
      case null { [] };
      case (?consents) { consents };
    };
  };

  public query func getComplianceChecks(dispute_id: Text) : async [ComplianceCheck] {
    switch (complianceChecks.get(dispute_id)) {
      case null { [] };
      case (?checks) { checks };
    };
  };

  // Health check
  public query func health() : async Text {
    "Legal Compliance canister is operational"
  };
}

