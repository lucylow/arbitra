export const idlFactory = ({ IDL }) => {
  const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const DisputeStatus = IDL.Variant({
    'EvidenceSubmission' : IDL.Null,
    'ArbitratorReview' : IDL.Null,
    'Closed' : IDL.Null,
    'Active' : IDL.Null,
    'Draft' : IDL.Null,
    'AIAnalysis' : IDL.Null,
    'Appealed' : IDL.Null,
    'Settled' : IDL.Null,
  });
  const Ruling = IDL.Record({
    'id' : IDL.Nat,
    'keyFactors' : IDL.Vec(IDL.Text),
    'decision' : IDL.Text,
    'reasoning' : IDL.Text,
    'confidenceScore' : IDL.Float64,
    'issuedAt' : IDL.Int,
    'issuedBy' : IDL.Principal,
    'disputeId' : IDL.Nat,
  });
  const EvidenceReference = IDL.Record({
    'id' : IDL.Nat,
    'hash' : IDL.Text,
    'fileName' : IDL.Text,
    'uploadedAt' : IDL.Int,
    'uploadedBy' : IDL.Principal,
  });
  const Dispute = IDL.Record({
    'id' : IDL.Nat,
    'status' : DisputeStatus,
    'title' : IDL.Text,
    'governingLaw' : IDL.Text,
    'ruling' : IDL.Opt(Ruling),
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'amountInDispute' : IDL.Nat,
    'arbitrationClause' : IDL.Text,
    'updatedAt' : IDL.Int,
    'defendant' : IDL.Principal,
    'evidence' : IDL.Vec(EvidenceReference),
    'currency' : IDL.Text,
    'plaintiff' : IDL.Principal,
  });
  const Result_1 = IDL.Variant({ 'ok' : Dispute, 'err' : IDL.Text });
  return IDL.Service({
    'activateDispute' : IDL.Func([IDL.Nat], [Result_3], []),
    'assignArbitrator' : IDL.Func([IDL.Text, IDL.Principal], [Result], []),
    'createDispute' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text, IDL.Nat],
        [Result],
        [],
      ),
    'createDisputeFull' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Principal,
          IDL.Nat,
          IDL.Text,
          IDL.Text,
          IDL.Text,
        ],
        [Result_2],
        [],
      ),
    'getAllDisputes' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'id' : IDL.Text,
              'arbitrator' : IDL.Opt(IDL.Principal),
              'status' : IDL.Variant({
                'EvidenceSubmission' : IDL.Null,
                'UnderReview' : IDL.Null,
                'Closed' : IDL.Null,
                'Decided' : IDL.Null,
                'Appealed' : IDL.Null,
                'Pending' : IDL.Null,
              }),
              'title' : IDL.Text,
              'decision' : IDL.Opt(IDL.Text),
              'claimant' : IDL.Principal,
              'createdAt' : IDL.Int,
              'description' : IDL.Text,
              'updatedAt' : IDL.Int,
              'respondent' : IDL.Principal,
              'escrowId' : IDL.Opt(IDL.Text),
              'amount' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'getAllDisputesInternal' : IDL.Func([], [IDL.Vec(Dispute)], ['query']),
    'getDispute' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'id' : IDL.Text,
              'arbitrator' : IDL.Opt(IDL.Principal),
              'status' : IDL.Variant({
                'EvidenceSubmission' : IDL.Null,
                'UnderReview' : IDL.Null,
                'Closed' : IDL.Null,
                'Decided' : IDL.Null,
                'Appealed' : IDL.Null,
                'Pending' : IDL.Null,
              }),
              'title' : IDL.Text,
              'decision' : IDL.Opt(IDL.Text),
              'claimant' : IDL.Principal,
              'createdAt' : IDL.Int,
              'description' : IDL.Text,
              'updatedAt' : IDL.Int,
              'respondent' : IDL.Principal,
              'escrowId' : IDL.Opt(IDL.Text),
              'amount' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'getDisputeInternal' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'getDisputesByUser' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Vec(
            IDL.Record({
              'id' : IDL.Text,
              'arbitrator' : IDL.Opt(IDL.Principal),
              'status' : IDL.Variant({
                'EvidenceSubmission' : IDL.Null,
                'UnderReview' : IDL.Null,
                'Closed' : IDL.Null,
                'Decided' : IDL.Null,
                'Appealed' : IDL.Null,
                'Pending' : IDL.Null,
              }),
              'title' : IDL.Text,
              'decision' : IDL.Opt(IDL.Text),
              'claimant' : IDL.Principal,
              'createdAt' : IDL.Int,
              'description' : IDL.Text,
              'updatedAt' : IDL.Int,
              'respondent' : IDL.Principal,
              'escrowId' : IDL.Opt(IDL.Text),
              'amount' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'getUserDisputes' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Dispute)],
        ['query'],
      ),
    'health' : IDL.Func([], [IDL.Text], ['query']),
    'linkEscrow' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'registerUser' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Variant({
            'Claimant' : IDL.Null,
            'Respondent' : IDL.Null,
            'Admin' : IDL.Null,
            'Arbitrator' : IDL.Null,
          }),
        ],
        [Result],
        [],
      ),
    'submitDecision' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'updateDisputeStatus' : IDL.Func(
        [
          IDL.Text,
          IDL.Variant({
            'EvidenceSubmission' : IDL.Null,
            'UnderReview' : IDL.Null,
            'Closed' : IDL.Null,
            'Decided' : IDL.Null,
            'Appealed' : IDL.Null,
            'Pending' : IDL.Null,
          }),
        ],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
