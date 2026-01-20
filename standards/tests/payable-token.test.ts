import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Payable Token (ERC-1363 inspired)", () => {

  it("should mint tokens", () => {
    const mintResult = simnet.callPublicFn("payable-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn("payable-token", "balance-of", [
      Cl.principal(user1)
    ], deployer);
    expect(balance.result).toBeOk(Cl.uint(1000));
  });

  it("should transfer tokens", () => {
    simnet.callPublicFn("payable-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);

    const transferResult = simnet.callPublicFn("payable-token", "transfer", [
      Cl.principal(user1),
      Cl.principal(user2),
      Cl.uint(500)
    ], user1);
    expect(transferResult.result).toBeOk(Cl.bool(true));

    const balance1 = simnet.callReadOnlyFn("payable-token", "balance-of", [
      Cl.principal(user1)
    ], deployer);
    expect(balance1.result).toBeOk(Cl.uint(500));

    const balance2 = simnet.callReadOnlyFn("payable-token", "balance-of", [
      Cl.principal(user2)
    ], deployer);
    expect(balance2.result).toBeOk(Cl.uint(500));
  });

  it("should approve and transfer-from", () => {
    simnet.callPublicFn("payable-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);

    const approveResult = simnet.callPublicFn("payable-token", "approve", [
      Cl.principal(user2),
      Cl.uint(500)
    ], user1);
    expect(approveResult.result).toBeOk(Cl.bool(true));

    const allowance = simnet.callReadOnlyFn("payable-token", "allowance", [
      Cl.principal(user1),
      Cl.principal(user2)
    ], deployer);
    expect(allowance.result).toBeOk(Cl.uint(500));

    const transferFromResult = simnet.callPublicFn("payable-token", "transfer-from", [
      Cl.principal(user1),
      Cl.principal(deployer),
      Cl.uint(300)
    ], user2);
    expect(transferFromResult.result).toBeOk(Cl.bool(true));
  });

  it("should return total supply", () => {
    simnet.callPublicFn("payable-token", "mint", [
      Cl.principal(user1),
      Cl.uint(1000)
    ], deployer);

    const totalSupply = simnet.callReadOnlyFn("payable-token", "total-supply", [], deployer);
    expect(totalSupply.result).toBeOk(Cl.uint(1000));
  });

  it("should check get-restrict-assets", () => {
    const restricted = simnet.callReadOnlyFn("payable-token", "get-restrict-assets", [], deployer);
    expect(restricted.result).toStrictEqual(Cl.bool(true));
  });
});
