import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Security Token (ERC-3643 T-REX inspired)", () => {

  it("should mint tokens", () => {
    const mintResult = simnet.callPublicFn("security-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn("security-token", "balance-of", [
      Cl.principal(user1)
    ], deployer);
    expect(balance.result).toBeOk(Cl.uint(1000));
  });

  it("should transfer tokens", () => {
    simnet.callPublicFn("security-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);

    const transferResult = simnet.callPublicFn("security-token", "transfer", [
      Cl.principal(user1),
      Cl.principal(user2),
      Cl.uint(500)
    ], user1);
    expect(transferResult.result).toBeOk(Cl.bool(true));

    const balance1 = simnet.callReadOnlyFn("security-token", "balance-of", [
      Cl.principal(user1)
    ], deployer);
    expect(balance1.result).toBeOk(Cl.uint(500));

    const balance2 = simnet.callReadOnlyFn("security-token", "balance-of", [
      Cl.principal(user2)
    ], deployer);
    expect(balance2.result).toBeOk(Cl.uint(500));
  });

  it("should burn tokens", () => {
    simnet.callPublicFn("security-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);

    const burnResult = simnet.callPublicFn("security-token", "burn", [
      Cl.principal(user1),
      Cl.uint(500)
    ], deployer);
    expect(burnResult.result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn("security-token", "balance-of", [
      Cl.principal(user1)
    ], deployer);
    expect(balance.result).toBeOk(Cl.uint(500));
  });

  it("should return total supply", () => {
    simnet.callPublicFn("security-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);

    const totalSupply = simnet.callReadOnlyFn("security-token", "total-supply", [], deployer);
    expect(totalSupply.result).toBeOk(Cl.uint(1000));
  });

  it("should check get-restrict-assets", () => {
    const restricted = simnet.callReadOnlyFn("security-token", "get-restrict-assets", [], deployer);
    expect(restricted.result).toStrictEqual(Cl.bool(true));
  });
});
