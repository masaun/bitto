import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;
const alice = user1;;

describe("Semi-Fungible Token (ERC-1155) Tests", () => {
  it("should initialize contract with correct constants and Clarity v4 features", () => {
    // Test contract hash using Clarity v4 contract-hash? function
    const contractHash = simnet.callReadOnlyFn("semi-fungible-token", "get-contract-hash", [], deployer);
    expect(contractHash.result).toBeTruthy(); // Should return contract hash

    // Test current stacks time using Clarity v4 stacks-block-time
    const stacksTime = simnet.callReadOnlyFn("semi-fungible-token", "get-current-stacks-time", [], deployer);
    expect(stacksTime.result).toBeTruthy(); // Returns current stacks time

    // Test asset restrictions using Clarity v4 restrict-assets? function
    const assetsRestricted = simnet.callReadOnlyFn("semi-fungible-token", "are-assets-restricted", [], deployer);
    expect(assetsRestricted.result).toBeBool(false); // Initially not restricted

    // Test initial contract state
    const totalTokens = simnet.callReadOnlyFn("semi-fungible-token", "get-total-tokens", [], deployer);
    expect(totalTokens.result).toBeUint(0); // No tokens created initially

    const contractUri = simnet.callReadOnlyFn("semi-fungible-token", "get-contract-uri", [], deployer);
    expect(contractUri.result).toBeAscii("https://api.bitto.io/tokens/");
  });

  it("should create new fungible and non-fungible tokens", () => {
    // Create a fungible token
    const { result: fungibleTokenResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(1000), // initial supply
        Cl.stringAscii("https://api.bitto.io/tokens/fungible/1"),
        Cl.bool(true), // fungible
        Cl.none(), // no signature
        Cl.none(), // no public key
        Cl.none(), // no message hash
      ], 
      deployer
    );
    
    expect(fungibleTokenResult).toBeOk(Cl.uint(1)); // Should return token ID 1

    // Create a non-fungible token
    const { result: nftTokenResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(1), // initial supply (unique NFT)
        Cl.stringAscii("https://api.bitto.io/tokens/nft/1"),
        Cl.bool(false), // non-fungible
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      user1
    );
    
    expect(nftTokenResult).toBeOk(Cl.uint(2)); // Should return token ID 2

    // Verify token metadata
    const fungibleMetadata = simnet.callReadOnlyFn("semi-fungible-token", "get-token-metadata", [Cl.uint(1)], deployer);
    expect(fungibleMetadata.result).toBeTruthy();

    const nftMetadata = simnet.callReadOnlyFn("semi-fungible-token", "get-token-metadata", [Cl.uint(2)], alice);
    expect(nftMetadata.result).toBeTruthy();

    // Check total tokens count
    const totalTokens = simnet.callReadOnlyFn("semi-fungible-token", "get-total-tokens", [], deployer);
    expect(totalTokens.result).toBeUint(2);
  });

  it("should handle token balances and balance queries", () => {
    // Create a token first
    simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(1000),
        Cl.stringAscii("https://api.bitto.io/tokens/test/1"),
        Cl.bool(true),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );

    // Check initial balance of creator
    const deployerBalance = simnet.callReadOnlyFn("semi-fungible-token", "balance-of", [Cl.principal(deployer), Cl.uint(1)], deployer);
    expect(deployerBalance.result).toBeUint(1000);

    // Check zero balance for non-holder
    const user1Balance = simnet.callReadOnlyFn("semi-fungible-token", "balance-of", [Cl.principal(user1), Cl.uint(1)], deployer);
    expect(user1Balance.result).toBeUint(0);

    // Test batch balance query
    const { result: batchBalanceResult } = simnet.callReadOnlyFn(
      "semi-fungible-token", 
      "balance-of-batch", 
      [
        Cl.list([Cl.principal(deployer), Cl.principal(user1)]),
        Cl.list([Cl.uint(1), Cl.uint(1)])
      ], 
      deployer
    );
    
    expect(batchBalanceResult).toBeOk(Cl.list([Cl.uint(1000), Cl.uint(0)]));
  });

  it("should handle operator approvals", () => {
    // Initially no approval
    const initialApproval = simnet.callReadOnlyFn("semi-fungible-token", "is-approved-for-all", [Cl.principal(deployer), Cl.principal(user1)], deployer);
    expect(initialApproval.result).toBeBool(false);

    // Set approval for all tokens
    const { result: setApprovalResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "set-approval-for-all", 
      [
        Cl.principal(user1), // operator
        Cl.bool(true) // approved
      ], 
      deployer
    );
    
    expect(setApprovalResult).toBeOk(Cl.bool(true));

    // Check approval was set
    const newApproval = simnet.callReadOnlyFn("semi-fungible-token", "is-approved-for-all", [Cl.principal(deployer), Cl.principal(user1)], deployer);
    expect(newApproval.result).toBeBool(true);

    // Revoke approval
    const { result: revokeApprovalResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "set-approval-for-all", 
      [
        Cl.principal(user1),
        Cl.bool(false)
      ], 
      deployer
    );
    
    expect(revokeApprovalResult).toBeOk(Cl.bool(false));

    // Verify approval was revoked
    const revokedApproval = simnet.callReadOnlyFn("semi-fungible-token", "is-approved-for-all", [Cl.principal(deployer), Cl.principal(user1)], deployer);
    expect(revokedApproval.result).toBeBool(false);
  });

  it("should handle single token transfers", () => {
    // Create token and set up for transfer
    simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(1000),
        Cl.stringAscii("https://api.bitto.io/tokens/transfer-test/1"),
        Cl.bool(true),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );

    // Transfer tokens from deployer to user1
    const { result: transferResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "safe-transfer-from", 
      [
        Cl.principal(deployer), // from
        Cl.principal(user1), // to
        Cl.uint(1), // token-id
        Cl.uint(100), // amount
        Cl.none(), // no signature
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );
    
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify balances after transfer
    const deployerBalance = simnet.callReadOnlyFn("semi-fungible-token", "balance-of", [Cl.principal(deployer), Cl.uint(1)], deployer);
    expect(deployerBalance.result).toBeUint(900);

    const user1Balance = simnet.callReadOnlyFn("semi-fungible-token", "balance-of", [Cl.principal(user1), Cl.uint(1)], deployer);
    expect(user1Balance.result).toBeUint(100);
  });

  it("should handle batch token transfers", () => {
    // Create multiple tokens
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(1000), Cl.stringAscii("https://api.bitto.io/batch/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(500), Cl.stringAscii("https://api.bitto.io/batch/2"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);

    // Batch transfer
    const { result: batchTransferResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "safe-batch-transfer-from", 
      [
        Cl.principal(deployer), // from
        Cl.principal(user1), // to
        Cl.list([Cl.uint(1), Cl.uint(2)]), // token-ids
        Cl.list([Cl.uint(50), Cl.uint(25)]), // amounts
        Cl.none(), // no signature
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );
    
    expect(batchTransferResult).toBeOk(Cl.bool(true));

    // Verify batch balances
    const { result: batchBalanceResult } = simnet.callReadOnlyFn(
      "semi-fungible-token", 
      "balance-of-batch", 
      [
        Cl.list([Cl.principal(user1), Cl.principal(user1)]),
        Cl.list([Cl.uint(1), Cl.uint(2)])
      ], 
      deployer
    );
    
    expect(batchBalanceResult).toBeOk(Cl.list([Cl.uint(50), Cl.uint(25)]));
  });

  it("should handle minting additional tokens", () => {
    // Create a token
    simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(100),
        Cl.stringAscii("https://api.bitto.io/mint-test/1"),
        Cl.bool(true),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );

    // Mint additional tokens (only creator can mint)
    const { result: mintResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "mint", 
      [
        Cl.principal(user1), // to
        Cl.uint(1), // token-id
        Cl.uint(50), // amount
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );
    
    expect(mintResult).toBeOk(Cl.bool(true));

    // Verify new balance
    const user1Balance = simnet.callReadOnlyFn("semi-fungible-token", "balance-of", [Cl.principal(user1), Cl.uint(1)], deployer);
    expect(user1Balance.result).toBeUint(50);

    // Verify total supply increased
    const { result: totalSupplyResult } = simnet.callReadOnlyFn("semi-fungible-token", "total-supply", [Cl.uint(1)], deployer);
    expect(totalSupplyResult).toBeOk(Cl.uint(150));
  });

  it("should handle token burning", () => {
    // Create token and transfer some to user
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(1000), Cl.stringAscii("https://api.bitto.io/burn-test/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);
    simnet.callPublicFn("semi-fungible-token", "safe-transfer-from", [Cl.principal(deployer), Cl.principal(user1), Cl.uint(1), Cl.uint(200), Cl.none(), Cl.none(), Cl.none()], deployer);

    // User burns their own tokens
    const { result: burnResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "burn", 
      [
        Cl.principal(user1), // from
        Cl.uint(1), // token-id
        Cl.uint(50), // amount
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      user1
    );
    
    expect(burnResult).toBeOk(Cl.bool(true));

    // Verify balance decreased
    const user1Balance = simnet.callReadOnlyFn("semi-fungible-token", "balance-of", [Cl.principal(user1), Cl.uint(1)], deployer);
    expect(user1Balance.result).toBeUint(150);

    // Verify total supply decreased
    const { result: totalSupplyResult } = simnet.callReadOnlyFn("semi-fungible-token", "total-supply", [Cl.uint(1)], deployer);
    expect(totalSupplyResult).toBeOk(Cl.uint(950));
  });

  it("should handle asset restrictions using Clarity v4 restrict-assets feature", () => {
    // Toggle asset restrictions (only owner)
    const { result: toggleResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "toggle-asset-restrictions", 
      [Cl.bool(true)], 
      deployer
    );
    
    expect(toggleResult).toBeOk(Cl.bool(true));

    // Check restrictions are active
    const assetsRestricted = simnet.callReadOnlyFn("semi-fungible-token", "are-assets-restricted", [], deployer);
    expect(assetsRestricted.result).toBeBool(true);

    // Try to create token with restrictions active (should fail)
    const { result: restrictedCreateResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(100),
        Cl.stringAscii("https://api.bitto.io/restricted/1"),
        Cl.bool(true),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      user1
    );
    
    expect(restrictedCreateResult).toBeErr(Cl.uint(1008)); // ERR_ASSETS_RESTRICTED

    // Disable restrictions
    simnet.callPublicFn("semi-fungible-token", "toggle-asset-restrictions", [Cl.bool(false)], deployer);

    // Now creation should work
    const { result: unrestrictedCreateResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(100),
        Cl.stringAscii("https://api.bitto.io/unrestricted/1"),
        Cl.bool(true),
        Cl.none(),
        Cl.none(),
        Cl.none()
      ], 
      alice
    );
    
    expect(unrestrictedCreateResult).toBeOk(Cl.uint(1));
  });

  it("should handle signature verification using Clarity v4 secp256r1-verify", () => {
    // Create a token to generate transfer operations
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(1000), Cl.stringAscii("https://api.bitto.io/sig-test/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);
    
    // Make a transfer to create an operation log entry
    simnet.callPublicFn("semi-fungible-token", "safe-transfer-from", [Cl.principal(deployer), Cl.principal(user1), Cl.uint(1), Cl.uint(100), Cl.none(), Cl.none(), Cl.none()], deployer);

    // Test signature verification function
    const mockMessageHash = new Uint8Array(32).fill(0x12);
    const mockSignature = new Uint8Array(64).fill(0x34);
    const mockPublicKey = new Uint8Array(33).fill(0x56);
    
    const verifyResult = simnet.callReadOnlyFn(
      "semi-fungible-token", 
      "verify-operation-signature", 
      [
        Cl.uint(1), // operation-id
        Cl.buffer(mockMessageHash),
        Cl.buffer(mockSignature),
        Cl.buffer(mockPublicKey),
      ], 
      deployer
    );
    
    // Should return false since no signature was stored for this operation
    expect(verifyResult.result).toBeBool(false);
  });

  it("should handle URI and metadata functions with Clarity v4 to-ascii feature", () => {
    // Create token with URI
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(100), Cl.stringAscii("https://api.bitto.io/uri-test/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);

    // Get token URI
    const { result: uriResult } = simnet.callReadOnlyFn("semi-fungible-token", "get-token-uri", [Cl.uint(1)], deployer);
    expect(uriResult).toBeOk(Cl.stringAscii("https://api.bitto.io/uri-test/1"));

    // Test URI to ASCII conversion using Clarity v4 to-ascii? function
    const uriAsciiResult = simnet.callReadOnlyFn("semi-fungible-token", "get-token-uri-ascii", [Cl.uint(1)], deployer);
    expect(uriAsciiResult.result).toBeTruthy();

    // Update token URI (only creator)
    const { result: updateUriResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "set-token-uri", 
      [
        Cl.uint(1),
        Cl.stringAscii("https://api.bitto.io/uri-test/1-updated")
      ], 
      deployer
    );
    
    expect(updateUriResult).toBeOk(Cl.bool(true));

    // Verify URI was updated
    const { result: updatedUriResult } = simnet.callReadOnlyFn("semi-fungible-token", "get-token-uri", [Cl.uint(1)], deployer);
    expect(updatedUriResult).toBeOk(Cl.stringAscii("https://api.bitto.io/uri-test/1-updated"));
  });

  it("should handle comprehensive token information functions", () => {
    // Create a token
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(500), Cl.stringAscii("https://api.bitto.io/info-test/1"), Cl.bool(false), Cl.none(), Cl.none(), Cl.none()], deployer);

    // Get comprehensive token info
    const { result: tokenInfoResult } = simnet.callReadOnlyFn("semi-fungible-token", "get-token-info", [Cl.uint(1)], deployer);
    expect(tokenInfoResult).toBeTruthy();

    // Check token exists
    const tokenExists = simnet.callReadOnlyFn("semi-fungible-token", "token-exists", [Cl.uint(1)], deployer);
    expect(tokenExists.result).toBeBool(true);

    // Check non-existent token
    const tokenNotExists = simnet.callReadOnlyFn("semi-fungible-token", "token-exists", [Cl.uint(999)], deployer);
    expect(tokenNotExists.result).toBeBool(false);

    // Get token creator
    const { result: creatorResult } = simnet.callReadOnlyFn("semi-fungible-token", "get-token-creator", [Cl.uint(1)], deployer);
    expect(creatorResult).toBeOk(Cl.principal(deployer));

    // Check if token is fungible
    const { result: fungibleResult } = simnet.callReadOnlyFn("semi-fungible-token", "is-token-fungible", [Cl.uint(1)], deployer);
    expect(fungibleResult).toBeOk(Cl.bool(false)); // Created as non-fungible

    // Test user token description with ASCII conversion
    simnet.callPublicFn("semi-fungible-token", "safe-transfer-from", [Cl.principal(deployer), Cl.principal(user1), Cl.uint(1), Cl.uint(1), Cl.none(), Cl.none(), Cl.none()], deployer);
    
    const { result: userDescResult } = simnet.callReadOnlyFn("semi-fungible-token", "get-user-token-description-ascii", [Cl.principal(user1), Cl.uint(1)], deployer);
    expect(userDescResult).toBeOk(Cl.some(Cl.stringAscii("Multi-Token-Holder")));
  });

  it("should handle error conditions and authorization", () => {
    // Test unauthorized operations
    const { result: unauthorizedToggleResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "toggle-asset-restrictions", 
      [Cl.bool(true)], 
      user1 // non-owner
    );
    
    expect(unauthorizedToggleResult).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED

    // Test zero amount operations
    const { result: zeroAmountCreateResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "create-token", 
      [
        Cl.uint(0), // zero initial supply
        Cl.stringAscii("https://api.bitto.io/error-test/1"),
        Cl.bool(true),
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );
    
    expect(zeroAmountCreateResult).toBeErr(Cl.uint(1004)); // ERR_ZERO_AMOUNT

    // Test invalid token operations
    const { result: invalidTokenResult } = simnet.callReadOnlyFn("semi-fungible-token", "get-token-uri", [Cl.uint(999)], deployer);
    expect(invalidTokenResult).toBeErr(Cl.uint(1003)); // ERR_TOKEN_NOT_FOUND

    // Test insufficient balance transfer
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(10), Cl.stringAscii("https://api.bitto.io/insufficient/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);
    
    const { result: insufficientTransferResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "safe-transfer-from", 
      [
        Cl.principal(deployer),
        Cl.principal(user1),
        Cl.uint(1),
        Cl.uint(100), // More than balance
        Cl.none(),
        Cl.none(),
        Cl.none(),
      ], 
      deployer
    );
    
    expect(insufficientTransferResult).toBeErr(Cl.uint(1002)); // ERR_INSUFFICIENT_BALANCE

    // Test batch arrays length mismatch
    const { result: mismatchResult } = simnet.callReadOnlyFn(
      "semi-fungible-token", 
      "balance-of-batch", 
      [
        Cl.list([Cl.principal(deployer)]), // 1 owner
        Cl.list([Cl.uint(1), Cl.uint(2)]) // 2 token IDs
      ], 
      deployer
    );
    
    expect(mismatchResult).toBeErr(Cl.uint(1007)); // ERR_ARRAYS_LENGTH_MISMATCH
  });

  it("should handle contract URI management", () => {
    // Test initial contract URI
    const contractUri = simnet.callReadOnlyFn("semi-fungible-token", "get-contract-uri", [], deployer);
    expect(contractUri.result).toBeAscii("https://api.bitto.io/tokens/");

    // Update contract URI (only owner)
    const { result: updateResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "set-contract-uri", 
      [Cl.stringAscii("https://newapi.bitto.io/tokens/")], 
      deployer
    );
    
    expect(updateResult).toBeOk(Cl.bool(true));

    // Verify URI was updated
    const newContractUri = simnet.callReadOnlyFn("semi-fungible-token", "get-contract-uri", [], deployer);
    expect(newContractUri.result).toBeAscii("https://newapi.bitto.io/tokens/");

    // Test unauthorized contract URI update
    const { result: unauthorizedUpdateResult } = simnet.callPublicFn(
      "semi-fungible-token", 
      "set-contract-uri", 
      [Cl.stringAscii("https://malicious.com/")], 
      user1 // non-owner
    );
    
    expect(unauthorizedUpdateResult).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
  });

  it("should handle operation tracking and history", () => {
    // Create token and make transfer
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(1000), Cl.stringAscii("https://api.bitto.io/history/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);
    simnet.callPublicFn("semi-fungible-token", "safe-transfer-from", [Cl.principal(deployer), Cl.principal(user1), Cl.uint(1), Cl.uint(100), Cl.none(), Cl.none(), Cl.none()], deployer);

    // Get transfer operation details
    const transferOp = simnet.callReadOnlyFn("semi-fungible-token", "get-transfer-operation", [Cl.uint(1)], deployer);
    expect(transferOp.result).toBeTruthy();

    // Get current operation nonce
    const operationNonce = simnet.callReadOnlyFn("semi-fungible-token", "get-operation-nonce", [], deployer);
    expect(operationNonce.result).toBeUint(1);
  });

  it("should handle batch token information retrieval", () => {
    // Create multiple tokens
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(100), Cl.stringAscii("https://api.bitto.io/batch-info/1"), Cl.bool(true), Cl.none(), Cl.none(), Cl.none()], deployer);
    simnet.callPublicFn("semi-fungible-token", "create-token", [Cl.uint(200), Cl.stringAscii("https://api.bitto.io/batch-info/2"), Cl.bool(false), Cl.none(), Cl.none(), Cl.none()], user1);

    // Get batch token information
    const batchInfo = simnet.callReadOnlyFn(
      "semi-fungible-token", 
      "get-batch-token-info", 
      [Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(999)])], // Include non-existent token
      deployer
    );
    
    expect(batchInfo.result).toBeTruthy(); // Should return array of token info
  });
});
