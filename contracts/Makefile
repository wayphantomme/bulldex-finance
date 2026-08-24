# Bulldex Finance — Foundry Makefile
-include .env

.PHONY: all build test test-gas coverage clean deploy verify fmt lint

# ─── Build ────────────────────────────────────────────────────────────────────

all: build

build:
	forge build

clean:
	forge clean

fmt:
	forge fmt

lint:
	forge fmt --check

# ─── Testing ──────────────────────────────────────────────────────────────────

test:
	forge test -vvv

test-gas:
	forge test --gas-report

test-verbose:
	forge test -vvvv

coverage:
	forge coverage --report lcov

test-fuzz:
	FOUNDRY_PROFILE=ci forge test --fuzz-runs 10000

# ─── Deployment ───────────────────────────────────────────────────────────────

deploy-sepolia:
	@echo "Deploying to Sepolia..."
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_KEY) \
		-vvv

deploy-dry:
	@echo "Dry run (no broadcast)..."
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		-vvv

# ─── Verification ─────────────────────────────────────────────────────────────

verify:
	@echo "Usage: make verify-contract CONTRACT=Token ADDRESS=0x..."
	forge verify-contract $(ADDRESS) $(CONTRACT) \
		--chain-id 11155111 \
		--etherscan-api-key $(ETHERSCAN_KEY)

# ─── Utilities ────────────────────────────────────────────────────────────────

snapshot:
	forge snapshot

size:
	forge build --sizes

install:
	forge install foundry-rs/forge-std --no-commit
	forge install OpenZeppelin/openzeppelin-contracts --no-commit
