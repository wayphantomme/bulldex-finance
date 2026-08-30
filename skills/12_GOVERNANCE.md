# Governance (DAO) — Feature Spec

**Status:** 🔴 Phase 3 (Weeks 9–12)
**Contracts:** `contracts/src/BDXGovernor.sol`, `contracts/src/TimelockController.sol`
**Frontend:** `frontend/src/app/dashboard/governance/page.tsx`
**Hooks:** `useGovernance`, `useProposal`, `useGovernanceActions` (to be built)

---

## What It Does

On-chain governance using OpenZeppelin Governor framework.
BDX token holders can propose, vote on, and execute protocol parameter changes,
treasury allocations, and contract upgrades via a time-locked DAO.

---

## Governance Flow

```
1. Propose     — BDX holder creates a proposal (requires minimum token threshold)
2. Voting Delay — blocks before voting opens (e.g. 1 day)
3. Voting Period — blocks during which votes are cast (e.g. 1 week)
4. Queued      — if passed: proposal enters Timelock queue (e.g. 2 day delay)
5. Executed    — after timelock, proposal is executed on-chain
```

### Proposal States
```
Pending   → proposal created, voting not yet open
Active    → voting period open
Canceled  → proposer canceled (or threshold dropped below minimum)
Defeated  → voting ended, quorum not met OR majority voted Against
Succeeded → voting ended, quorum met, majority voted For
Queued    → succeeded proposal waiting in Timelock
Executed  → proposal executed on-chain
Expired   → queued too long, execution window passed
```

---

## Contracts

### BDXGovernor.sol

Extends `Governor`, `GovernorSettings`, `GovernorCountingSimple`,
`GovernorVotes`, `GovernorVotesQuorumFraction`, `GovernorTimelockControl`
from OpenZeppelin Governor suite.

**Key Parameters:**
| Parameter | Value | Notes |
|---|---|---|
| Voting delay | 7200 blocks (~1 day) | After proposal, before voting opens |
| Voting period | 50400 blocks (~1 week) | How long voting is open |
| Proposal threshold | 10,000 BDX | Min tokens to propose |
| Quorum | 4% of total supply | Min participation for proposal to pass |
| Timelock delay | 172800 seconds (2 days) | Delay between queue and execution |

```solidity
// Propose an action
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) external returns (uint256 proposalId)

// Cast a vote
function castVote(uint256 proposalId, uint8 support)
    external returns (uint256 weight)
// support: 0 = Against, 1 = For, 2 = Abstain

// Cast a vote with a reason string
function castVoteWithReason(
    uint256 proposalId,
    uint8 support,
    string calldata reason
) external returns (uint256 weight)

// Queue a successful proposal to Timelock
function queue(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
) external returns (uint256 proposalId)

// Execute a queued proposal
function execute(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
) external payable returns (uint256 proposalId)

// Cancel a proposal (proposer only, while Pending)
function cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
) external returns (uint256 proposalId)

// Read proposal state
function state(uint256 proposalId)
    external view returns (ProposalState)

// Read vote counts
function proposalVotes(uint256 proposalId)
    external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)

// Read quorum for a past block
function quorum(uint256 blockNumber)
    external view returns (uint256)

// Read voting power at a past block
function getVotes(address account, uint256 blockNumber)
    external view returns (uint256)
```

### TimelockController.sol

Uses OZ `TimelockController` directly — no custom logic needed.
```
MIN_DELAY = 172800 seconds (2 days)
proposers = [BDXGovernor]
executors = [address(0)] = anyone can execute
```

---

## Token Voting Power

BDX voting power requires **delegation** — tokens must be delegated to an address
(including self) before they count toward votes. This is required by OZ `ERC20Votes`.

Token.sol must be upgraded to extend `ERC20Votes`:
```solidity
// Add to Token.sol
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract Token is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable {
    // _update must be overridden to satisfy ERC20Votes
    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }
}
```

### Delegation
```solidity
// Self-delegate (most users will do this)
bdxToken.delegate(msg.sender);

// Delegate to another address
bdxToken.delegate(delegatee);

// Read current delegate
bdxToken.delegates(holder);

// Read voting power at current block
bdxToken.getVotes(holder);
```

---

## Example Proposal: Update Lending LTV

```typescript
// Calldata to call setLTV(80) on Lending contract
const calldata = encodeFunctionData({
  abi: LENDING_ABI,
  functionName: 'setLTV',
  args: [80n],
});

await governor.propose(
  [lendingAddress],       // targets
  [0n],                   // values (ETH to send)
  [calldata],             // calldatas
  'Increase Lending LTV from 75% to 80%'
);
```

---

## Frontend: Governance Hooks

### `useGovernance()`
```typescript
export interface UseGovernanceResult {
  proposals: ProposalSummary[];
  votingPower: bigint;       // current user's votes
  delegatee: `0x${string}`; // who user has delegated to
  isLoading: boolean;
}

interface ProposalSummary {
  id: bigint;
  proposer: `0x${string}`;
  description: string;
  title: string;             // first line of description
  state: ProposalState;
  stateLabel: string;        // 'Active' | 'Succeeded' | etc.
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalVotes: bigint;
  forPct: number;
  quorumReached: boolean;
  startBlock: bigint;
  endBlock: bigint;
  eta: bigint;               // timelock eta (0 if not queued)
}
```

### `useProposal(proposalId)`
Full detail for a single proposal including:
- Decoded calldata (target/function/args)
- Voting history
- Current state + timeline

### `useGovernanceActions(address)`
```typescript
type GovernanceStep =
  | 'idle'
  | 'delegating'
  | 'proposing'
  | 'voting'
  | 'queuing'
  | 'executing'
  | 'success'
  | 'error';

export interface UseGovernanceActionsResult {
  step: GovernanceStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  delegate: (delegatee: `0x${string}`) => Promise<void>;
  selfDelegate: () => Promise<void>;
  castVote: (proposalId: bigint, support: 0 | 1 | 2) => Promise<void>;
  castVoteWithReason: (proposalId: bigint, support: 0 | 1 | 2, reason: string) => Promise<void>;
  queue: (proposalId: bigint) => Promise<void>;
  execute: (proposalId: bigint) => Promise<void>;
  reset: () => void;
}
```

---

## Frontend: UI

### Proposals List
- Status filter chips: All / Active / Succeeded / Defeated / Executed
- Each proposal card shows:
  - Title + proposer (shortened address)
  - Status badge (color-coded)
  - Vote bar: For % / Against % / Abstain %
  - Quorum indicator
  - Voting deadline or execution ETA

### Proposal Detail
- Full description with markdown support
- Decoded actions (what the proposal will do)
- Vote breakdown with counts
- Cast Vote buttons: For / Against / Abstain
- Queue / Execute buttons (if applicable)
- Voting history feed

### Delegation UI
- "Your voting power: X BDX"
- "Currently delegated to: [address or 'yourself']"
- "Delegate to yourself" quick action
- Custom delegatee input

### Create Proposal (Advanced)
- For power users only — accessible via "New Proposal" button
- Target address + function selector + arguments
- Description textarea (supports markdown)
- Preview + submit

---

## ENV Variables Needed
```
NEXT_PUBLIC_GOVERNOR_ADDRESS=
NEXT_PUBLIC_TIMELOCK_ADDRESS=
```

---

## Token.sol Upgrade Needed

Before governance can be deployed, Token.sol must be redeployed with `ERC20Votes` support.
This is a breaking change — LP tokens and Lending positions referencing the old token
address will continue to work, but the new token must be used for governance.

**Migration path:**
1. Deploy new Token.sol with ERC20Votes
2. Users migrate by swapping old BDX for new BDX (1:1)
3. Old contract is deprecated (owner minting disabled)

---

## Testing Plan

- `testPropose` — create a proposal, check state = Pending
- `testVotingDelay` — cannot vote during delay
- `testCastVote` — vote For, check forVotes increases
- `testQuorumNotMet` — proposal Defeated if participation < 4%
- `testQuorumMet` — proposal Succeeded if quorum + majority For
- `testQueue` — queue succeeded proposal to Timelock
- `testExecute` — execute after timelock delay
- `testTimelockEnforced` — cannot execute before timelock expires
- `testDelegation` — votes only count after delegation
- `testProposalThreshold` — revert if proposer has < threshold tokens
