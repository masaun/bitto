import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Refundable Token (ERC-5507 inspired)", () => {

  beforeEach(() => {
    simnet.setEpoch("3.3");
  });

  it("should get token metadata", () => {
    const name = simnet.callReadOnlyFn("refundable-token", "get-name", [], deployer);
    expect(name.result).toBeOk(Cl.stringAscii("RefundableToken"));

    const symbol = simnet.callReadOnlyFn("refundable-token", "get-symbol", [], deployer);
    expect(symbol.result).toBeOk(Cl.stringAscii("RFT"));

    const decimals = simnet.callReadOnlyFn("refundable-token", "get-decimals", [], deployer);
    expect(decimals.result).toBeOk(Cl.uint(6));
  });

  it("should mint tokens", () => {
    const mintResult = simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(1000),
      Cl.principal(user1)
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn("refundable-token", "get-balance", [
      Cl.principal(user1)
    ], deployer);
    expect(balance.result).toBeOk(Cl.uint(1000));
  });

  it("should transfer tokens", () => {
    simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(1000),
      Cl.principal(user1)
    ], deployer);

    const transferResult = simnet.callPublicFn("refundable-token", "transfer", [
      Cl.uint(500),
      Cl.principal(user1),
      Cl.principal(user2),
      Cl.none()
    ], user1);
    expect(transferResult.result).toBeOk(Cl.bool(true));

    const balance1 = simnet.callReadOnlyFn("refundable-token", "get-balance", [
      Cl.principal(user1)
    ], deployer);
    expect(balance1.result).toBeOk(Cl.uint(500));

    const balance2 = simnet.callReadOnlyFn("refundable-token", "get-balance", [
      Cl.principal(user2)
    ], deployer);
    expect(balance2.result).toBeOk(Cl.uint(500));
  });

  it("should set refund configuration", () => {
    const setConfigResult = simnet.callPublicFn("refundable-token", "set-refund-config", [
      Cl.uint(100),
      Cl.uint(1000)
    ], deployer);
    expect(setConfigResult.result).toBeOk(Cl.bool(true));

    const refundPrice = simnet.callReadOnlyFn("refundable-token", "refund-of", [], deployer);
    expect(refundPrice.result).toBeOk(Cl.uint(100));

    const refundDeadline = simnet.callReadOnlyFn("refundable-token", "refund-deadline-of", [], deployer);
    expect(refundDeadline.result).toBeOk(Cl.uint(1000));
  });

  it("should refund tokens before deadline", () => {
    simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(1000),
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("refundable-token", "set-refund-config", [
      Cl.uint(50),
      Cl.uint(10000)
    ], deployer);

    const refundResult = simnet.callPublicFn("refundable-token", "refund", [
      Cl.uint(100)
    ], user1);
    expect(refundResult.result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn("refundable-token", "get-balance", [
      Cl.principal(user1)
    ], deployer);
    expect(balance.result).toBeOk(Cl.uint(900));
  });

  it("should fail to refund after deadline", () => {
    simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(1000),
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("refundable-token", "set-refund-config", [
      Cl.uint(50),
      Cl.uint(5)
    ], deployer);

    simnet.mineEmptyBlocks(10);

    const refundResult = simnet.callPublicFn("refundable-token", "refund", [
      Cl.uint(100)
    ], user1);
    expect(refundResult.result).toBeErr(Cl.uint(3));
  });

  it("should fail to refund with insufficient balance", () => {
    simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(100),
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("refundable-token", "set-refund-config", [
      Cl.uint(50),
      Cl.uint(10000)
    ], deployer);

    const refundResult = simnet.callPublicFn("refundable-token", "refund", [
      Cl.uint(200)
    ], user1);
    expect(refundResult.result).toBeErr(Cl.uint(2));
  });

  it("should fail to refund with invalid amount", () => {
    simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(1000),
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("refundable-token", "set-refund-config", [
      Cl.uint(50),
      Cl.uint(10000)
    ], deployer);

    const refundResult = simnet.callPublicFn("refundable-token", "refund", [
      Cl.uint(0)
    ], user1);
    expect(refundResult.result).toBeErr(Cl.uint(4));
  });

  it("should fail unauthorized transfer", () => {
    simnet.callPublicFn("refundable-token", "mint", [
      Cl.uint(1000),
      Cl.principal(user1)
    ], deployer);

    const transferResult = simnet.callPublicFn("refundable-token", "transfer", [
      Cl.uint(500),
      Cl.principal(user1),
      Cl.principal(user2),
      Cl.none()
    ], user2);
    expect(transferResult.result).toBeErr(Cl.uint(1));
  });
});
