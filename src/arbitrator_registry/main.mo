import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Hash "mo:base/Hash";
import Int "mo:base/Int";

actor ArbitratorRegistry {
  
  // ========== ARBITRATOR PROFILES ==========
  
  public type Arbitrator = {
    id: Text;
    principal: Principal;
    name: Text;
    credentials: Credentials;
    specialization: [Specialization];
    jurisdictions: [Text];
    languages: [Text];
    experience: Experience;
    rating: Rating;
    availability: Availability;
    feeStructure: FeeStructure;
    isCertified: Bool;
  };

  public type Credentials = {
    barAdmissions: [Text];
    certifications: [Text];
    education: [Education];
    yearsExperience: Nat;
  };

  public type Education = {
    degree: Text;
    institution: Text;
    year: Nat;
  };

  public type Specialization = {
    area: Text;
    subAreas: [Text];
    expertiseLevel: Text; // BEGINNER, INTERMEDIATE, EXPERT
  };

  public type Experience = {
    totalCases: Nat;
    internationalCases: Nat;
    commercialCases: Nat;
    successRate: Float;
  };

  public type Rating = {
    average: Float;
    totalReviews: Nat;
    breakdown: [RatingBreakdown];
  };

  public type RatingBreakdown = {
    category: Text;
    score: Float;
  };

  public type Availability = {
    status: Text; // AVAILABLE, LIMITED, UNAVAILABLE
    casesPerMonth: Nat;
    responseTimeHours: Nat;
  };

  public type FeeStructure = {
    model: Text; // HOURLY, FIXED, CONTINGENCY
    rate: Nat; // USD cents per hour or fixed amount
    currency: Text;
  };

  // ========== PANEL MANAGEMENT ==========
  
  public type ArbitrationPanel = {
    id: Text;
    disputeId: Text;
    arbitrators: [Arbitrator];
    panelSize: Nat;
    presidingArbitrator: ?Arbitrator;
    selectionMethod: Text; // RANDOM, EXPERTISE, PARTY_SELECTION
    status: Text;
  };

  public type PanelRequirements = {
    jurisdiction: Text;
    legalArea: Text;
    complexity: Text; // LOW, MEDIUM, HIGH
    amountInDispute: Nat;
    panelSize: Nat; // 1 (sole), 3 (standard), 5 (complex)
    selectionMethod: Text;
    partyPreferences: ?[Text]; // Arbitrator IDs preferred by parties
    languageRequirements: [Text];
  };

  // ========== STORAGE ==========
  private stable var arbitratorArray: [(Text, Arbitrator)] = [];
  private stable var panelArray: [(Text, ArbitrationPanel)] = [];
  private let arbitrators = HashMap.HashMap<Text, Arbitrator>(10, Text.equal, Text.hash);
  private let panels = HashMap.HashMap<Text, ArbitrationPanel>(10, Text.equal, Text.hash);
  private let arbitratorPool = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  private stable var nextArbitratorId: Nat = 1;

  // ========== UPGRADE HOOKS ==========
  system func preupgrade() {
    let arbBuffer = Buffer.Buffer<(Text, Arbitrator)>(arbitrators.size());
    for ((id, arb) in arbitrators.entries()) {
      arbBuffer.add((id, arb));
    };
    arbitratorArray := Buffer.toArray(arbBuffer);

    let panelBuffer = Buffer.Buffer<(Text, ArbitrationPanel)>(panels.size());
    for ((id, panel) in panels.entries()) {
      panelBuffer.add((id, panel));
    };
    panelArray := Buffer.toArray(panelBuffer);
  };

  system func postupgrade() {
    for ((id, arb) in arbitratorArray.vals()) {
      arbitrators.put(id, arb);
      arbitratorPool.put(arb.principal, id);
    };
    for ((id, panel) in panelArray.vals()) {
      panels.put(id, panel);
    };
  };

  // ========== ARBITRATOR REGISTRATION & VERIFICATION ==========
  
  public shared ({ caller }) func registerArbitrator(
    profile: {
      name: Text;
      credentials: Credentials;
      specialization: [Specialization];
      jurisdictions: [Text];
      languages: [Text];
      experience: Experience;
      feeStructure: FeeStructure;
    }
  ) : async Result.Result<Text, Text> {
    
    // Verify credentials (simplified - in production would integrate with legal databases)
    if (not _verifyCredentials(profile.credentials)) {
      return #err("Credential verification failed");
    };

    let arbitratorId = "ARB_" # Int.toText(Time.now()) # "_" # Int.toText(nextArbitratorId);
    nextArbitratorId += 1;

    let arbitrator: Arbitrator = {
      id = arbitratorId;
      principal = caller;
      name = profile.name;
      credentials = profile.credentials;
      specialization = profile.specialization;
      jurisdictions = profile.jurisdictions;
      languages = profile.languages;
      experience = profile.experience;
      rating = {
        average = 5.0;
        totalReviews = 0;
        breakdown = [];
      };
      availability = {
        status = "AVAILABLE";
        casesPerMonth = 5;
        responseTimeHours = 24;
      };
      feeStructure = profile.feeStructure;
      isCertified = true;
    };

    arbitrators.put(arbitratorId, arbitrator);
    arbitratorPool.put(caller, arbitratorId);

    #ok(arbitratorId)
  };

  // ========== PANEL SELECTION ALGORITHMS ==========
  
  public func selectArbitrationPanel(
    disputeId: Text,
    requirements: PanelRequirements
  ) : async Result.Result<ArbitrationPanel, Text> {
    
    let eligibleArbitrators = _findEligibleArbitrators(requirements);
    
    if (eligibleArbitrators.size() < requirements.panelSize) {
      return #err("Insufficient qualified arbitrators available");
    };

    let selectedArbitrators = _selectOptimalPanel(eligibleArbitrators, requirements);
    let presidingArbitrator = _selectPresidingArbitrator(selectedArbitrators);

    let panelId = "PANEL_" # disputeId;

    let panel: ArbitrationPanel = {
      id = panelId;
      disputeId = disputeId;
      arbitrators = selectedArbitrators;
      panelSize = requirements.panelSize;
      presidingArbitrator = presidingArbitrator;
      selectionMethod = requirements.selectionMethod;
      status = "FORMED";
    };

    panels.put(panelId, panel);
    #ok(panel)
  };

  // ========== EXPERTISE-BASED MATCHING ==========
  
  private func _findEligibleArbitrators(requirements: PanelRequirements) : [Arbitrator] {
    let eligible = Buffer.Buffer<Arbitrator>(0);
    
    for (arbitrator in arbitrators.vals()) {
      if (_meetsRequirements(arbitrator, requirements)) {
        eligible.add(arbitrator);
      };
    };
    
    eligible.toArray()
  };

  private func _meetsRequirements(arbitrator: Arbitrator, requirements: PanelRequirements) : Bool {
    // Check jurisdiction
    if (not Array.contains<Text>(arbitrator.jurisdictions, requirements.jurisdiction, Text.equal)) {
      return false;
    };

    // Check specialization
    let hasExpertise = Array.find<Specialization>(
      arbitrator.specialization,
      func(spec) { spec.area == requirements.legalArea }
    ) != null;

    if (not hasExpertise) {
      return false;
    };

    // Check availability
    if (arbitrator.availability.status != "AVAILABLE") {
      return false;
    };

    // Check language requirements
    for (language in requirements.languageRequirements.vals()) {
      if (not Array.contains<Text>(arbitrator.languages, language, Text.equal)) {
        return false;
      };
    };

    // Check experience level based on dispute complexity
    let meetsExperience = switch (requirements.complexity) {
      case ("HIGH") { arbitrator.credentials.yearsExperience >= 10 };
      case ("MEDIUM") { arbitrator.credentials.yearsExperience >= 5 };
      case ("LOW") { true };
      case (_) { true };
    };

    meetsExperience
  };

  private func _selectOptimalPanel(
    eligible: [Arbitrator],
    requirements: PanelRequirements
  ) : [Arbitrator] {
    
    // Score arbitrators based on multiple factors
    let scoredArbitrators = Array.map<Arbitrator, {arbitrator: Arbitrator; score: Float}>(
      eligible,
      func(arb) {
        let score = _calculateArbitratorScore(arb, requirements);
        { arbitrator = arb; score = score }
      }
    );

    // Sort by score descending
    let sorted = Array.sort(
      scoredArbitrators,
      func(a, b) { 
        if (a.score > b.score) { #greater }
        else if (a.score < b.score) { #less }
        else { #equal }
      }
    );

    // Take top N arbitrators
    let selected = Buffer.Buffer<Arbitrator>(requirements.panelSize);
    var i = 0;
    for (scored in sorted.vals()) {
      if (i < requirements.panelSize) {
        selected.add(scored.arbitrator);
        i += 1;
      };
    };
    
    selected.toArray()
  };

  private func _calculateArbitratorScore(arbitrator: Arbitrator, requirements: PanelRequirements) : Float {
    var score: Float = 0.0;

    // Experience weighting (40%)
    score += Float.fromInt(arbitrator.credentials.yearsExperience) * 0.4;

    // Rating weighting (30%)
    score += arbitrator.rating.average * 6.0; // Convert 5-point scale to 30%

    // Specialization depth (20%)
    let specialization = Array.find<Specialization>(
      arbitrator.specialization,
      func(spec) { spec.area == requirements.legalArea }
    );
    
    switch (specialization) {
      case (?spec) {
        switch (spec.expertiseLevel) {
          case ("EXPERT") { score += 20.0 };
          case ("INTERMEDIATE") { score += 15.0 };
          case ("BEGINNER") { score += 10.0 };
          case (_) { score += 10.0 };
        };
      };
      case (null) { score += 0.0 };
    };

    // Case volume adjustment (10%)
    let workloadFactor = 1.0 - (Float.fromInt(arbitrator.experience.totalCases) / 1000.0);
    score += Float.max(0.0, workloadFactor * 10.0);

    score
  };

  private func _selectPresidingArbitrator(arbitrators: [Arbitrator]) : ?Arbitrator {
    if (arbitrators.size() == 0) { return null };
    
    // Select arbitrator with highest experience and rating
    let sorted = Array.sort(
      arbitrators,
      func(a, b) {
        let scoreA = Float.fromInt(a.credentials.yearsExperience) + a.rating.average;
        let scoreB = Float.fromInt(b.credentials.yearsExperience) + b.rating.average;
        if (scoreA > scoreB) { #greater }
        else if (scoreA < scoreB) { #less }
        else { #equal }
      }
    );
    
    ?sorted[0]
  };

  // ========== CREDENTIAL VERIFICATION ==========
  
  private func _verifyCredentials(credentials: Credentials) : Bool {
    // Minimum experience requirement
    if (credentials.yearsExperience < 3) {
      return false;
    };

    // Must have at least one bar admission or certification
    if (credentials.barAdmissions.size() == 0 and credentials.certifications.size() == 0) {
      return false;
    };

    // Must have relevant education
    if (credentials.education.size() == 0) {
      return false;
    };

    true
  };

  // ========== QUERY METHODS ==========
  
  public query func getArbitrator(arbitratorId: Text) : async ?Arbitrator {
    arbitrators.get(arbitratorId)
  };

  public query func searchArbitrators(
    jurisdiction: Text,
    specialization: Text,
    minExperience: Nat
  ) : async [Arbitrator] {
    
    let results = Buffer.Buffer<Arbitrator>(0);
    
    for (arbitrator in arbitrators.vals()) {
      if (Array.contains<Text>(arbitrator.jurisdictions, jurisdiction, Text.equal) and
          Array.find<Specialization>(
            arbitrator.specialization,
            func(spec) { spec.area == specialization }
          ) != null and
          arbitrator.credentials.yearsExperience >= minExperience) {
        results.add(arbitrator);
      };
    };
    
    results.toArray()
  };

  public query func getPanel(panelId: Text) : async ?ArbitrationPanel {
    panels.get(panelId)
  };

  // Health check
  public query func health(): async Text {
    "Arbitrator Registry is operational";
  };
}

