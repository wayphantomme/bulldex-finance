// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/WETH.sol";
import "../src/Token.sol";
import "../src/PoolFactory.sol";
import "../src/Pool.sol";

/// @title  DeployWETHPool — Deploy WETH and create BDX/WETH pool
/// @notice Run after Deploy.s.sol. Needs PRIVATE_KEY + NEXT_PUBLIC_TOKEN_ADDRESS
///         + NEXT_PUBLIC_FACTORY_ADDRESS in .env.
contract DeployWETHPool is Script {

    uint256 constant SEED_BDX  = 1_000_000 ether;
    uint256 constant SEED_WETH = 0.1 ether;  // 1 ETH = 10,000,000 BDX at this ratio

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("ETH balance:", deployer.balance / 1e18, "ETH");

        vm.startBroadcast(deployerKey);

        address wethAddr = _deployWETH(deployer);
        address poolAddr = _createPool(wethAddr);
        _seedPool(wethAddr, poolAddr, deployer);

        vm.stopBroadcast();

        _printSummary(wethAddr, poolAddr);
    }

    function _deployWETH(address deployer) internal returns (address wethAddr) {
        WETH weth = new WETH();
        weth.deposit{value: SEED_WETH}();
        console.log("[1/3] WETH deployed and funded:", address(weth));
        (deployer); // suppress unused warning
        return address(weth);
    }

    function _createPool(address wethAddr) internal returns (address poolAddr) {
        address bdxAddress     = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        address factoryAddress = vm.envAddress("NEXT_PUBLIC_FACTORY_ADDRESS");
        PoolFactory factory    = PoolFactory(factoryAddress);
        poolAddr = factory.createPool(bdxAddress, wethAddr);
        console.log("[2/3] BDX/WETH Pool created:", poolAddr);
    }

    function _seedPool(address wethAddr, address poolAddr, address deployer) internal {
        address bdxAddress = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        Token(bdxAddress).approve(poolAddr, SEED_BDX);
        WETH(payable(wethAddr)).approve(poolAddr, SEED_WETH);
        Pool(poolAddr).addLiquidity(SEED_BDX, SEED_WETH, 0, 0, deployer);
        console.log("[3/3] Pool seeded: 1M BDX + 0.5 WETH");
    }

    function _printSummary(address wethAddr, address poolAddr) internal view {
        console.log("\n===========================================");
        console.log("WETH POOL DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("WETH:          ", wethAddr);
        console.log("BDX/WETH Pool: ", poolAddr);
        console.log("\nAdd to frontend/.env.local:");
        console.log("NEXT_PUBLIC_WETH_ADDRESS=", wethAddr);
        console.log("NEXT_PUBLIC_POOL_BDX_WETH=", poolAddr);
        console.log("\nInitial price: 1 WETH = 10,000,000 BDX");
    }
}
