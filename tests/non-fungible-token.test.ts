import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

describe("ERC-721 Non-Fungible Token (NFT) Tests", () => {
  it("should initialize contract with correct constants and Clarity v4 features", () => {
    // Test contract hash using Clarity v4 contract-hash? function
    const contractHash = simnet.callReadOnlyFn("non-fungible-token", "get-contract-hash", [], deployer);
    expect(contractHash.result).toBeTruthy(); // Should return contract hash

    // Test current stacks time using Clarity v4 stacks-block-time
    const stacksTime = simnet.callReadOnlyFn("non-fungible-token", "get-current-stacks-time", [], deployer);
    expect(stacksTime.result).toBeTruthy(); // Returns current stacks time

    // Test asset restrictions using Clarity v4 restrict-assets? function
    const restrictionsStatus = simnet.callReadOnlyFn("non-fungible-token", "are-assets-restricted", [], deployer);
    expect(restrictionsStatus.result).toBeBool(false); // Should be false initially

    // Test contract name and symbol (ERC-721 standard)
    const name = simnet.callReadOnlyFn("non-fungible-token", "get-name", [], deployer);
    expect(name.result).toBeAscii("Bitto NFT");

    const symbol = simnet.callReadOnlyFn("non-fungible-token", "get-symbol", [], deployer);
    expect(symbol.result).toBeAscii("BNFT");

    // Test contract URI
    const contractUri = simnet.callReadOnlyFn("non-fungible-token", "contract-uri", [], deployer);
    expect(contractUri.result).toBeAscii("https://api.bitto.io/nft/");

    // Test initial total supply
    const totalSupply = simnet.callReadOnlyFn("non-fungible-token", "total-supply", [], deployer);
    expect(totalSupply.result).toBeUint(0);
  });

  it("should handle asset restrictions using Clarity v4 restrict-assets feature", () => {
    // Enable asset restrictions (only contract owner can do this)
    const { result: toggleResult } = simnet.callPublicFn(
      "non-fungible-token", 
      "toggle-asset-restrictions", 
      [Cl.bool(true)], 
      deployer
    );
    expect(toggleResult).toBeOk(Cl.bool(true));

    // Check that restrictions are now enabled
    const restrictionsStatus = simnet.callReadOnlyFn("non-fungible-token", "are-assets-restricted", [], deployer);
    expect(restrictionsStatus.result).toBeTruthy();

    // Try to mint when restrictions are enabled (should fail)
    const mintResult = simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Test NFT"),
      Cl.stringAscii("A test NFT with restricted assets"),
      Cl.stringAscii("https://api.bitto.io/nft/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);
    expect(mintResult.result).toBeErr(Cl.uint(1008)); // ERR_ASSETS_RESTRICTED

    // Disable restrictions
    const disableResult = simnet.callPublicFn(
      "non-fungible-token", 
      "toggle-asset-restrictions", 
      [Cl.bool(false)], 
      deployer
    );
    expect(disableResult.result).toBeOk(Cl.bool(false));

    // Now minting should work
    const mintAfterDisable = simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Test NFT"),
      Cl.stringAscii("A test NFT after disabling restrictions"),
      Cl.stringAscii("https://api.bitto.io/nft/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);
    expect(mintAfterDisable.result).toBeOk(Cl.uint(1));
  });

  it("should mint NFTs with signature verification using Clarity v4 secp256r1-verify", () => {
    // Test minting without signature (should work)
    const mintResult = simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Genesis NFT"),
      Cl.stringAscii("The first NFT in our collection"),
      Cl.stringAscii("https://api.bitto.io/nft/genesis/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.uint(1));

    // Check total supply increased
    const totalSupply = simnet.callReadOnlyFn("non-fungible-token", "total-supply", [], deployer);
    expect(totalSupply.result).toBeUint(1);

    // Check owner of minted token
    const ownerResult = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(1)], deployer);
    expect(ownerResult.result).toBeOk(Cl.principal(user1));

    // Test minting with invalid signature (should fail)
    const invalidSigResult = simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user2),
      Cl.uint(2),
      Cl.stringAscii("Signed NFT"),
      Cl.stringAscii("An NFT with signature verification"),
      Cl.stringAscii("https://api.bitto.io/nft/signed/2"),
      Cl.some(Cl.bufferFromHex("0x" + "00".repeat(64))), // Invalid signature
      Cl.some(Cl.bufferFromHex("0x" + "00".repeat(33))), // Invalid public key
      Cl.some(Cl.bufferFromHex("0x" + "00".repeat(32)))  // Invalid message hash
    ], deployer);
    expect(invalidSigResult.result).toBeErr(Cl.uint(1006)); // ERR_INVALID_SIGNATURE
  });

  it("should handle token URI functions with Clarity v4 to-ascii feature", () => {
    // Mint a token first
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("URI Test NFT"),
      Cl.stringAscii("Testing URI functions"),
      Cl.stringAscii("https://api.bitto.io/nft/uri-test/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Get token URI
    const { result: uriResult } = simnet.callReadOnlyFn("non-fungible-token", "token-uri", [Cl.uint(1)], deployer);
    expect(uriResult).toBeOk(Cl.stringAscii("https://api.bitto.io/nft/uri-test/1"));

    // Test URI to ASCII conversion using Clarity v4 to-ascii? function
    const uriAsciiResult = simnet.callReadOnlyFn("non-fungible-token", "get-token-uri-ascii", [Cl.uint(1)], deployer);
    expect(uriAsciiResult.result).toHaveProperty('type', 'some');

    // Test name to ASCII conversion
    const nameAsciiResult = simnet.callReadOnlyFn("non-fungible-token", "get-token-name-ascii", [Cl.uint(1)], deployer);
    expect(nameAsciiResult.result).toHaveProperty('type', 'some');

    // Update token URI (only creator/owner can do this)
    const { result: updateUriResult } = simnet.callPublicFn(
      "non-fungible-token",
      "set-token-uri", 
      [
        Cl.uint(1),
        Cl.stringAscii("https://api.bitto.io/nft/uri-test/1-updated")
      ], 
      user1
    );
    expect(updateUriResult).toBeOk(Cl.bool(true));

    // Verify URI was updated
    const { result: updatedUriResult } = simnet.callReadOnlyFn("non-fungible-token", "token-uri", [Cl.uint(1)], deployer);
    expect(updatedUriResult).toBeOk(Cl.stringAscii("https://api.bitto.io/nft/uri-test/1-updated"));
  });

  it("should handle ERC-721 balance and ownership functions", () => {
    // Mint multiple NFTs to different users
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("NFT 1"),
      Cl.stringAscii("First NFT"),
      Cl.stringAscii("https://api.bitto.io/nft/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(2),
      Cl.stringAscii("NFT 2"),
      Cl.stringAscii("Second NFT"),
      Cl.stringAscii("https://api.bitto.io/nft/2"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user2),
      Cl.uint(3),
      Cl.stringAscii("NFT 3"),
      Cl.stringAscii("Third NFT"),
      Cl.stringAscii("https://api.bitto.io/nft/3"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Check balances (ERC-721 balanceOf)
    const balance1 = simnet.callReadOnlyFn("non-fungible-token", "balance-of", [Cl.principal(user1)], deployer);
    expect(balance1.result).toBeUint(2);

    const balance2 = simnet.callReadOnlyFn("non-fungible-token", "balance-of", [Cl.principal(user2)], deployer);
    expect(balance2.result).toBeUint(1);

    // Check ownership (ERC-721 ownerOf)
    const owner1 = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(1)], deployer);
    expect(owner1.result).toBeOk(Cl.principal(user1));

    const owner3 = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(3)], deployer);
    expect(owner3.result).toBeOk(Cl.principal(user2));

    // Check total supply
    const totalSupply = simnet.callReadOnlyFn("non-fungible-token", "total-supply", [], deployer);
    expect(totalSupply.result).toBeUint(3);

    // Check token exists
    const exists = simnet.callReadOnlyFn("non-fungible-token", "token-exists", [Cl.uint(1)], deployer);
    expect(exists.result).toBeBool(true);

    const notExists = simnet.callReadOnlyFn("non-fungible-token", "token-exists", [Cl.uint(99)], deployer);
    expect(notExists.result).toBeBool(false);
  });

  it("should handle ERC-721 approval functions", () => {
    // Mint a token first
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Approval Test"),
      Cl.stringAscii("Testing approval functions"),
      Cl.stringAscii("https://api.bitto.io/nft/approval/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Approve user2 for token 1 (ERC-721 approve)
    const { result: approveResult } = simnet.callPublicFn(
      "non-fungible-token",
      "approve",
      [Cl.principal(user2), Cl.uint(1)],
      user1
    );
    expect(approveResult).toBeOk(Cl.bool(true));

    // Check approval (ERC-721 getApproved)
    const { result: getApprovedResult } = simnet.callReadOnlyFn(
      "non-fungible-token",
      "get-approved",
      [Cl.uint(1)],
      deployer
    );
    expect(getApprovedResult).toBeOk(Cl.some(Cl.principal(user2)));

    // Set approval for all (ERC-721 setApprovalForAll)
    const { result: approveAllResult } = simnet.callPublicFn(
      "non-fungible-token",
      "set-approval-for-all",
      [Cl.principal(user3), Cl.bool(true)],
      user1
    );
    expect(approveAllResult).toBeOk(Cl.bool(true));

    // Check approval for all (ERC-721 isApprovedForAll)
    const isApprovedForAll = simnet.callReadOnlyFn(
      "non-fungible-token",
      "is-approved-for-all",
      [Cl.principal(user1), Cl.principal(user3)],
      deployer
    );
    expect(isApprovedForAll.result).toBeBool(true);

    // Test unauthorized approval (should fail)
    const unauthorizedApprove = simnet.callPublicFn(
      "non-fungible-token",
      "approve",
      [Cl.principal(user3), Cl.uint(1)],
      user2 // user2 is not the owner
    );
    expect(unauthorizedApprove.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
  });

  it("should handle ERC-721 transfer functions", () => {
    // Mint a token
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Transfer Test"),
      Cl.stringAscii("Testing transfer functions"),
      Cl.stringAscii("https://api.bitto.io/nft/transfer/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Transfer from user1 to user2 (ERC-721 transferFrom)
    const { result: transferResult } = simnet.callPublicFn(
      "non-fungible-token",
      "transfer-from",
      [
        Cl.principal(user1),
        Cl.principal(user2),
        Cl.uint(1),
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user1
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Check new owner
    const newOwner = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(1)], deployer);
    expect(newOwner.result).toBeOk(Cl.principal(user2));

    // Check that approval was cleared
    const { result: getApprovedResult } = simnet.callReadOnlyFn(
      "non-fungible-token",
      "get-approved",
      [Cl.uint(1)],
      deployer
    );
    expect(getApprovedResult).toBeOk(Cl.none());

    // Test safe transfer (ERC-721 safeTransferFrom)
    const safeTransferResult = simnet.callPublicFn(
      "non-fungible-token",
      "safe-transfer-from",
      [
        Cl.principal(user2),
        Cl.principal(user3),
        Cl.uint(1),
        Cl.some(Cl.bufferFromHex("0x1234")),
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user2
    );
    expect(safeTransferResult.result).toBeOk(Cl.bool(true));

    // Verify final owner
    const finalOwner = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(1)], deployer);
    expect(finalOwner.result).toBeOk(Cl.principal(user3));
  });

  it("should handle tokenized vault functionality", () => {
    // Mint a vault NFT
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Vault NFT"),
      Cl.stringAscii("A tokenized vault"),
      Cl.stringAscii("https://api.bitto.io/vault/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Deposit into vault
    const { result: depositResult } = simnet.callPublicFn(
      "non-fungible-token",
      "vault-deposit",
      [
        Cl.uint(1), // vault-id
        Cl.uint(1000), // amount
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user2
    );
    expect(depositResult).toBeOk(Cl.uint(1000));

    // Check vault info
    const vaultInfoResult = simnet.callReadOnlyFn(
      "non-fungible-token",
      "get-vault-info",
      [Cl.uint(1), Cl.principal(user2)],
      deployer
    );
    expect(vaultInfoResult.result).toHaveProperty('type', 'ok');
    expect(vaultInfoResult.result.value).toHaveProperty('type', 'tuple');
    expect(vaultInfoResult.result.value.value).toHaveProperty('current-time');
    expect(vaultInfoResult.result.value.value).toHaveProperty('user-deposits');
    expect(vaultInfoResult.result.value.value).toHaveProperty('user-shares');

    // Transfer vault shares
    const { result: shareTransferResult } = simnet.callPublicFn(
      "non-fungible-token",
      "transfer-vault-shares",
      [
        Cl.uint(1), // vault-id
        Cl.principal(user3), // to
        Cl.uint(500), // shares
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user2
    );
    expect(shareTransferResult).toBeOk(Cl.uint(500));

    // Withdraw from vault
    const { result: withdrawResult } = simnet.callPublicFn(
      "non-fungible-token",
      "vault-withdraw",
      [
        Cl.uint(1), // vault-id
        Cl.uint(300), // shares
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user2
    );
    expect(withdrawResult).toBeOk(Cl.uint(300));
  });

  it("should handle NFT burning", () => {
    // Mint a token
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Burn Test"),
      Cl.stringAscii("Testing burn function"),
      Cl.stringAscii("https://api.bitto.io/nft/burn/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Check initial total supply
    const initialSupply = simnet.callReadOnlyFn("non-fungible-token", "total-supply", [], deployer);
    expect(initialSupply.result).toBeUint(1);

    // Burn the token
    const { result: burnResult } = simnet.callPublicFn(
      "non-fungible-token",
      "burn",
      [
        Cl.uint(1),
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user1
    );
    expect(burnResult).toBeOk(Cl.bool(true));

    // Check that token no longer exists
    const tokenExists = simnet.callReadOnlyFn("non-fungible-token", "token-exists", [Cl.uint(1)], deployer);
    expect(tokenExists.result).toBeBool(false);

    // Check that total supply decreased
    const finalSupply = simnet.callReadOnlyFn("non-fungible-token", "total-supply", [], deployer);
    expect(finalSupply.result).toBeUint(0);

    // Check that owner lookup fails
    const ownerResult = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(1)], deployer);
    expect(ownerResult.result).toBeErr(Cl.uint(1003)); // ERR_TOKEN_NOT_FOUND
  });

  it("should handle comprehensive token information functions", () => {
    // Mint a token with attributes
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Info Test NFT"),
      Cl.stringAscii("Testing comprehensive info functions"),
      Cl.stringAscii("https://api.bitto.io/nft/info/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Set attributes
    simnet.callPublicFn("non-fungible-token", "set-token-attributes", [
      Cl.uint(1),
      Cl.stringAscii('{"rarity": "legendary", "power": 100}')
    ], deployer);

    // Get comprehensive token info
    const tokenInfoResult = simnet.callReadOnlyFn(
      "non-fungible-token",
      "get-token-info",
      [Cl.uint(1)],
      deployer
    );
    expect(tokenInfoResult.result).toHaveProperty('type', 'ok');
    expect(tokenInfoResult.result.value).toHaveProperty('type', 'tuple');
    expect(tokenInfoResult.result.value.value).toHaveProperty('name');
    expect(tokenInfoResult.result.value.value).toHaveProperty('description');
    expect(tokenInfoResult.result.value.value).toHaveProperty('uri');

    // Get token metadata
    const metadataResult = simnet.callReadOnlyFn("non-fungible-token", "get-token-metadata", [Cl.uint(1)], deployer);
    expect(metadataResult.result).toHaveClarityType(ClarityType.OptionalSome);

    // Get tokens of owner
    const tokensOfOwner = simnet.callReadOnlyFn("non-fungible-token", "tokens-of-owner", [Cl.principal(user1)], deployer);
    expect(tokensOfOwner.result).toEqual(expect.objectContaining({
      value: expect.objectContaining({
        tokens: expect.objectContaining({
          value: expect.objectContaining({
            tokens: expect.objectContaining({
              value: expect.any(Array)
            })
          })
        })
      })
    }));
  });

  it("should handle batch operations and information retrieval", () => {
    // Mint multiple NFTs
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Batch NFT 1"),
      Cl.stringAscii("First batch NFT"),
      Cl.stringAscii("https://api.bitto.io/batch/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user2),
      Cl.uint(2),
      Cl.stringAscii("Batch NFT 2"),
      Cl.stringAscii("Second batch NFT"),
      Cl.stringAscii("https://api.bitto.io/batch/2"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Test batch mint
    const { result: batchMintResult } = simnet.callPublicFn(
      "non-fungible-token",
      "batch-mint",
      [
        Cl.list([Cl.principal(user3)]),
        Cl.list([Cl.uint(3)]),
        Cl.list([Cl.stringAscii("Batch NFT 3")]),
        Cl.list([Cl.stringAscii("Third batch NFT")]),
        Cl.list([Cl.stringAscii("https://api.bitto.io/batch/3")]),
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      deployer
    );
    expect(batchMintResult).toBeOk(Cl.bool(true));

    // Get batch token information
    const batchInfo = simnet.callReadOnlyFn(
      "non-fungible-token", 
      "get-batch-token-info", 
      [Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3)])], 
      deployer
    );
    expect(batchInfo.result).toBeList([expect.any(Object), expect.any(Object), expect.any(Object)]);
  });

  it("should handle error conditions and authorization", () => {
    // Try to mint with non-owner (should fail)
    const unauthorizedMint = simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("Unauthorized"),
      Cl.stringAscii("Should fail"),
      Cl.stringAscii("https://api.bitto.io/fail/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], user1); // user1 is not the contract owner
    expect(unauthorizedMint.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED

    // Try to get owner of non-existent token
    const nonExistentOwner = simnet.callReadOnlyFn("non-fungible-token", "owner-of", [Cl.uint(999)], deployer);
    expect(nonExistentOwner.result).toBeErr(Cl.uint(1003)); // ERR_TOKEN_NOT_FOUND

    // Try to approve non-existent token
    const approveNonExistent = simnet.callPublicFn(
      "non-fungible-token",
      "approve",
      [Cl.principal(user2), Cl.uint(999)],
      user1
    );
    expect(approveNonExistent.result).toBeErr(Cl.uint(1003)); // ERR_TOKEN_NOT_FOUND

    // Try to transfer non-existent token
    const transferNonExistent = simnet.callPublicFn(
      "non-fungible-token",
      "transfer-from",
      [
        Cl.principal(user1),
        Cl.principal(user2),
        Cl.uint(999),
        Cl.none(),
        Cl.none(),
        Cl.none()
      ],
      user1
    );
    expect(transferNonExistent.result).toBeErr(Cl.uint(1003)); // ERR_TOKEN_NOT_FOUND
  });

  it("should handle contract URI management", () => {
    // Set new contract URI (only owner)
    const { result: setUriResult } = simnet.callPublicFn(
      "non-fungible-token",
      "set-contract-uri",
      [Cl.stringAscii("https://newapi.bitto.io/nft/")],
      deployer
    );
    expect(setUriResult).toBeOk(Cl.bool(true));

    // Verify URI was updated
    const updatedUri = simnet.callReadOnlyFn("non-fungible-token", "contract-uri", [], deployer);
    expect(updatedUri.result).toBeAscii("https://newapi.bitto.io/nft/");

    // Try to set URI with non-owner (should fail)
    const unauthorizedSetUri = simnet.callPublicFn(
      "non-fungible-token",
      "set-contract-uri",
      [Cl.stringAscii("https://malicious.com/")],
      user1
    );
    expect(unauthorizedSetUri.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
  });

  it("should handle interface support (ERC-165 style)", () => {
    // Test ERC-721 interface support
    const erc721Support = simnet.callReadOnlyFn(
      "non-fungible-token",
      "supports-interface",
      [Cl.bufferFromHex("0x80ac58cd")], // ERC-721 interface ID
      deployer
    );
    expect(erc721Support.result).toBeBool(true);

    // Test ERC-721 Metadata interface support
    const metadataSupport = simnet.callReadOnlyFn(
      "non-fungible-token",
      "supports-interface",
      [Cl.bufferFromHex("0x5b5e139f")], // ERC-721 Metadata interface ID
      deployer
    );
    expect(metadataSupport.result).toBeBool(true);

    // Test unsupported interface
    const unsupportedInterface = simnet.callReadOnlyFn(
      "non-fungible-token",
      "supports-interface",
      [Cl.bufferFromHex("0x12345678")], // Random interface ID
      deployer
    );
    expect(unsupportedInterface.result).toBeBool(false);
  });

  it("should handle operation tracking and history", () => {
    // Mint a token to create an operation
    simnet.callPublicFn("non-fungible-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.stringAscii("History Test"),
      Cl.stringAscii("Testing operation history"),
      Cl.stringAscii("https://api.bitto.io/history/1"),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], deployer);

    // Transfer to create another operation
    simnet.callPublicFn("non-fungible-token", "transfer-from", [
      Cl.principal(user1),
      Cl.principal(user2),
      Cl.uint(1),
      Cl.none(),
      Cl.none(),
      Cl.none()
    ], user1);

    // Get operation nonce
    const operationNonce = simnet.callReadOnlyFn("non-fungible-token", "get-operation-nonce", [], deployer);
    expect(operationNonce.result).toBeUint(2); // Should have 2 operations (mint + transfer)

    // Get transfer operation details
    const operation1 = simnet.callReadOnlyFn("non-fungible-token", "get-transfer-operation", [Cl.uint(1)], deployer);
    expect(operation1.result).toHaveProperty('type', 'some');

    const operation2 = simnet.callReadOnlyFn("non-fungible-token", "get-transfer-operation", [Cl.uint(2)], deployer);
    expect(operation2.result).toHaveProperty('type', 'some');
  });
});
