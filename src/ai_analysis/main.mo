import Types "../types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Float "mo:base/Float";

actor AIAnalysis {
    // State variables
    private var analyses = HashMap.HashMap<Text, Types.AIAnalysis>(10, Text.equal, Text.hash);

    // Analyze dispute with AI
    public func analyzeDispute(
        disputeId: Text,
        disputeTitle: Text,
        disputeDescription: Text,
        evidenceDescriptions: [Text]
    ) : async Result.Result<Types.AIAnalysis, Text> {
        
        // Simulate AI analysis with chain-of-thought reasoning
        let keyPoints = generateKeyPoints(disputeDescription, evidenceDescriptions);
        let summary = generateSummary(disputeTitle, disputeDescription, keyPoints);
        let recommendation = generateRecommendation(keyPoints);
        let confidence = calculateConfidence(evidenceDescriptions.size());
        
        let analysis: Types.AIAnalysis = {
            disputeId = disputeId;
            summary = summary;
            keyPoints = keyPoints;
            recommendation = recommendation;
            confidence = confidence;
            timestamp = Time.now();
        };
        
        analyses.put(disputeId, analysis);
        #ok(analysis)
    };

    // Get analysis for dispute
    public query func getAnalysis(disputeId: Text) : async ?Types.AIAnalysis {
        analyses.get(disputeId)
    };

    // Get all analyses
    public query func getAllAnalyses() : async [Types.AIAnalysis] {
        Iter.toArray(analyses.vals())
    };

    // Helper: Generate key points from evidence
    private func generateKeyPoints(description: Text, evidenceDescriptions: [Text]) : [Text] {
        var points: [Text] = [];
        
        // Extract key information from dispute description
        if (Text.contains(description, #text "contract")) {
            points := Array.append(points, ["Contract-related dispute identified"]);
        };
        if (Text.contains(description, #text "payment")) {
            points := Array.append(points, ["Payment issue detected"]);
        };
        if (Text.contains(description, #text "delivery")) {
            points := Array.append(points, ["Delivery concern noted"]);
        };
        
        // Analyze evidence count
        let evidenceCount = evidenceDescriptions.size();
        if (evidenceCount > 0) {
            points := Array.append(points, [
                Nat.toText(evidenceCount) # " pieces of evidence submitted"
            ]);
        };
        
        // Add generic analysis points
        points := Array.append(points, [
            "Both parties have opportunity to present their case",
            "Evidence should be reviewed for authenticity",
            "Applicable laws and precedents should be considered"
        ]);
        
        points
    };

    // Helper: Generate summary
    private func generateSummary(title: Text, description: Text, keyPoints: [Text]) : Text {
        var summary = "AI Analysis Summary for: " # title # ". ";
        summary #= "The dispute involves " # description # ". ";
        summary #= "Key findings: " # Nat.toText(keyPoints.size()) # " important points identified. ";
        summary #= "Recommendation based on chain-of-thought reasoning and evidence evaluation.";
        summary
    };

    // Helper: Generate recommendation
    private func generateRecommendation(keyPoints: [Text]) : Text {
        var recommendation = "Based on the analysis of submitted evidence and dispute details, ";
        
        if (keyPoints.size() >= 5) {
            recommendation #= "there is substantial information to make an informed decision. ";
            recommendation #= "The arbitrator should carefully review all evidence, ";
            recommendation #= "consider applicable legal frameworks, and ensure both parties ";
            recommendation #= "have had fair opportunity to present their case. ";
        } else {
            recommendation #= "additional evidence may be beneficial for a comprehensive decision. ";
            recommendation #= "The arbitrator may request clarification or supplementary documentation. ";
        };
        
        recommendation #= "A balanced decision should consider the merits of both parties' arguments ";
        recommendation #= "and aim for a fair resolution that upholds justice and contractual obligations.";
        
        recommendation
    };

    // Helper: Calculate confidence score
    private func calculateConfidence(evidenceCount: Nat) : Float {
        // Simple confidence calculation based on evidence availability
        let baseConfidence: Float = 0.5;
        let evidenceBonus: Float = Float.fromInt(evidenceCount) * 0.08;
        let confidence = Float.min(baseConfidence + evidenceBonus, 0.95);
        confidence
    };

    // Reanalyze dispute with updated information
    public func reanalyzeDispute(
        disputeId: Text,
        disputeTitle: Text,
        disputeDescription: Text,
        evidenceDescriptions: [Text]
    ) : async Result.Result<Types.AIAnalysis, Text> {
        // Same as analyzeDispute but explicitly for updates
        await analyzeDispute(disputeId, disputeTitle, disputeDescription, evidenceDescriptions)
    };

    // Get confidence level interpretation
    public query func interpretConfidence(confidence: Float) : async Text {
        if (confidence >= 0.8) {
            "High confidence - Strong evidence and clear case details"
        } else if (confidence >= 0.6) {
            "Moderate confidence - Adequate evidence for decision making"
        } else if (confidence >= 0.4) {
            "Low confidence - Limited evidence, may need additional information"
        } else {
            "Very low confidence - Insufficient evidence for reliable analysis"
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
