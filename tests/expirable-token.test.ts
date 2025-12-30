import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("expirable-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint tokens to recipient", () => {
    const { result } = simnet.callPublicFn(
      "expirable-token",
      "mint",
      [Cl.uint(1000), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get current epoch", () => {
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-current-epoch",
      [],
      deployer
    );
    expect(result).toBeUint(0);
  });

  it("should get balance at epoch", () => {
    simnet.callPublicFn(
      "expirable-token",
      "mint",
      [Cl.uint(500), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-balance-at-epoch",
      [Cl.uint(0), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeUint(500);
  });

  it("should get valid balance across epochs", () => {
    simnet.callPublicFn(
      "expirable-token",
      "mint",
      [Cl.uint(1000), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1000));
  });

  it("should transfer tokens at specific epoch", () => {
    simnet.callPublicFn(
      "expirable-token",
      "mint",
      [Cl.uint(2000), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "expirable-token",
      "transfer-at-epoch",
      [Cl.uint(0), Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if epoch is expired", () => {
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "is-epoch-expired",
      [Cl.uint(0)],
      deployer
    );
    expect(result).toBeBool(false);
  });

  it("should get token name", () => {
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-name",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Expirable Token"));
  });

  it("should get token symbol", () => {
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-symbol",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("EXP"));
  });

  it("should get decimals", () => {
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-decimals",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(6));
  });

  it("should get total supply", () => {
    simnet.callPublicFn(
      "expirable-token",
      "mint",
      [Cl.uint(1000), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expirable-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1000));
  });
});
