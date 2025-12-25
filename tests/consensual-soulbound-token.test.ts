import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Consensual Soulbound Token (ERC-5484 inspired)", () => {

  it("should mint a soulbound token", () => {
    const mintResult = simnet.callPublicFn("consensual-soulbound-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1)
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.bool(true));

    const owner = simnet.callReadOnlyFn("consensual-soulbound-token", "owner-of", [
      Cl.uint(1)
    ], deployer);
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));
  });

  it("should fail to mint duplicate token id", () => {
    simnet.callPublicFn("consensual-soulbound-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1)
    ], deployer);

    const mintResult = simnet.callPublicFn("consensual-soulbound-token", "mint", [
      Cl.principal(user2),
      Cl.uint(1)
    ], deployer);
    expect(mintResult.result).toBeErr(Cl.uint(100));
  });

  it("should burn a token", () => {
    simnet.callPublicFn("consensual-soulbound-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1)
    ], deployer);

    const burnResult = simnet.callPublicFn("consensual-soulbound-token", "burn", [
      Cl.uint(1)
    ], deployer);
    expect(burnResult.result).toBeOk(Cl.bool(true));

    const owner = simnet.callReadOnlyFn("consensual-soulbound-token", "owner-of", [
      Cl.uint(1)
    ], deployer);
    expect(owner.result).toBeOk(Cl.none());
  });

  it("should return balance of owner", () => {
    simnet.callPublicFn("consensual-soulbound-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1)
    ], deployer);

    simnet.callPublicFn("consensual-soulbound-token", "mint", [
      Cl.principal(user1),
      Cl.uint(2)
    ], deployer);

    const balance = simnet.callReadOnlyFn("consensual-soulbound-token", "balance-of", [
      Cl.principal(user1)
    ], deployer);
    expect(balance.result).toBeOk(Cl.uint(2));
  });

  it("should check get-restrict-assets", () => {
    const restricted = simnet.callReadOnlyFn("consensual-soulbound-token", "get-restrict-assets", [], deployer);
    expect(restricted.result).toStrictEqual(Cl.bool(true));
  });
});
