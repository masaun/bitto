import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Multiverse Non-Fungible Token Tests", () => {
  it("should initialize with token-id-nonce at 0", () => {
    const lastTokenId = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(0));
  });

  it("should mint new multiverse NFT via init-bundle", () => {
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(10),
      }),
    ]);

    const { result: mintResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );
    expect(mintResult).toBeOk(Cl.uint(1));

    // Verify token was minted
    const owner = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(deployer)));

    // Verify token ID nonce was updated
    const lastTokenId = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(1));
  });

  it("should transfer multiverse NFT to another user", () => {
    // First mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Transfer token
    const { result: transferResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "transfer",
      [Cl.uint(1), Cl.principal(deployer), Cl.principal(user1)],
      deployer
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify new owner
    const owner = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-owner",
      [Cl.uint(1)],
      user1
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));
  });

  it("should fail to transfer token if not the sender", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Try to transfer as a different user
    const { result: transferResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "transfer",
      [Cl.uint(1), Cl.principal(deployer), Cl.principal(user2)],
      user1
    );
    expect(transferResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should bundle additional delegates to existing token", () => {
    // Mint a token first
    const initialDelegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [initialDelegates],
      deployer
    );

    // Bundle additional delegates
    const additionalDelegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(2),
        quantity: Cl.uint(3),
      }),
    ]);

    const { result: bundleResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "bundle",
      [Cl.uint(1), additionalDelegates],
      deployer
    );
    expect(bundleResult).toBeOk(Cl.bool(true));
  });

  it("should fail to bundle if not token owner", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Try to bundle as different user
    const { result: bundleResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "bundle",
      [Cl.uint(1), delegates],
      user1
    );
    expect(bundleResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should unbundle delegates from token", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Unbundle
    const { result: unbundleResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "unbundle",
      [Cl.uint(1), delegates],
      deployer
    );
    expect(unbundleResult).toBeOk(Cl.bool(true));
  });

  it("should fail to unbundle if not token owner", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Try to unbundle as different user
    const { result: unbundleResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "unbundle",
      [Cl.uint(1), delegates],
      user1
    );
    expect(unbundleResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should set token URI by contract owner", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Set token URI
    const { result: setUriResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1")],
      deployer
    );
    expect(setUriResult).toBeOk(Cl.bool(true));

    // Verify URI was set
    const uri = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-token-uri",
      [Cl.uint(1)],
      deployer
    );
    expect(uri.result).toBeOk(
      Cl.some(Cl.stringAscii("https://example.com/token/1"))
    );
  });

  it("should fail to set token URI if not contract owner", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Try to set URI as different user
    const { result: setUriResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1")],
      user1
    );
    expect(setUriResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should burn token by owner", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Burn token
    const { result: burnResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "burn",
      [Cl.uint(1)],
      deployer
    );
    expect(burnResult).toBeOk(Cl.bool(true));

    // Verify token no longer has owner
    const owner = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.none());
  });

  it("should fail to burn token if not owner", () => {
    // Mint a token
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Try to burn as different user
    const { result: burnResult } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "burn",
      [Cl.uint(1)],
      user1
    );
    expect(burnResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should get delegate tokens for a multiverse token", () => {
    // Mint a token with delegates
    const delegates = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(5),
      }),
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(2),
        quantity: Cl.uint(3),
      }),
    ]);

    simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates],
      deployer
    );

    // Get delegate tokens
    const delegateTokens = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-delegate-tokens",
      [Cl.uint(1)],
      deployer
    );
    expect(delegateTokens.result).toHaveProperty("type", ClarityType.ResponseOk);
  });

  it("should mint multiple tokens with different delegates", () => {
    // Mint first token
    const delegates1 = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(1),
        quantity: Cl.uint(10),
      }),
    ]);

    const { result: mint1 } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates1],
      deployer
    );
    expect(mint1).toBeOk(Cl.uint(1));

    // Mint second token
    const delegates2 = Cl.list([
      Cl.tuple({
        "contract-address": Cl.principal(deployer),
        "token-id": Cl.uint(2),
        quantity: Cl.uint(20),
      }),
    ]);

    const { result: mint2 } = simnet.callPublicFn(
      "multiverse-non-fungible-token",
      "init-bundle",
      [delegates2],
      user1
    );
    expect(mint2).toBeOk(Cl.uint(2));

    // Verify owners
    const owner1 = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner1.result).toBeOk(Cl.some(Cl.principal(deployer)));

    const owner2 = simnet.callReadOnlyFn(
      "multiverse-non-fungible-token",
      "get-owner",
      [Cl.uint(2)],
      deployer
    );
    expect(owner2.result).toBeOk(Cl.some(Cl.principal(user1)));
  });
});
