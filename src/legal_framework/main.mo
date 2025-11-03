import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Hash "mo:base/Hash";

actor CommonLawFramework {
  
  // ========== LEGAL DOCTRINES & PRECEDENTS ==========
  
  public type LegalDoctrine = {
    id: Text;
    name: Text;
    description: Text;
    jurisdiction: Text;
    citation: Text;
    principles: [Text];
    weight: Float; // 0.0 to 1.0
  };

  public type CasePrecedent = {
    id: Text;
    caseName: Text;
    citation: Text;
    jurisdiction: Text;
    year: Nat;
    facts: Text;
    holding: Text;
    reasoning: Text;
    relevanceScore: Float;
    appliedPrinciples: [Text];
  };

  public type ContractAnalysis = {
    contractId: Text;
    isValid: Bool;
    formationDefects: [Text];
    enforceabilityIssues: [Text];
    riskAreas: [RiskAssessment];
    recommendedClauses: [Text];
    complianceScore: Float;
  };

  public type RiskAssessment = {
    area: Text;
    severity: Text; // LOW, MEDIUM, HIGH, CRITICAL
    description: Text;
    mitigation: Text;
  };

  public type LegalReasoning = {
    applicableDoctrines: [LegalDoctrine];
    relevantPrecedents: [CasePrecedent];
    legalConclusions: [Text];
    confidenceScore: Float;
    reasoningChain: [Text];
  };

  // ========== STORAGE ==========
  private let contractDoctrines = HashMap.HashMap<Text, LegalDoctrine>(0, Text.equal, Text.hash);
  private let precedents = HashMap.HashMap<Text, CasePrecedent>(0, Text.equal, Text.hash);
  private stable var initialized = false;

  // ========== INITIALIZATION ==========
  
  public func initCommonLawFramework() : async () {
    if (initialized) { return };
    
    // Initialize fundamental contract law doctrines
    let doctrines: [LegalDoctrine] = [
      {
        id = "DOCTRINE_OFFER_ACCEPTANCE";
        name = "Offer and Acceptance";
        description = "Formation of contract requires valid offer and acceptance";
        jurisdiction = "Common Law";
        citation = "Restatement (Second) of Contracts § 24";
        principles = ["Meeting of the minds", "Objective theory of contracts", "Mirror image rule"];
        weight = 0.95;
      },
      {
        id = "DOCTRINE_CONSIDERATION";
        name = "Consideration";
        description = "Contract must be supported by valuable consideration";
        jurisdiction = "Common Law";
        citation = "Restatement (Second) of Contracts § 71";
        principles = ["Bargained-for exchange", "Legal value", "Adequacy not required"];
        weight = 0.90;
      },
      {
        id = "DOCTRINE_BREACH";
        name = "Material Breach";
        description = "Substantial failure to perform contractual obligations";
        jurisdiction = "Common Law";
        citation = "Restatement (Second) of Contracts § 241";
        principles = ["Substantial performance", "Anticipatory repudiation", "Cure of breach"];
        weight = 0.85;
      },
      {
        id = "DOCTRINE_DAMAGES";
        name = "Contract Damages";
        description = "Remedies available for breach of contract";
        jurisdiction = "Common Law";
        citation = "Hadley v. Baxendale (1854)";
        principles = ["Expectation damages", "Reliance damages", "Consequential damages", "Mitigation"];
        weight = 0.88;
      }
    ];

    for (doctrine in doctrines.vals()) {
      contractDoctrines.put(doctrine.id, doctrine);
    };

    // Initialize landmark precedents
    let landmarkCases: [CasePrecedent] = [
      {
        id = "PRECEDENT_HADLEY_BAXENDALE";
        caseName = "Hadley v. Baxendale";
        citation = "9 Exch. 341 (1854)";
        jurisdiction = "England and Wales";
        year = 1854;
        facts = "Mill shaft breakdown delayed due to carrier's failure to deliver in timely manner";
        holding = "Damages limited to those reasonably foreseeable at contract formation";
        reasoning = "Parties should only be liable for losses that were contemplated when contract made";
        relevanceScore = 0.92;
        appliedPrinciples = ["Foreseeability", "Consequential damages", "Remoteness of damage"];
      },
      {
        id = "PRECEDENT_CARLILL_CARBOLIC";
        caseName = "Carlill v. Carbolic Smoke Ball Co";
        citation = "[1893] 1 QB 256";
        jurisdiction = "England and Wales";
        year = 1893;
        facts = "Company advertised reward for anyone using product who still contracted influenza";
        holding = "Unilateral offer can be accepted by performance without notification";
        reasoning = "Advertisement constituted offer to whole world, accepted by performance";
        relevanceScore = 0.88;
        appliedPrinciples = ["Unilateral contracts", "Offer by advertisement", "Acceptance by performance"];
      }
    ];

    for (precedent in landmarkCases.vals()) {
      precedents.put(precedent.id, precedent);
    };

    initialized := true;
  };

  // ========== CONTRACT ANALYSIS ENGINE ==========
  
  public func analyzeContract(
    contractText: Text,
    jurisdiction: Text,
    contractType: Text
  ) : async ContractAnalysis {
    
    if (not initialized) {
      await initCommonLawFramework();
    };
    
    let formationDefects = Buffer.Buffer<Text>(0);
    let enforceabilityIssues = Buffer.Buffer<Text>(0);
    let riskAreas = Buffer.Buffer<RiskAssessment>(0);
    let recommendedClauses = Buffer.Buffer<Text>(0);

    // Analyze offer and acceptance
    if (not _containsOfferAndAcceptance(contractText)) {
      formationDefects.add("Missing clear offer and acceptance language");
    };

    // Analyze consideration
    if (not _containsConsideration(contractText)) {
      formationDefects.add("Consideration not clearly specified");
    };

    // Analyze definiteness
    if (not _isSufficientlyDefinite(contractText)) {
      formationDefects.add("Contract terms lack sufficient definiteness");
    };

    // Risk assessment
    if (not _containsLimitationOfLiability(contractText)) {
      riskAreas.add({
        area = "Liability Exposure";
        severity = "HIGH";
        description = "No limitation of liability clause";
        mitigation = "Add reasonable limitation of liability provision";
      });
    };

    if (not _containsDisputeResolution(contractText)) {
      riskAreas.add({
        area = "Dispute Resolution";
        severity = "MEDIUM";
        description = "No dispute resolution mechanism specified";
        mitigation = "Add arbitration or mediation clause";
      });
      recommendedClauses.add("Arbitration clause with Arbitra platform");
    };

    if (not _containsGoverningLaw(contractText)) {
      riskAreas.add({
        area = "Jurisdictional Risk";
        severity = "HIGH";
        description = "No governing law specified";
        mitigation = "Specify governing law and jurisdiction";
      });
    };

    let complianceScore = _calculateComplianceScore(formationDefects, riskAreas);

    return {
      contractId = "CONTRACT_" # Int.toText(Time.now());
      isValid = formationDefects.size() == 0;
      formationDefects = formationDefects.toArray();
      enforceabilityIssues = enforceabilityIssues.toArray();
      riskAreas = riskAreas.toArray();
      recommendedClauses = recommendedClauses.toArray();
      complianceScore = complianceScore;
    };
  };

  // ========== LEGAL REASONING ENGINE ==========
  
  public func generateLegalReasoning(
    facts: Text,
    issues: [Text],
    jurisdiction: Text
  ) : async LegalReasoning {
    
    if (not initialized) {
      await initCommonLawFramework();
    };
    
    let applicableDoctrines = Buffer.Buffer<LegalDoctrine>(0);
    let relevantPrecedents = Buffer.Buffer<CasePrecedent>(0);
    let legalConclusions = Buffer.Buffer<Text>(0);
    let reasoningChain = Buffer.Buffer<Text>(0);

    // Pattern matching for legal issues
    for (issue in issues.vals()) {
      switch (issue) {
        case ("BREACH_OF_CONTRACT") {
          switch (contractDoctrines.get("DOCTRINE_BREACH")) {
            case (?doctrine) {
              applicableDoctrines.add(doctrine);
              reasoningChain.add("Applied doctrine: " # doctrine.name);
              legalConclusions.add("Must establish: (1) Existence of contract, (2) Breach, (3) Damages");
            };
            case (null) {};
          };
        };
        case ("DAMAGES_CALCULATION") {
          switch (contractDoctrines.get("DOCTRINE_DAMAGES")) {
            case (?doctrine) {
              applicableDoctrines.add(doctrine);
              reasoningChain.add("Applied doctrine: " # doctrine.name);
              legalConclusions.add("Damages calculation follows Hadley v. Baxendale foreseeability principle");
            };
            case (null) {};
          };
        };
        case (_) {};
      };
    };

    // Find relevant precedents based on facts
    for (precedent in precedents.vals()) {
      if (_isRelevantPrecedent(precedent, facts)) {
        relevantPrecedents.add(precedent);
      };
    };

    let confidenceScore = _calculateLegalConfidence(applicableDoctrines, relevantPrecedents);

    return {
      applicableDoctrines = applicableDoctrines.toArray();
      relevantPrecedents = relevantPrecedents.toArray();
      legalConclusions = legalConclusions.toArray();
      confidenceScore = confidenceScore;
      reasoningChain = reasoningChain.toArray();
    };
  };

  // ========== PRIVATE HELPER FUNCTIONS ==========
  
  private func _containsOfferAndAcceptance(contractText: Text) : Bool {
    Text.contains(contractText, #text "offer") and 
    Text.contains(contractText, #text "accept") and
    (Text.contains(contractText, #text "agree") or Text.contains(contractText, #text "agreement"))
  };

  private func _containsConsideration(contractText: Text) : Bool {
    Text.contains(contractText, #text "consideration") or
    Text.contains(contractText, #text "payment") or
    Text.contains(contractText, #text "fee") or
    Text.contains(contractText, #text "compensation")
  };

  private func _isSufficientlyDefinite(contractText: Text) : Bool {
    let requiredTerms = ["parties", "subject matter", "price", "terms"];
    var score: Float = 0.0;
    
    for (term in requiredTerms.vals()) {
      if (Text.contains(contractText, #text term)) {
        score += 0.25;
      };
    };
    
    score >= 0.75;
  };

  private func _containsLimitationOfLiability(contractText: Text) : Bool {
    Text.contains(contractText, #text "limitation of liability") or
    Text.contains(contractText, #text "liability cap") or
    Text.contains(contractText, #text "maximum liability")
  };

  private func _containsDisputeResolution(contractText: Text) : Bool {
    Text.contains(contractText, #text "dispute resolution") or
    Text.contains(contractText, #text "arbitration") or
    Text.contains(contractText, #text "mediation")
  };

  private func _containsGoverningLaw(contractText: Text) : Bool {
    Text.contains(contractText, #text "governing law") or
    Text.contains(contractText, #text "jurisdiction") or
    Text.contains(contractText, #text "venue")
  };

  private func _calculateComplianceScore(
    defects: Buffer.Buffer<Text>,
    risks: Buffer.Buffer<RiskAssessment>
  ) : Float {
    let maxPoints: Float = 100.0;
    var points: Float = maxPoints;

    // Deduct for formation defects
    points -= Float.fromInt(defects.size()) * 10.0;

    // Deduct for risks based on severity
    for (risk in risks.vals()) {
      switch (risk.severity) {
        case ("CRITICAL") { points -= 20.0 };
        case ("HIGH") { points -= 15.0 };
        case ("MEDIUM") { points -= 10.0 };
        case ("LOW") { points -= 5.0 };
        case (_) { points -= 5.0 };
      };
    };

    Float.max(0.0, Float.min(100.0, points)) / maxPoints;
  };

  private func _isRelevantPrecedent(precedent: CasePrecedent, facts: Text) : Bool {
    var relevance: Float = 0.0;
    
    // Simple keyword matching - in production would use NLP
    let keywords = ["breach", "contract", "damages", "failure", "performance"];
    for (keyword in keywords.vals()) {
      if (Text.contains(facts, #text keyword) and Text.contains(precedent.facts, #text keyword)) {
        relevance += 0.2;
      };
    };
    
    relevance >= 0.6;
  };

  private func _calculateLegalConfidence(
    doctrines: Buffer.Buffer<LegalDoctrine>,
    precedents: Buffer.Buffer<CasePrecedent>
  ) : Float {
    var score: Float = 0.0;
    
    for (doctrine in doctrines.vals()) {
      score += doctrine.weight * 0.6; // Doctrines weight 60%
    };
    
    for (precedent in precedents.vals()) {
      score += precedent.relevanceScore * 0.4; // Precedents weight 40%
    };
    
    let maxScore = Float.fromInt(doctrines.size() + precedents.size());
    if (maxScore > 0.0) {
      score / maxScore
    } else {
      0.5
    };
  };

  // Health check
  public query func health(): async Text {
    "Common Law Framework is operational";
  };
}

