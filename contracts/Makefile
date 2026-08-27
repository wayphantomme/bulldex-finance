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
	@echo ""
	@echo "⚠️  WARNING: deploy-sepolia deploys NEW contracts with NEW addresses!"
	@echo "   This should only be run ONCE on initial setup."
	@echo "   Re-running will create duplicate contracts and break the app."
	@echo ""
	@echo "   Canonical contracts are already live on Sepolia:"
	@echo "   BDX:     0x193d18048b343983971bfc50893a720e97322ae5"
	@echo "   Factory: 0x90e1189242272ad1700a5ad0e1c5001676a23984"
	@echo "   Lending: 0x13aCAB0d760E54Fb9Ab73ff0bF39CAc7D74FD5cF"
	@echo ""
	@echo "   Use deploy-lending for Lending, deploy-weth-pool for new pools."
	@echo "   Press Ctrl+C to abort. Press Enter to continue anyway (DANGEROUS)."
	@read confirm
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--skip-simulation \
		--gas-price 5000000000 \
		--timeout 90 \
		-vvv

deploy-lending:
	@echo "Deploying Lending contract to Sepolia..."
	forge script script/DeployLending.s.sol:DeployLending \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--skip-simulation \
		--gas-price 5000000000 \
		--timeout 90 \
		-vvv

reseed-pool:
	@echo "Reseeding BDX/MUSDC pool..."
	forge script script/ReseedPool.s.sol:ReseedPool \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--skip-simulation \
		--gas-price 5000000000 \
		--timeout 90 \
		-vvv

deploy-weth-pool:
	@echo "Deploying WETH + BDX/WETH pool to Sepolia..."
	forge script script/DeployWETHPool.s.sol:DeployWETHPool \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--skip-simulation \
		--gas-price 5000000000 \
		--timeout 90 \
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
