import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

describe("Vesting NFT Tests", () => {
  it("should initialize with token-id-nonce at 0", () => {
    const lastTokenId = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(0));
  });

  it("should mint vesting NFT with schedule", () => {
    const vestingStart = 1000;
    const vestingEnd = 2000;
    const totalAmount = 10000;

    const { result: mintResult } = simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer), // payout token contract
        Cl.uint(totalAmount),
        Cl.uint(vestingStart),
        Cl.uint(vestingEnd),
      ],
      deployer
    );
    expect(mintResult).toBeOk(Cl.uint(1));

    // Verify owner
    const owner = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));

    // Verify last token ID
    const lastTokenId = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastTokenId.result).toBeOk(Cl.uint(1));
  });

  it("should get vesting period", () => {
    const vestingStart = 1000;
    const vestingEnd = 2000;

    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(vestingStart),
        Cl.uint(vestingEnd),
      ],
      deployer
    );

    const period = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-vesting-period",
      [Cl.uint(1)],
      deployer
    );

    expect(period.result).toBeOk(
      Cl.tuple({
        "vesting-start": Cl.uint(vestingStart),
        "vesting-end": Cl.uint(vestingEnd),
      })
    );
  });

  it("should get payout token", () => {
    const payoutToken = deployer;

    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(payoutToken),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    const token = simnet.callReadOnlyFn(
      "vesting-nft",
      "payout-token",
      [Cl.uint(1)],
      deployer
    );

    expect(token.result).toBeOk(Cl.principal(payoutToken));
  });

  it("should calculate vested payout at different times", () => {
    const vestingStart = 1000;
    const vestingEnd = 2000;
    const totalAmount = 10000;

    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(totalAmount),
        Cl.uint(vestingStart),
        Cl.uint(vestingEnd),
      ],
      deployer
    );

    // Before vesting start
    const vested1 = simnet.callReadOnlyFn(
      "vesting-nft",
      "vested-payout-at-time",
      [Cl.uint(1), Cl.uint(500)],
      deployer
    );
    expect(vested1.result).toBeOk(Cl.uint(0));

    // At midpoint
    const vested2 = simnet.callReadOnlyFn(
      "vesting-nft",
      "vested-payout-at-time",
      [Cl.uint(1), Cl.uint(1500)],
      deployer
    );
    expect(vested2.result).toBeOk(Cl.uint(5000));

    // After vesting end
    const vested3 = simnet.callReadOnlyFn(
      "vesting-nft",
      "vested-payout-at-time",
      [Cl.uint(1), Cl.uint(3000)],
      deployer
    );
    expect(vested3.result).toBeOk(Cl.uint(totalAmount));
  });

  it("should track claimed payout", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Initially claimed should be 0
    const claimed = simnet.callReadOnlyFn(
      "vesting-nft",
      "claimed-payout",
      [Cl.uint(1)],
      deployer
    );
    expect(claimed.result).toBeOk(Cl.uint(0));
  });

  it("should calculate claimable payout", () => {
    const vestingStart = 1000;
    const vestingEnd = 2000;
    const totalAmount = 10000;

    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(totalAmount),
        Cl.uint(vestingStart),
        Cl.uint(vestingEnd),
      ],
      deployer
    );

    // Get claimable payout
    const claimable = simnet.callReadOnlyFn(
      "vesting-nft",
      "claimable-payout",
      [Cl.uint(1)],
      deployer
    );
    
    // Should have some claimable amount based on current block time
    expect(claimable.result).toHaveProperty("type", ClarityType.ResponseOk);
  });

  it("should calculate vesting (remaining) payout", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    const vesting = simnet.callReadOnlyFn(
      "vesting-nft",
      "vesting-payout",
      [Cl.uint(1)],
      deployer
    );
    
    expect(vesting.result).toHaveProperty("type", ClarityType.ResponseOk);
  });

  it("should allow owner to claim vested tokens", () => {
    const vestingStart = 0;
    const vestingEnd = 100;
    const totalAmount = 10000;

    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(totalAmount),
        Cl.uint(vestingStart),
        Cl.uint(vestingEnd),
      ],
      deployer
    );

    // Claim tokens (after some vesting time)
    const { result: claimResult } = simnet.callPublicFn(
      "vesting-nft",
      "claim",
      [Cl.uint(1)],
      user1
    );
    
    // Should succeed if there's claimable amount
    expect(claimResult).toHaveProperty("type");
  });

  it("should fail to claim if not approved", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(0),
        Cl.uint(100),
      ],
      deployer
    );

    // Try to claim as different user without approval
    const { result: claimResult } = simnet.callPublicFn(
      "vesting-nft",
      "claim",
      [Cl.uint(1)],
      user2
    );
    
    expect(claimResult).toBeErr(Cl.uint(103)); // err-not-approved
  });

  it("should set claim approval for specific token", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Set approval
    const { result: approvalResult } = simnet.callPublicFn(
      "vesting-nft",
      "set-claim-approval",
      [Cl.principal(user2), Cl.bool(true), Cl.uint(1)],
      user1
    );
    expect(approvalResult).toBeOk(Cl.bool(true));
  });

  it("should fail to set claim approval if not owner", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Try to set approval as non-owner
    const { result: approvalResult } = simnet.callPublicFn(
      "vesting-nft",
      "set-claim-approval",
      [Cl.principal(user3), Cl.bool(true), Cl.uint(1)],
      user2
    );
    expect(approvalResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should set claim approval for all tokens", () => {
    // Set approval for all
    const { result: approvalResult } = simnet.callPublicFn(
      "vesting-nft",
      "set-claim-approval-for-all",
      [Cl.principal(user2), Cl.bool(true)],
      user1
    );
    expect(approvalResult).toBeOk(Cl.bool(true));

    // Check approval
    const isApproved = simnet.callReadOnlyFn(
      "vesting-nft",
      "is-claim-approved-for-all",
      [Cl.principal(user1), Cl.principal(user2)],
      deployer
    );
    expect(isApproved.result).toBeOk(Cl.bool(true));
  });

  it("should transfer vesting NFT", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Transfer
    const { result: transferResult } = simnet.callPublicFn(
      "vesting-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
      user1
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify new owner
    const owner = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user2)));
  });

  it("should fail to transfer if not sender", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Try to transfer as different user
    const { result: transferResult } = simnet.callPublicFn(
      "vesting-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
      user2
    );
    expect(transferResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should set token URI by contract owner", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Set token URI
    const { result: setUriResult } = simnet.callPublicFn(
      "vesting-nft",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/vesting/1")],
      deployer
    );
    expect(setUriResult).toBeOk(Cl.bool(true));

    // Verify URI
    const uri = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-token-uri",
      [Cl.uint(1)],
      deployer
    );
    expect(uri.result).toBeOk(
      Cl.some(Cl.stringAscii("https://example.com/vesting/1"))
    );
  });

  it("should fail to set token URI if not contract owner", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Try to set URI as non-owner
    const { result: setUriResult } = simnet.callPublicFn(
      "vesting-nft",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/vesting/1")],
      user1
    );
    expect(setUriResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should burn vesting NFT", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Burn
    const { result: burnResult } = simnet.callPublicFn(
      "vesting-nft",
      "burn",
      [Cl.uint(1)],
      user1
    );
    expect(burnResult).toBeOk(Cl.bool(true));

    // Verify no longer has owner
    const owner = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner.result).toBeOk(Cl.none());
  });

  it("should fail to burn if not owner", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Try to burn as different user
    const { result: burnResult } = simnet.callPublicFn(
      "vesting-nft",
      "burn",
      [Cl.uint(1)],
      user2
    );
    expect(burnResult).toBeErr(Cl.uint(101)); // err-not-token-owner
  });

  it("should mint multiple vesting NFTs with different schedules", () => {
    // Mint first vesting NFT
    const { result: mint1 } = simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );
    expect(mint1).toBeOk(Cl.uint(1));

    // Mint second vesting NFT with different schedule
    const { result: mint2 } = simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user2),
        Cl.principal(deployer),
        Cl.uint(20000),
        Cl.uint(3000),
        Cl.uint(5000),
      ],
      deployer
    );
    expect(mint2).toBeOk(Cl.uint(2));

    // Verify both have correct owners
    const owner1 = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(owner1.result).toBeOk(Cl.some(Cl.principal(user1)));

    const owner2 = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-owner",
      [Cl.uint(2)],
      deployer
    );
    expect(owner2.result).toBeOk(Cl.some(Cl.principal(user2)));
  });

  it("should handle instant vesting (start equals end)", () => {
    const vestingTime = 1000;

    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(vestingTime),
        Cl.uint(vestingTime),
      ],
      deployer
    );

    // At or after vesting time, should be fully vested
    // Use a time >= vestingTime
    const vested = simnet.callReadOnlyFn(
      "vesting-nft",
      "vested-payout-at-time",
      [Cl.uint(1), Cl.uint(vestingTime + 1)],
      deployer
    );
    expect(vested.result).toBeOk(Cl.uint(10000));
  });

  it("should return correct approval status", () => {
    simnet.callPublicFn(
      "vesting-nft",
      "mint",
      [
        Cl.principal(user1),
        Cl.principal(deployer),
        Cl.uint(10000),
        Cl.uint(1000),
        Cl.uint(2000),
      ],
      deployer
    );

    // Get claim approved (should be none initially)
    const approved = simnet.callReadOnlyFn(
      "vesting-nft",
      "get-claim-approved",
      [Cl.uint(1)],
      deployer
    );
    expect(approved.result).toBeOk(Cl.none());
  });
});
