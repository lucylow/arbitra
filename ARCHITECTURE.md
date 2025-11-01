# Arbitra Architecture Documentation

## System Overview

Arbitra is a decentralized legal dispute resolution platform built on the Internet Computer Protocol (ICP). The system consists of four backend canisters (smart contracts) and a React-based frontend, all deployed entirely on-chain.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                    │
│                  Internet Identity Auth                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ ICP Agent
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  Backend Canisters (Motoko)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Arbitra    │  │   Evidence   │  │      AI      │    │
│  │   Backend    │──│   Manager    │──│   Analysis   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                                                   │
│         │                                                   │
│  ┌──────────────┐                                          │
│  │   Bitcoin    │                                          │
│  │   Escrow     │                                          │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Arbitra Backend Canister

**Purpose**: Core dispute management and user profiles

**Key Functions**:
- `createDispute`: Create new dispute case
- `getDispute`: Retrieve dispute details
- `getAllDisputes`: List all disputes
- `getDisputesByUser`: Filter disputes by user
- `assignArbitrator`: Assign arbitrator to case
- `updateDisputeStatus`: Update dispute state
- `submitDecision`: Record arbitrator decision
- `registerUser`: Register user profile
- `registerArbitrator`: Register arbitrator profile

**Data Structures**:
- Dispute records with full case details
- User profiles with roles
- Arbitrator profiles with expertise

### 2. Evidence Manager Canister

**Purpose**: Secure evidence storage and verification

**Key Functions**:
- `submitEvidence`: Upload and hash evidence
- `getEvidence`: Retrieve evidence by ID
- `getDisputeEvidence`: Get all evidence for a dispute
- `verifyEvidence`: Verify evidence integrity
- `markVerified`: Update verification status

**Security Features**:
- SHA-256 cryptographic hashing
- Tamper-proof storage
- Chain-of-custody tracking

### 3. AI Analysis Canister

**Purpose**: Intelligent dispute analysis

**Key Functions**:
- `analyzeDispute`: Perform AI analysis on case
- `getAnalysis`: Retrieve analysis results
- `reanalyzeDispute`: Update analysis with new data
- `interpretConfidence`: Get confidence interpretation

**Analysis Features**:
- Chain-of-thought reasoning
- Key point extraction
- Recommendation generation
- Confidence scoring

### 4. Bitcoin Escrow Canister

**Purpose**: Automated fund management

**Key Functions**:
- `createEscrow`: Initialize escrow for dispute
- `fundEscrow`: Deposit funds
- `releaseEscrow`: Release to beneficiary
- `refundEscrow`: Refund to depositor
- `markDisputed`: Mark escrow as disputed

**Integration**:
- ICP Bitcoin integration
- Multi-signature support
- Automated settlement

### 5. Frontend Application

**Technology**: React 19 + TypeScript + Vite

**Key Features**:
- Internet Identity authentication
- Dispute creation and viewing
- Real-time status updates
- Responsive design

**Services**:
- `agent.ts`: ICP agent and authentication
- `disputeService.ts`: Backend communication

## Data Flow

### Creating a Dispute

1. User authenticates with Internet Identity
2. Frontend calls `createDispute` on arbitra_backend
3. Backend creates dispute record
4. Escrow canister creates corresponding escrow
5. Dispute ID returned to user

### Evidence Submission

1. User uploads evidence file
2. Frontend computes hash
3. Calls `submitEvidence` on evidence_manager
4. Evidence stored with hash for verification
5. Evidence linked to dispute

### AI Analysis

1. Arbitrator requests analysis
2. Frontend calls `analyzeDispute` on ai_analysis
3. AI processes dispute and evidence
4. Returns summary, key points, recommendation
5. Results displayed to arbitrator

### Decision and Settlement

1. Arbitrator submits decision
2. Backend updates dispute status
3. Escrow canister releases funds
4. All parties notified

## Security Considerations

### Authentication
- Internet Identity for secure, passwordless auth
- Principal-based access control
- No private keys stored

### Data Integrity
- Cryptographic hashing of evidence
- Immutable on-chain storage
- Audit trail for all actions

### Smart Contract Security
- Type-safe Motoko code
- Result types for error handling
- Access control checks

## Scalability

### ICP Advantages
- 1-2 second finality
- Low transaction costs
- Horizontal scaling via subnets
- Efficient state management

### Optimization Strategies
- HashMap for O(1) lookups
- Stable variables for persistence
- Efficient data structures

## Deployment

### Local Development
```bash
dfx start --background
dfx deploy
```

### IC Mainnet
```bash
dfx deploy --network ic
```

## Future Enhancements

1. **Multi-language Support**: Internationalization
2. **Advanced AI**: Integration with external AI models
3. **DAO Governance**: Community-driven platform rules
4. **Cross-chain**: Support for other blockchain escrows
5. **Mobile App**: Native mobile applications

## Conclusion

Arbitra's architecture leverages ICP's unique capabilities to create a fully decentralized, secure, and scalable legal dispute resolution platform. The modular design allows for easy maintenance and future enhancements while maintaining security and performance.
