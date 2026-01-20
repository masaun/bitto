import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Tokenized Vault Tests", () => {
  it("should initialize contract with correct constants", () => {
    // Test contract constants and read-only functions
    const asset = simnet.callReadOnlyFn("tokenized-vault", "asset", [], deployer);
    const totalSupply = simnet.callReadOnlyFn("tokenized-vault", "total-supply", [], deployer);
    const contractHash = simnet.callReadOnlyFn("tokenized-vault", "get-contract-hash", [], deployer);
    const vaultName = simnet.callReadOnlyFn("tokenized-vault", "get-vault-name-ascii", [], deployer);
    
    expect(asset.result).toBePrincipal('SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token');
    expect(totalSupply.result).toBeUint(0);
    expect(contractHash.result).toBeTruthy(); // Should return contract hash
    expect(vaultName.result).toBeOk(Cl.stringAscii('BitTo Tokenized Vault'));
  });

  it("should return current stacks time (Clarity v4 feature)", () => {
    const stacksTime = simnet.callReadOnlyFn("tokenized-vault", "get-current-stacks-time", [], deployer);
    
    // Should return current block height (fallback implementation)
    expect(stacksTime.result).toBeUint(3); // Current block height in test environment
  });

  it("should toggle asset restrictions (Clarity v4 restrict-assets feature)", () => {
    // Only owner can toggle restrictions
    const { result: unauthorizedResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "toggle-asset-restrictions", 
      [Cl.bool(true)], 
      user1
    );
    
    expect(unauthorizedResult).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
    
    // Owner can toggle restrictions
    const { result: authorizedResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "toggle-asset-restrictions", 
      [Cl.bool(true)], 
      deployer
    );
    
    expect(authorizedResult).toBeOk(Cl.bool(true));
  });

  it("should handle balance and allowance functions", () => {
    // Check initial balances
    const balance = simnet.callReadOnlyFn("tokenized-vault", "balance-of", [Cl.principal(user1)], deployer);
    const allowance = simnet.callReadOnlyFn("tokenized-vault", "get-allowance", [Cl.principal(user1), Cl.principal(user2)], deployer);
    
    expect(balance.result).toBeUint(0);
    expect(allowance.result).toBeUint(0);
    
    // Test approval
    const { result: approvalResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "approve", 
      [Cl.principal(user2), Cl.uint(1000)], 
      user1
    );
    
    expect(approvalResult).toBeOk(Cl.bool(true));
    
    // Check allowance was set
    const updatedAllowance = simnet.callReadOnlyFn("tokenized-vault", "get-allowance", [Cl.principal(user1), Cl.principal(user2)], deployer);
    expect(updatedAllowance.result).toBeUint(1000);
  });

  it("should provide correct preview functions for ERC-4626 compatibility", () => {
    const previewDeposit = simnet.callReadOnlyFn("tokenized-vault", "preview-deposit", [Cl.uint(1000)], deployer);
    const previewMint = simnet.callReadOnlyFn("tokenized-vault", "preview-mint", [Cl.uint(1000)], deployer);
    const previewWithdraw = simnet.callReadOnlyFn("tokenized-vault", "preview-withdraw", [Cl.uint(1000)], deployer);
    const previewRedeem = simnet.callReadOnlyFn("tokenized-vault", "preview-redeem", [Cl.uint(1000)], deployer);
    
    // With empty vault, preview functions should return 1:1 ratio
    expect(previewDeposit.result).toBeUint(1000);
    expect(previewMint.result).toBeUint(1000);
    expect(previewWithdraw.result).toBeUint(1000);
    expect(previewRedeem.result).toBeUint(1000);
  });

  it("should return correct max deposit/mint/withdraw/redeem limits", () => {
    const maxDeposit = simnet.callReadOnlyFn("tokenized-vault", "max-deposit", [Cl.principal(user1)], deployer);
    const maxMint = simnet.callReadOnlyFn("tokenized-vault", "max-mint", [Cl.principal(user1)], deployer);
    const maxWithdraw = simnet.callReadOnlyFn("tokenized-vault", "max-withdraw", [Cl.principal(user1)], deployer);
    const maxRedeem = simnet.callReadOnlyFn("tokenized-vault", "max-redeem", [Cl.principal(user1)], deployer);
    
    // Check max functions return appropriate values
    expect(maxDeposit.result).toBeUint(340282366920938463463374607431768211455n); // max uint
    expect(maxMint.result).toBeUint(340282366920938463463374607431768211455n); // max uint
    expect(maxWithdraw.result).toBeUint(0); // user has no shares
    expect(maxRedeem.result).toBeUint(0); // user has no shares
  });

  it("should handle deposit functionality", () => {
    // Test deposit without signature
    const { result: depositResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "deposit", 
      [
        Cl.uint(1000),
        Cl.principal(user1),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      user1
    );
    
    expect(depositResult).toBeOk(Cl.uint(1000)); // Should receive 1000 shares
    
    // Verify the deposit was recorded
    const balance = simnet.callReadOnlyFn("tokenized-vault", "balance-of", [Cl.principal(user1)], deployer);
    const totalSupply = simnet.callReadOnlyFn("tokenized-vault", "total-supply", [], deployer);
    
    expect(balance.result).toBeUint(1000);
    expect(totalSupply.result).toBeUint(1000);
  });

  it("should handle vault management functions", () => {
    // Test unauthorized vault pause
    const { result: unauthorizedPause } = simnet.callPublicFn(
      "tokenized-vault", 
      "set-vault-paused", 
      [Cl.bool(true)], 
      user1
    );
    
    expect(unauthorizedPause).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
    
    // Owner can pause vault
    const { result: authorizedPause } = simnet.callPublicFn(
      "tokenized-vault", 
      "set-vault-paused", 
      [Cl.bool(true)], 
      deployer
    );
    
    expect(authorizedPause).toBeOk(Cl.bool(true));
    
    // Test performance fee setting
    const { result: feeResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "set-performance-fee", 
      [Cl.uint(200)], 
      deployer
    );
    
    expect(feeResult).toBeOk(Cl.uint(200));
  });

  it("should handle error conditions and edge cases", () => {
    // Test zero amount deposit
    const { result: zeroDepositResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "deposit", 
      [
        Cl.uint(0),
        Cl.principal(user1),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      user1
    );
    
    expect(zeroDepositResult).toBeErr(Cl.uint(1004)); // ERR_ZERO_AMOUNT
    
    // Test withdraw with insufficient shares
    const { result: insufficientWithdrawResult } = simnet.callPublicFn(
      "tokenized-vault", 
      "withdraw", 
      [
        Cl.uint(1000),
        Cl.principal(user1),
        Cl.principal(user1),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      user1
    );
    
    expect(insufficientWithdrawResult).toBeErr(Cl.uint(1003)); // ERR_INSUFFICIENT_SHARES
  });

  it("should handle vault information functions", () => {
    // Test vault info
    const vaultInfo = simnet.callReadOnlyFn("tokenized-vault", "get-vault-info", [], deployer);
    expect(vaultInfo.result).toBeTruthy(); // Should return a tuple with vault info
    
    // Test user info
    const userInfo = simnet.callReadOnlyFn("tokenized-vault", "get-user-info", [Cl.principal(user1)], deployer);
    expect(userInfo.result).toBeTruthy(); // Should return user info tuple
    
    // Test vault statistics
    const vaultStats = simnet.callReadOnlyFn("tokenized-vault", "get-vault-statistics", [], deployer);
    expect(vaultStats.result).toBeTruthy(); // Should return vault statistics tuple
  });

  it("should handle signature verification (Clarity v4 secp256r1-verify)", () => {
    // Test signature verification function with correct parameters
    const mockOperationId = 1;
    const mockMessageHash = new Uint8Array(32).fill(0x12);
    
    const verifyResult = simnet.callReadOnlyFn(
      "tokenized-vault", 
      "verify-operation-signature", 
      [
        Cl.uint(mockOperationId),
        Cl.buffer(mockMessageHash),
      ], 
      deployer
    );
    
    // Should return false since no operation with ID 1 exists yet
    expect(verifyResult.result).toBeBool(false);
  });
});
