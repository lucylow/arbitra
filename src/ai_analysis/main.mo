import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

actor AIAnalysis {
  
  public type AnalysisRequest = {
    disputeId: Nat;
    evidenceIds: [Nat];
    disputeType: Text; // "CONTRACT", "PAYMENT", "SERVICE", "PROPERTY"
    governingLaw: Text;
  };

  public type AnalysisResult = {
    id: Nat;
    disputeId: Nat;
    decision: Text;
    plaintiffAward: Nat; // Percentage 0-100
    reasoning: Text;
    confidenceScore: Float;
    keyFactors: [Text];
    legalReferences: [Text];
    analysisMethod: Text;
    analyzedAt: Int;
  };

  // Legacy type for compatibility
  public type AnalysisResultLegacy = {
    id: Nat;
    disputeId: Nat;
    summary: Text;
    keyPoints: [Text];
    recommendation: Text;
    confidenceScore: Float;
    positiveFactors: [Text];
    negativeFactors: [Text];
    submittedAt: Int;
  };

  public type LegalPattern = {
    patternId: Text;
    keywords: [Text];
    decisionBias: Float; // -1.0 to 1.0
    weight: Float;
    legalBasis: Text;
  };

  // State
  private stable var analysisArray: [AnalysisResult] = [];
  private stable var nextAnalysisId: Nat = 1;
  private func natHash(n: Nat): Hash.Hash {
    Text.hash(Nat.toText(n));
  };
  private let analysisResults = HashMap.HashMap<Nat, AnalysisResult>(10, Nat.equal, natHash);
  private let disputeToAnalysisMap = HashMap.HashMap<Nat, Nat>(10, Nat.equal, natHash);
  private let legalPatterns = HashMap.HashMap<Text, LegalPattern>(10, Text.equal, Text.hash);

  // Pre-upgrade
  system func preupgrade() {
    let buffer = Buffer.Buffer<AnalysisResult>(analysisResults.size());
    for ((_, analysis) in analysisResults.entries()) {
      buffer.add(analysis);
    };
    analysisArray := Buffer.toArray(buffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for (analysis in analysisArray.vals()) {
      analysisResults.put(analysis.id, analysis);
      disputeToAnalysisMap.put(analysis.disputeId, analysis.id);
    };
    // Initialize patterns if not already initialized
    if (legalPatterns.size() == 0) {
      let _ = initPatterns();
    };
  };

  // Initialize with basic legal patterns
  public func initPatterns() : async () {
    let patterns: [LegalPattern] = [
      {
        patternId = "BREACH_OF_CONTRACT";
        keywords = ["breach", "violation", "failed to deliver", "did not perform"];
        decisionBias = 0.7;
        weight = 0.8;
        legalBasis = "Contract law - failure to perform contractual obligations";
      },
      {
        patternId = "TIMELY_PERFORMANCE";
        keywords = ["on time", "delivered", "completed", "performed"];
        decisionBias = -0.6;
        weight = 0.7;
        legalBasis = "Contract law - satisfactory performance of obligations";
      },
      {
        patternId = "PAYMENT_ISSUE";
        keywords = ["not paid", "unpaid", "overdue", "payment due"];
        decisionBias = 0.8;
        weight = 0.9;
        legalBasis = "Payment obligation not fulfilled";
      },
      {
        patternId = "QUALITY_ISSUE";
        keywords = ["poor quality", "defective", "not as described", "faulty"];
        decisionBias = 0.5;
        weight = 0.6;
        legalBasis = "Goods/Services not meeting agreed standards";
      }
    ];

    for (pattern in patterns.vals()) {
      legalPatterns.put(pattern.patternId, pattern);
    };
  };

  // Advanced analysis with legal framework
  public shared ({ caller }) func analyzeDispute(
    disputeId: Nat,
    evidenceIds: [Text]
  ) : async Result.Result<AnalysisResult, Text> {
    
    // Check if analysis already exists
    switch (disputeToAnalysisMap.get(disputeId)) {
      case (?existingId) {
        switch (analysisResults.get(existingId)) {
          case (?existing) { return #ok(existing) };
          case null {};
        };
      };
      case null {};
    };

    // For MVP, we'll use rule-based analysis
    // In production, this would fetch evidence content and perform NLP
    let mockEvidence = [
      "Contract required delivery by March 15",
      "Goods were delivered on March 20",
      "Plaintiff incurred losses due to delay",
      "Defendant claims force majeure due to weather"
    ];

    let analysis = await _performRuleBasedAnalysis(disputeId, mockEvidence);

    analysisResults.put(analysis.id, analysis);
    disputeToAnalysisMap.put(disputeId, analysis.id);
    #ok(analysis)
  };

  // Legacy analyzeDispute for compatibility
  public shared ({ caller }) func analyzeDispute(
    disputeId: Nat,
    claimantDescription: Text,
    respondentDescription: Text,
    amount: Nat
  ): async Result.Result<Nat, Text> {
    let evidenceIds: [Text] = [];
    let result = await analyzeDispute(disputeId, evidenceIds);
    
    switch (result) {
      case (#ok(analysis)) {
        #ok(analysis.id)
      };
      case (#err(msg)) {
        #err(msg)
      };
    };
  };

  public shared ({ caller }) func analyzeWithLegalFramework(
    disputeId: Nat,
    evidenceIds: [Text],
    legalFramework: Text // "UCC", "COMMON_LAW", "CIVIL_LAW"
  ) : async Result.Result<AnalysisResult, Text> {
    
    // Advanced analysis with specific legal framework
    let analysis = await _performAdvancedAnalysis(disputeId, evidenceIds, legalFramework);
    analysisResults.put(analysis.id, analysis);
    disputeToAnalysisMap.put(disputeId, analysis.id);
    #ok(analysis)
  };

  public query func getAnalysis(disputeId: Nat) : async Result.Result<AnalysisResult, Text> {
    // Find analysis by dispute ID
    switch (disputeToAnalysisMap.get(disputeId)) {
      case (?analysisId) {
        switch (analysisResults.get(analysisId)) {
          case (?analysis) { #ok(analysis) };
          case null { #err("Analysis not found") };
        };
      };
      case null { #err("Analysis not found for dispute") };
    };
  };

  // Legacy getAnalysis
  public query func getAnalysis(analysisId: Nat): async ?AnalysisResultLegacy {
    switch (analysisResults.get(analysisId)) {
      case null { null };
      case (?analysis) {
        ?{
          id = analysis.id;
          disputeId = analysis.disputeId;
          summary = analysis.reasoning;
          keyPoints = analysis.keyFactors;
          recommendation = analysis.decision;
          confidenceScore = analysis.confidenceScore;
          positiveFactors = analysis.keyFactors;
          negativeFactors = [];
          submittedAt = analysis.analyzedAt;
        }
      };
    };
  };

  public query func getAnalysisByDispute(disputeId: Nat): async ?AnalysisResultLegacy {
    switch (disputeToAnalysisMap.get(disputeId)) {
      case (?analysisId) { 
        switch (analysisResults.get(analysisId)) {
          case (?analysis) {
            ?{
              id = analysis.id;
              disputeId = analysis.disputeId;
              summary = analysis.reasoning;
              keyPoints = analysis.keyFactors;
              recommendation = analysis.decision;
              confidenceScore = analysis.confidenceScore;
              positiveFactors = analysis.keyFactors;
              negativeFactors = [];
              submittedAt = analysis.analyzedAt;
            }
          };
          case null { null };
        };
      };
      case null { null };
    };
  };

  public query func getAllAnalyses(): async [AnalysisResultLegacy] {
    let buffer = Buffer.Buffer<AnalysisResultLegacy>(10);
    for (analysis in analysisResults.vals()) {
      buffer.add({
        id = analysis.id;
        disputeId = analysis.disputeId;
        summary = analysis.reasoning;
        keyPoints = analysis.keyFactors;
        recommendation = analysis.decision;
        confidenceScore = analysis.confidenceScore;
        positiveFactors = analysis.keyFactors;
        negativeFactors = [];
        submittedAt = analysis.analyzedAt;
      });
    };
    Buffer.toArray(buffer);
  };

  public shared ({ caller }) func addLegalPattern(pattern: LegalPattern) : async () {
    // Allow adding new legal patterns (for system improvement)
    legalPatterns.put(pattern.patternId, pattern);
  };

  // ===== PRIVATE ANALYSIS FUNCTIONS =====
  private func _performRuleBasedAnalysis(
    disputeId: Nat,
    evidence: [Text]
  ) : async AnalysisResult {
    
    var plaintiffScore: Float = 0.0;
    var defendantScore: Float = 0.0;
    let factors = Buffer.Buffer<Text>(0);
    let references = Buffer.Buffer<Text>(0);

    // Ensure patterns are initialized
    if (legalPatterns.size() == 0) {
      let _ = await initPatterns();
    };

    // Analyze each piece of evidence
    for (text in evidence.vals()) {
      for (pattern in legalPatterns.vals()) {
        let matchScore = _calculatePatternMatch(text, pattern);
        if (matchScore > 0.3) { // Threshold for pattern matching
          if (pattern.decisionBias > 0) {
            plaintiffScore += pattern.decisionBias * pattern.weight * matchScore;
          } else {
            defendantScore += Float.abs(pattern.decisionBias) * pattern.weight * matchScore;
          };
          factors.add(pattern.legalBasis);
          references.add("Pattern: " # pattern.patternId);
        };
      };
    };

    // Determine ruling
    let totalScore = plaintiffScore + defendantScore;
    let confidence = if (totalScore > 0) {
      Float.abs(plaintiffScore - defendantScore) / totalScore
    } else {
      0.5
    };

    let (decision, award) = if (plaintiffScore > defendantScore) {
      let awardPercentage = Float.toInt(plaintiffScore * 100.0);
      ("PLAINTIFF_WINS", awardPercentage)
    } else if (defendantScore > plaintiffScore) {
      ("DEFENDANT_WINS", 0)
    } else {
      ("SPLIT", 50) // Split decision
    };

    let analysisId = nextAnalysisId;
    nextAnalysisId += 1;

    {
      id = analysisId;
      disputeId = disputeId;
      decision = decision;
      plaintiffAward = award;
      reasoning = _generateReasoning(decision, factors.toArray(), confidence);
      confidenceScore = confidence;
      keyFactors = factors.toArray();
      legalReferences = references.toArray();
      analysisMethod = "RULE_BASED_ANALYSIS";
      analyzedAt = Time.now();
    }
  };

  private func _performAdvancedAnalysis(
    disputeId: Nat,
    evidenceIds: [Text],
    legalFramework: Text
  ) : async AnalysisResult {
    
    // Placeholder for advanced AI analysis
    // This would integrate with external AI services via HTTPS outcalls
    
    let analysisId = nextAnalysisId;
    nextAnalysisId += 1;

    {
      id = analysisId;
      disputeId = disputeId;
      decision = "PLAINTIFF_WINS";
      plaintiffAward = 75;
      reasoning = "Advanced analysis based on " # legalFramework # " principles";
      confidenceScore = 0.85;
      keyFactors = ["Contract breach established", "Damages quantifiable"];
      legalReferences = [legalFramework # " Section 2-207"];
      analysisMethod = "ADVANCED_AI_ANALYSIS";
      analyzedAt = Time.now();
    }
  };

  private func _calculatePatternMatch(text: Text, pattern: LegalPattern) : Float {
    var matchCount: Float = 0.0;
    for (keyword in pattern.keywords.vals()) {
      if (Text.contains(text, #text keyword)) {
        matchCount += 1.0;
      };
    };
    if (pattern.keywords.size() > 0) {
      matchCount / Float.fromInt(pattern.keywords.size())
    } else {
      0.0
    }
  };

  private func _generateReasoning(decision: Text, factors: [Text], confidence: Float) : Text {
    var reasoning = "Based on the analysis of submitted evidence, the ruling is in favor of ";
    
    switch (decision) {
      case ("PLAINTIFF_WINS") {
        reasoning := reasoning # "the plaintiff. ";
      };
      case ("DEFENDANT_WINS") {
        reasoning := reasoning # "the defendant. ";
      };
      case ("SPLIT") {
        reasoning := reasoning # "both parties with a split decision. ";
      };
      case (_) {
        reasoning := reasoning # "neither party (dismissed). ";
      };
    };

    reasoning := reasoning # "Key factors considered: " # Text.join(", ", factors.vals()) # ". ";
    reasoning := reasoning # "Confidence level: " # Float.toText(confidence * 100.0) # "%.";

    reasoning
  };

  // Health check
  public query func health(): async Text {
    "AI Analysis is operational";
  };
}
