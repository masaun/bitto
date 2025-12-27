import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Multi-Asset Token Tests", () => {
  it("should initialize with token-id-nonce at 0", () => {
    const lastTokenId = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(0));
  });

  it("should mint new multi-asset token", () => {
    const { result: mintResult } = simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );
    expect(mintResult).toBeOk(Cl.uint(1));

    // Verify owner
    const owner = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));

    // Verify last token ID
    const lastTokenId = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(1));
  });

  it("should add asset to token by contract owner", () => {
    // Mint token first
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add asset
    const { result: addAssetResult } = simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0), // No replacement
      ],
      deployer
    );
    expect(addAssetResult).toBeOk(Cl.uint(1)); // Returns new asset ID
  });

  it("should fail to add asset if not contract owner", () => {
    // Mint token first
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Try to add asset as non-owner
    const { result: addAssetResult } = simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      user1
    );
    expect(addAssetResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should accept pending asset by token owner", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Accept asset
    const { result: acceptResult } = simnet.callPublicFn(
      "multi-asset-token",
      "accept-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user1
    );
    expect(acceptResult).toBeOk(Cl.bool(true));
  });

  it("should fail to accept asset if not token owner or approved", () => {
    // Mint token to user1
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Try to accept as different user
    const { result: acceptResult } = simnet.callPublicFn(
      "multi-asset-token",
      "accept-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user2
    );
    expect(acceptResult).toBeErr(Cl.uint(103)); // err-not-approved
  });

  it("should reject pending asset by token owner", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Reject asset
    const { result: rejectResult } = simnet.callPublicFn(
      "multi-asset-token",
      "reject-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user1
    );
    expect(rejectResult).toBeOk(Cl.bool(true));
  });

  it("should fail to reject asset if not token owner or approved", () => {
    // Mint token to user1
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Try to reject as different user
    const { result: rejectResult } = simnet.callPublicFn(
      "multi-asset-token",
      "reject-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user2
    );
    expect(rejectResult).toBeErr(Cl.uint(103)); // err-not-approved
  });

  it("should reject all pending assets", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add multiple assets
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/2.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Reject all
    const { result: rejectAllResult } = simnet.callPublicFn(
      "multi-asset-token",
      "reject-all-assets",
      [Cl.uint(1), Cl.uint(10)],
      user1
    );
    expect(rejectAllResult).toBeOk(Cl.bool(true));
  });

  it("should set asset priorities", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Set priorities
    const priorities = Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3)]);
    const { result: setPriorityResult } = simnet.callPublicFn(
      "multi-asset-token",
      "set-priority",
      [Cl.uint(1), priorities],
      user1
    );
    expect(setPriorityResult).toBeOk(Cl.bool(true));
  });

  it("should approve operator for asset management", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Approve operator
    const { result: approveResult } = simnet.callPublicFn(
      "multi-asset-token",
      "approve-for-assets",
      [Cl.principal(user2), Cl.uint(1)],
      user1
    );
    expect(approveResult).toBeOk(Cl.bool(true));
  });

  it("should fail to approve if not token owner", () => {
    // Mint token to user1
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Try to approve as different user
    const { result: approveResult } = simnet.callPublicFn(
      "multi-asset-token",
      "approve-for-assets",
      [Cl.principal(user2), Cl.uint(1)],
      user2
    );
    expect(approveResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should set approval for all assets", () => {
    // Set approval for all
    const { result: approvalResult } = simnet.callPublicFn(
      "multi-asset-token",
      "set-approval-for-all-for-assets",
      [Cl.principal(user2), Cl.bool(true)],
      user1
    );
    expect(approvalResult).toBeOk(Cl.bool(true));

    // Check approval
    const isApproved = simnet.callReadOnlyFn(
      "multi-asset-token",
      "is-approved-for-all-for-assets",
      [Cl.principal(user1), Cl.principal(user2)],
      deployer
    );
    expect(isApproved.result).toBeOk(Cl.bool(true));
  });

  it("should get active assets for token", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Get active assets
    const activeAssets = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-active-assets",
      [Cl.uint(1)],
      deployer
    );
    expect(activeAssets.result).toHaveProperty("type", ClarityType.ResponseOk);
  });

  it("should get pending assets for token", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Get pending assets
    const pendingAssets = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-pending-assets",
      [Cl.uint(1)],
      deployer
    );
    expect(pendingAssets.result).toHaveProperty("type", ClarityType.ResponseOk);
  });

  it("should get asset metadata", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add and accept asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    simnet.callPublicFn(
      "multi-asset-token",
      "accept-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user1
    );

    // Get metadata
    const metadata = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-asset-metadata",
      [Cl.uint(1), Cl.uint(1)],
      deployer
    );
    expect(metadata.result).toBeOk(
      Cl.stringAscii("https://example.com/asset/1.json")
    );
  });

  it("should get asset replacement information", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Get replacement info
    const replacement = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-asset-replacements",
      [Cl.uint(1), Cl.uint(1)],
      deployer
    );
    expect(replacement.result).toBeOk(Cl.uint(0));
  });

  it("should transfer token and clear asset approvals", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Approve someone for assets
    simnet.callPublicFn(
      "multi-asset-token",
      "approve-for-assets",
      [Cl.principal(user2), Cl.uint(1)],
      user1
    );

    // Transfer token
    const { result: transferResult } = simnet.callPublicFn(
      "multi-asset-token",
      "transfer",
      [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
      user1
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify new owner
    const owner = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user2)));
  });

  it("should fail to transfer if not sender", () => {
    // Mint token to user1
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Try to transfer as different user
    const { result: transferResult } = simnet.callPublicFn(
      "multi-asset-token",
      "transfer",
      [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
      user2
    );
    expect(transferResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should set token URI by contract owner", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Set token URI
    const { result: setUriResult } = simnet.callPublicFn(
      "multi-asset-token",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1")],
      deployer
    );
    expect(setUriResult).toBeOk(Cl.bool(true));

    // Verify URI
    const uri = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-token-uri",
      [Cl.uint(1)],
      deployer
    );
    expect(uri.result).toBeOk(
      Cl.some(Cl.stringAscii("https://example.com/token/1"))
    );
  });

  it("should fail to set token URI if not contract owner", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Try to set URI as non-owner
    const { result: setUriResult } = simnet.callPublicFn(
      "multi-asset-token",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1")],
      user1
    );
    expect(setUriResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should burn token", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Burn token
    const { result: burnResult } = simnet.callPublicFn(
      "multi-asset-token",
      "burn",
      [Cl.uint(1)],
      user1
    );
    expect(burnResult).toBeOk(Cl.bool(true));

    // Verify no longer has owner
    const owner = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.none());
  });

  it("should fail to burn if not owner", () => {
    // Mint token to user1
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Try to burn as different user
    const { result: burnResult } = simnet.callPublicFn(
      "multi-asset-token",
      "burn",
      [Cl.uint(1)],
      user2
    );
    expect(burnResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should mint multiple tokens", () => {
    // Mint first token
    const { result: mint1 } = simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );
    expect(mint1).toBeOk(Cl.uint(1));

    // Mint second token
    const { result: mint2 } = simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user2)],
      deployer
    );
    expect(mint2).toBeOk(Cl.uint(2));

    // Verify owners
    const owner1 = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner1.result).toBeOk(Cl.some(Cl.principal(user1)));

    const owner2 = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-owner",
      [Cl.uint(2)],
      deployer
    );
    expect(owner2.result).toBeOk(Cl.some(Cl.principal(user2)));
  });

  it("should handle asset replacement workflow", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Add first asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Accept first asset
    simnet.callPublicFn(
      "multi-asset-token",
      "accept-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user1
    );

    // Add replacement asset
    const { result: addResult } = simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/2.json"),
        Cl.uint(1), // Replaces asset 1
      ],
      deployer
    );
    expect(addResult).toBeOk(Cl.uint(2)); // New asset ID

    // Accept replacement
    const { result: acceptResult } = simnet.callPublicFn(
      "multi-asset-token",
      "accept-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(2)],
      user1
    );
    expect(acceptResult).toBeOk(Cl.bool(true));
  });

  it("should allow approved operator to accept assets", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Approve operator
    simnet.callPublicFn(
      "multi-asset-token",
      "approve-for-assets",
      [Cl.principal(user2), Cl.uint(1)],
      user1
    );

    // Add asset
    simnet.callPublicFn(
      "multi-asset-token",
      "add-asset-to-token",
      [
        Cl.uint(1),
        Cl.stringAscii("https://example.com/asset/1.json"),
        Cl.uint(0),
      ],
      deployer
    );

    // Accept as approved operator
    const { result: acceptResult } = simnet.callPublicFn(
      "multi-asset-token",
      "accept-asset",
      [Cl.uint(1), Cl.uint(0), Cl.uint(1)],
      user2
    );
    expect(acceptResult).toBeOk(Cl.bool(true));
  });

  it("should get approved for assets returns none initially", () => {
    // Mint token
    simnet.callPublicFn(
      "multi-asset-token",
      "mint",
      [Cl.principal(user1)],
      deployer
    );

    // Get approved (should be none)
    const approved = simnet.callReadOnlyFn(
      "multi-asset-token",
      "get-approved-for-assets",
      [Cl.uint(1)],
      deployer
    );
    expect(approved.result).toBeOk(Cl.none());
  });
});
