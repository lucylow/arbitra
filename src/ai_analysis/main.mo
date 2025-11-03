import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

actor AIAnalysis {
  
  // Types
  public type AnalysisResult = {
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

  // State
  private stable var analysisArray: [AnalysisResult] = [];
  private stable var nextAnalysisId: Nat = 1;
  private func natHash(n: Nat): Hash.Hash {
    Text.hash(Nat.toText(n));
  };
  private let analysisMap = HashMap.HashMap<Nat, AnalysisResult>(10, Nat.equal, natHash);
  private let disputeToAnalysisMap = HashMap.HashMap<Nat, Nat>(10, Nat.equal, natHash);

  // Pre-upgrade
  system func preupgrade() {
    let buffer = Buffer.Buffer<AnalysisResult>(analysisMap.size());
    for ((_, analysis) in analysisMap.entries()) {
      buffer.add(analysis);
    };
    analysisArray := Buffer.toArray(buffer);
  };

  // Post-upgrade
  system func postupgrade() {
    for (analysis in analysisArray.vals()) {
      analysisMap.put(analysis.id, analysis);
      disputeToAnalysisMap.put(analysis.disputeId, analysis.id);
    };
  };

  // Analyze dispute with mock AI logic
  public shared(msg) func analyzeDispute(
    disputeId: Nat,
    claimantDescription: Text,
    respondentDescription: Text,
    amount: Nat
  ): async Result.Result<Nat, Text> {
    // Check if analysis already exists
    switch (disputeToAnalysisMap.get(disputeId)) {
      case (?existingId) {
        return #err("Analysis already exists for this dispute");
      };
      case null {};
    };

    let analysisId = nextAnalysisId;
    nextAnalysisId += 1;

    // Mock AI Analysis - In production, this would call an actual AI service
    let analysis = generateMockAnalysis(analysisId, disputeId, claimantDescription, respondentDescription, amount);

    analysisMap.put(analysisId, analysis);
    disputeToAnalysisMap.put(disputeId, analysisId);
    #ok(analysisId);
  };

  // Internal mock analysis generator
  private func generateMockAnalysis(
    analysisId: Nat,
    disputeId: Nat,
    claimantDesc: Text,
    respondentDesc: Text,
    amount: Nat
  ): AnalysisResult {
    // Simple rule-based mock analysis
    let (summary, keyPoints, recommendation, confidence, positiveFactors, negativeFactors) = 
      if (Text.size(claimantDesc) > Text.size(respondentDesc) * 2) {
        (
          "Strong case for claimant. Substantial documentation and detailed evidence provided.",
          ["Detailed claimant documentation", "Respondent response lacks detail", "Amount is reasonable for claim type"],
          "Recommendation: Favor claimant",
          0.75,
          ["Well-documented claim", "Respondent evidence lacking", "Amount reasonable"],
          ["Limited respondent participation", "Minor inconsistencies in claim"]
        )
      } else if (Text.size(respondentDesc) > Text.size(claimantDesc) * 2) {
        (
          "Strong case for respondent. Comprehensive defense provided with supporting evidence.",
          ["Detailed respondent defense", "Claimant evidence insufficient", "Dispute appears unfounded"],
          "Recommendation: Favor respondent",
          0.70,
          ["Comprehensive defense", "Claimant documentation weak"],
          ["Initial claim has merit"]
        )
      } else {
        (
          "Balanced case. Both parties have provided reasonable arguments. Requires detailed review.",
          ["Balanced evidence from both parties", "Requires arbitrator judgment", "Dispute is complex"],
          "Recommendation: Requires full arbitrator review",
          0.60,
          ["Both parties engaged", "Dispute is well-documented"],
          ["Conflicting claims", "Complex factual issues"]
        )
      };

    {
      id = analysisId;
      disputeId = disputeId;
      summary = summary;
      keyPoints = keyPoints;
      recommendation = recommendation;
      confidenceScore = confidence;
      positiveFactors = positiveFactors;
      negativeFactors = negativeFactors;
      submittedAt = Time.now();
    }
  };

  // Get analysis by ID
  public query func getAnalysis(analysisId: Nat): async ?AnalysisResult {
    analysisMap.get(analysisId);
  };

  // Get analysis by dispute ID
  public query func getAnalysisByDispute(disputeId: Nat): async ?AnalysisResult {
    switch (disputeToAnalysisMap.get(disputeId)) {
      case (?analysisId) { analysisMap.get(analysisId) };
      case null { null };
    };
  };

  // Get all analyses
  public query func getAllAnalyses(): async [AnalysisResult] {
    let buffer = Buffer.Buffer<AnalysisResult>(10);
    for (analysis in analysisMap.vals()) {
      buffer.add(analysis);
    };
    Buffer.toArray(buffer);
  };

  // Health check
  public query func health(): async Text {
    "AI Analysis is operational";
  };
};

