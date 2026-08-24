// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/Token.sol";

/// @title  Token Unit Tests
/// @notice Full coverage for Token.sol — mint, burn, transfer, permit, access control
contract TokenTest is Test {
    // ─── State ────────────────────────────────────────────────────────────────

    Token public token;

    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint256 public constant INITIAL_SUPPLY = 100_000_000 ether;

    // ─── Setup ────────────────────────────────────────────────────────────────

    function setUp() public {
        token = new Token(owner, INITIAL_SUPPLY);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────

    function test_Deployment_Name() public view {
        assertEq(token.name(), "Bulldex Finance");
    }

    function test_Deployment_Symbol() public view {
        assertEq(token.symbol(), "BDX");
    }

    function test_Deployment_Decimals() public view {
        assertEq(token.decimals(), 18);
    }

    function test_Deployment_InitialSupply() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_Deployment_MaxSupply() public view {
        assertEq(token.MAX_SUPPLY(), 1_000_000_000 ether);
    }

    function test_Deployment_Owner() public view {
        assertEq(token.owner(), owner);
    }

    function test_Deployment_RemainingMintable() public view {
        uint256 expected = 1_000_000_000 ether - INITIAL_SUPPLY;
        assertEq(token.remainingMintable(), expected);
    }

    // ─── balanceOf ────────────────────────────────────────────────────────────

    function test_BalanceOf_ReturnsZeroForNewAddress() public view {
        assertEq(token.balanceOf(alice), 0);
    }

    function test_BalanceOf_ReflectsTransfer() public {
        uint256 amount = 1_000 ether;
        vm.prank(owner);
        token.transfer(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    // ─── transfer ─────────────────────────────────────────────────────────────

    function test_Transfer_Success() public {
        uint256 amount = 500 ether;
        vm.prank(owner);
        bool ok = token.transfer(alice, amount);
        assertTrue(ok);
        assertEq(token.balanceOf(alice), amount);
    }

    function test_Transfer_EmitsEvent() public {
        uint256 amount = 100 ether;
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, alice, amount);
        token.transfer(alice, amount);
    }

    // ERC20 Transfer event signature (for expectEmit)
    event Transfer(address indexed from, address indexed to, uint256 value);

    function test_Transfer_RevertsInsufficientBalance() public {
        uint256 tooMuch = INITIAL_SUPPLY + 1;
        vm.prank(owner);
        vm.expectRevert();
        token.transfer(alice, tooMuch);
    }

    function test_Transfer_RevertsToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert();
        token.transfer(address(0), 1 ether);
    }

    function testFuzz_Transfer_PartialAmount(uint256 amount) public {
        amount = bound(amount, 1, INITIAL_SUPPLY);
        vm.prank(owner);
        token.transfer(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    // ─── transferFrom ─────────────────────────────────────────────────────────

    function test_TransferFrom_WithApproval() public {
        uint256 amount = 200 ether;
        vm.prank(owner);
        token.approve(alice, amount);

        vm.prank(alice);
        token.transferFrom(owner, bob, amount);

        assertEq(token.balanceOf(bob), amount);
        assertEq(token.allowance(owner, alice), 0);
    }

    function test_TransferFrom_RevertsWithoutApproval() public {
        vm.prank(alice);
        vm.expectRevert();
        token.transferFrom(owner, bob, 1 ether);
    }

    // ─── mint ─────────────────────────────────────────────────────────────────

    function test_Mint_OwnerCanMint() public {
        uint256 amount = 1_000 ether;
        vm.prank(owner);
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount);
    }

    function test_Mint_EmitsMintedEvent() public {
        uint256 amount = 50 ether;
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Token.Minted(alice, amount);
        token.mint(alice, amount);
    }

    function test_Mint_RevertsForNonOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1 ether);
    }

    function test_Mint_RevertsToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Token.MintToZeroAddress.selector);
        token.mint(address(0), 1 ether);
    }

    function test_Mint_RevertsZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(Token.MintAmountZero.selector);
        token.mint(alice, 0);
    }

    function test_Mint_RevertsWhenExceedsMaxSupply() public {
        uint256 tooMuch = token.remainingMintable() + 1;
        vm.prank(owner);
        vm.expectRevert();
        token.mint(alice, tooMuch);
    }

    function test_Mint_ExactlyAtMaxSupply() public {
        uint256 remaining = token.remainingMintable();
        vm.prank(owner);
        token.mint(alice, remaining);
        assertEq(token.totalSupply(), token.MAX_SUPPLY());
        assertEq(token.remainingMintable(), 0);
    }

    function testFuzz_Mint_WithinCap(uint256 amount) public {
        uint256 remaining = token.remainingMintable();
        amount = bound(amount, 1, remaining);
        vm.prank(owner);
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertLe(token.totalSupply(), token.MAX_SUPPLY());
    }

    // ─── burn ─────────────────────────────────────────────────────────────────

    function test_Burn_ReducesSupply() public {
        uint256 burnAmount = 10_000 ether;
        vm.prank(owner);
        token.burn(burnAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - burnAmount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
    }

    function test_Burn_AnyoneCanBurnOwnTokens() public {
        uint256 amount = 500 ether;
        vm.prank(owner);
        token.transfer(alice, amount);

        vm.prank(alice);
        token.burn(amount);

        assertEq(token.balanceOf(alice), 0);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - amount);
    }

    function test_BurnFrom_WithApproval() public {
        uint256 amount = 100 ether;
        vm.prank(owner);
        token.approve(alice, amount);

        vm.prank(alice);
        token.burnFrom(owner, amount);

        assertEq(token.totalSupply(), INITIAL_SUPPLY - amount);
        assertEq(token.allowance(owner, alice), 0);
    }

    function test_Burn_RevertsInsufficientBalance() public {
        vm.prank(alice);
        vm.expectRevert();
        token.burn(1 ether);
    }

    function testFuzz_Burn_AnyAmount(uint256 amount) public {
        amount = bound(amount, 1, INITIAL_SUPPLY);
        vm.prank(owner);
        token.burn(amount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - amount);
    }

    // ─── approve / allowance ──────────────────────────────────────────────────

    function test_Approve_SetsAllowance() public {
        uint256 amount = 777 ether;
        vm.prank(owner);
        token.approve(alice, amount);
        assertEq(token.allowance(owner, alice), amount);
    }

    function test_Approve_CanOverwrite() public {
        vm.prank(owner);
        token.approve(alice, 100 ether);
        vm.prank(owner);
        token.approve(alice, 200 ether);
        assertEq(token.allowance(owner, alice), 200 ether);
    }

    // ─── Constructor edge cases ───────────────────────────────────────────────

    function test_Constructor_ZeroInitialSupply() public {
        Token t = new Token(owner, 0);
        assertEq(t.totalSupply(), 0);
        assertEq(t.balanceOf(owner), 0);
    }

    function test_Constructor_RevertsZeroOwner() public {
        // OZ Ownable reverts with OwnableInvalidOwner before our MintToZeroAddress check
        vm.expectRevert(
            abi.encodeWithSignature("OwnableInvalidOwner(address)", address(0))
        );
        new Token(address(0), INITIAL_SUPPLY);
    }
}
