import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Dispute {
  'id' : bigint,
  'status' : DisputeStatus,
  'title' : string,
  'governingLaw' : string,
  'ruling' : [] | [Ruling],
  'createdAt' : bigint,
  'description' : string,
  'amountInDispute' : bigint,
  'arbitrationClause' : string,
  'updatedAt' : bigint,
  'defendant' : Principal,
  'evidence' : Array<EvidenceReference>,
  'currency' : string,
  'plaintiff' : Principal,
}
export type DisputeStatus = { 'EvidenceSubmission' : null } |
  { 'ArbitratorReview' : null } |
  { 'Closed' : null } |
  { 'Active' : null } |
  { 'Draft' : null } |
  { 'AIAnalysis' : null } |
  { 'Appealed' : null } |
  { 'Settled' : null };
export interface EvidenceReference {
  'id' : bigint,
  'hash' : string,
  'fileName' : string,
  'uploadedAt' : bigint,
  'uploadedBy' : Principal,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : Dispute } |
  { 'err' : string };
export type Result_2 = { 'ok' : bigint } |
  { 'err' : string };
export type Result_3 = { 'ok' : null } |
  { 'err' : string };
export interface Ruling {
  'id' : bigint,
  'keyFactors' : Array<string>,
  'decision' : string,
  'reasoning' : string,
  'confidenceScore' : number,
  'issuedAt' : bigint,
  'issuedBy' : Principal,
  'disputeId' : bigint,
}
export interface _SERVICE {
  'activateDispute' : ActorMethod<[bigint], Result_3>,
  'assignArbitrator' : ActorMethod<[string, Principal], Result>,
  'createDispute' : ActorMethod<[Principal, string, string, bigint], Result>,
  'createDisputeFull' : ActorMethod<
    [string, string, Principal, bigint, string, string, string],
    Result_2
  >,
  'getAllDisputes' : ActorMethod<
    [],
    Array<
      {
        'id' : string,
        'arbitrator' : [] | [Principal],
        'status' : { 'EvidenceSubmission' : null } |
          { 'UnderReview' : null } |
          { 'Closed' : null } |
          { 'Decided' : null } |
          { 'Appealed' : null } |
          { 'Pending' : null },
        'title' : string,
        'decision' : [] | [string],
        'claimant' : Principal,
        'createdAt' : bigint,
        'description' : string,
        'updatedAt' : bigint,
        'respondent' : Principal,
        'escrowId' : [] | [string],
        'amount' : bigint,
      }
    >
  >,
  'getAllDisputesInternal' : ActorMethod<[], Array<Dispute>>,
  'getDispute' : ActorMethod<
    [string],
    [] | [
      {
        'id' : string,
        'arbitrator' : [] | [Principal],
        'status' : { 'EvidenceSubmission' : null } |
          { 'UnderReview' : null } |
          { 'Closed' : null } |
          { 'Decided' : null } |
          { 'Appealed' : null } |
          { 'Pending' : null },
        'title' : string,
        'decision' : [] | [string],
        'claimant' : Principal,
        'createdAt' : bigint,
        'description' : string,
        'updatedAt' : bigint,
        'respondent' : Principal,
        'escrowId' : [] | [string],
        'amount' : bigint,
      }
    ]
  >,
  'getDisputeInternal' : ActorMethod<[bigint], Result_1>,
  'getDisputesByUser' : ActorMethod<
    [Principal],
    Array<
      {
        'id' : string,
        'arbitrator' : [] | [Principal],
        'status' : { 'EvidenceSubmission' : null } |
          { 'UnderReview' : null } |
          { 'Closed' : null } |
          { 'Decided' : null } |
          { 'Appealed' : null } |
          { 'Pending' : null },
        'title' : string,
        'decision' : [] | [string],
        'claimant' : Principal,
        'createdAt' : bigint,
        'description' : string,
        'updatedAt' : bigint,
        'respondent' : Principal,
        'escrowId' : [] | [string],
        'amount' : bigint,
      }
    >
  >,
  'getUserDisputes' : ActorMethod<[Principal], Array<Dispute>>,
  'health' : ActorMethod<[], string>,
  'linkEscrow' : ActorMethod<[string, string], Result>,
  'registerUser' : ActorMethod<
    [
      string,
      string,
      { 'Claimant' : null } |
        { 'Respondent' : null } |
        { 'Admin' : null } |
        { 'Arbitrator' : null },
    ],
    Result
  >,
  'submitDecision' : ActorMethod<[string, string], Result>,
  'updateDisputeStatus' : ActorMethod<
    [
      string,
      { 'EvidenceSubmission' : null } |
        { 'UnderReview' : null } |
        { 'Closed' : null } |
        { 'Decided' : null } |
        { 'Appealed' : null } |
        { 'Pending' : null },
    ],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
