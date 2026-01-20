import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("NFT with State Fingerprint Tests", () => {
  it("should initialize with token-id-nonce at 0", () => {
    const lastTokenId = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(0));
  });

  it("should mint NFT with initial state", () => {
    const { result: mintResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("gold"),
        Cl.uint(1000),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );
    expect(mintResult).toBeOk(Cl.uint(1));

    // Verify owner
    const owner = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));

    // Verify last token ID updated
    const lastTokenId = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(1));
  });

  it("should get token state after minting", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("silver"),
        Cl.uint(500),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Get token state
    const state = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-token-state",
      [Cl.uint(1)],
      deployer
    );
    
    // Should return a tuple with the correct asset info (last-modified will be current block time)
    expect(state.result).toHaveProperty("type", ClarityType.ResponseOk);
    const stateData = state.result as any;
    expect(stateData.value.value.value["asset-type"]).toStrictEqual(Cl.stringAscii("silver"));
    expect(stateData.value.value.value["asset-value"]).toStrictEqual(Cl.uint(500));
    expect(stateData.value.value.value["metadata-uri"]).toStrictEqual(
      Cl.stringAscii("https://example.com/metadata/1")
    );
  });

  it("should calculate state fingerprint", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("platinum"),
        Cl.uint(2000),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Get state fingerprint
    const fingerprint = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-state-fingerprint",
      [Cl.uint(1)],
      deployer
    );
    
    // Should return a hash (buffer of 32 bytes)
    expect(fingerprint.result).toHaveProperty("type", ClarityType.ResponseOk);
  });

  it("should update token state by owner", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("bronze"),
        Cl.uint(100),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Update state
    const { result: updateResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "update-state",
      [
        Cl.uint(1),
        Cl.stringAscii("gold"),
        Cl.uint(1000),
        Cl.stringAscii("https://example.com/metadata/2"),
      ],
      user1
    );
    expect(updateResult).toBeOk(Cl.bool(true));

    // Verify updated state
    const state = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-token-state",
      [Cl.uint(1)],
      deployer
    );
    
    const stateData = state.result as any;
    expect(stateData.value.value.value["asset-type"]).toStrictEqual(Cl.stringAscii("gold"));
    expect(stateData.value.value.value["asset-value"]).toStrictEqual(Cl.uint(1000));
    expect(stateData.value.value.value["metadata-uri"]).toStrictEqual(
      Cl.stringAscii("https://example.com/metadata/2")
    );
  });

  it("should fail to update state if not owner", () => {
    // Mint a token to user1
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("copper"),
        Cl.uint(50),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Try to update as different user
    const { result: updateResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "update-state",
      [
        Cl.uint(1),
        Cl.stringAscii("gold"),
        Cl.uint(1000),
        Cl.stringAscii("https://example.com/metadata/2"),
      ],
      user2
    );
    expect(updateResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should transfer NFT to another user", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("diamond"),
        Cl.uint(5000),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Transfer token
    const { result: transferResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "transfer",
      [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
      user1
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify new owner
    const owner = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user2)));
  });

  it("should fail to transfer if not sender", () => {
    // Mint a token to user1
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("emerald"),
        Cl.uint(3000),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Try to transfer as different user
    const { result: transferResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "transfer",
      [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
      user2
    );
    expect(transferResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should set token URI by owner", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("ruby"),
        Cl.uint(2500),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Set token URI
    const { result: setUriResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1")],
      user1
    );
    expect(setUriResult).toBeOk(Cl.bool(true));

    // Verify URI was set
    const uri = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-token-uri",
      [Cl.uint(1)],
      deployer
    );
    expect(uri.result).toBeOk(
      Cl.some(Cl.stringAscii("https://example.com/token/1"))
    );
  });

  it("should fail to set token URI if not owner", () => {
    // Mint a token to user1
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("sapphire"),
        Cl.uint(2800),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Try to set URI as different user
    const { result: setUriResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1")],
      user2
    );
    expect(setUriResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should burn token by owner", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("pearl"),
        Cl.uint(1500),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Burn token
    const { result: burnResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "burn",
      [Cl.uint(1)],
      user1
    );
    expect(burnResult).toBeOk(Cl.bool(true));

    // Verify token no longer has owner
    const owner = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.none());

    // Verify state was deleted
    const state = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-token-state",
      [Cl.uint(1)],
      deployer
    );
    expect(state.result).toBeOk(Cl.none());
  });

  it("should fail to burn if not owner", () => {
    // Mint a token to user1
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("jade"),
        Cl.uint(800),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Try to burn as different user
    const { result: burnResult } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "burn",
      [Cl.uint(1)],
      user2
    );
    expect(burnResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should maintain different fingerprints for different states", () => {
    // Mint first token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("gold"),
        Cl.uint(1000),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Mint second token with different state
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("silver"),
        Cl.uint(500),
        Cl.stringAscii("https://example.com/metadata/2"),
      ],
      deployer
    );

    // Get fingerprints
    const fingerprint1 = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-state-fingerprint",
      [Cl.uint(1)],
      deployer
    );

    const fingerprint2 = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-state-fingerprint",
      [Cl.uint(2)],
      deployer
    );

    // Fingerprints should be different
    expect(fingerprint1.result).not.toEqual(fingerprint2.result);
  });

  it("should change fingerprint when state is updated", () => {
    // Mint a token
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("bronze"),
        Cl.uint(100),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );

    // Get initial fingerprint
    const fingerprint1 = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-state-fingerprint",
      [Cl.uint(1)],
      deployer
    );

    // Update state
    simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "update-state",
      [
        Cl.uint(1),
        Cl.stringAscii("gold"),
        Cl.uint(1000),
        Cl.stringAscii("https://example.com/metadata/2"),
      ],
      user1
    );

    // Get new fingerprint
    const fingerprint2 = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-state-fingerprint",
      [Cl.uint(1)],
      deployer
    );

    // Fingerprints should be different after update
    expect(fingerprint1.result).not.toEqual(fingerprint2.result);
  });

  it("should fail to get state of non-existent token", () => {
    const state = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-token-state",
      [Cl.uint(999)],
      deployer
    );
    expect(state.result).toBeOk(Cl.none());
  });

  it("should fail to get fingerprint of non-existent token", () => {
    const fingerprint = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-state-fingerprint",
      [Cl.uint(999)],
      deployer
    );
    expect(fingerprint.result).toBeErr(Cl.uint(102)); // err-invalid-token
  });

  it("should mint multiple tokens with unique states", () => {
    // Mint first token
    const { result: mint1 } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user1),
        Cl.stringAscii("gold"),
        Cl.uint(1000),
        Cl.stringAscii("https://example.com/metadata/1"),
      ],
      deployer
    );
    expect(mint1).toBeOk(Cl.uint(1));

    // Mint second token
    const { result: mint2 } = simnet.callPublicFn(
      "nft-with-state-fingerprint",
      "mint",
      [
        Cl.principal(user2),
        Cl.stringAscii("silver"),
        Cl.uint(500),
        Cl.stringAscii("https://example.com/metadata/2"),
      ],
      deployer
    );
    expect(mint2).toBeOk(Cl.uint(2));

    // Verify owners
    const owner1 = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner1.result).toBeOk(Cl.some(Cl.principal(user1)));

    const owner2 = simnet.callReadOnlyFn(
      "nft-with-state-fingerprint",
      "get-owner",
      [Cl.uint(2)],
      deployer
    );
    expect(owner2.result).toBeOk(Cl.some(Cl.principal(user2)));
  });
});
