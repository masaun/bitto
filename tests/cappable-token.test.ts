import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("cappable-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should set max supply", () => {
    const { result } = simnet.callPublicFn(
      "cappable-token",
      "set-max-supply",
      [Cl.uint(10000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get max supply", () => {
    simnet.callPublicFn(
      "cappable-token",
      "set-max-supply",
      [Cl.uint(10000)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cappable-token",
      "get-max-supply",
      [],
      deployer
    );
    expect(result).toBeUint(10000);
  });

  it("should set transfer fee", () => {
    const { result } = simnet.callPublicFn(
      "cappable-token",
      "set-transfer-fee",
      [Cl.uint(10)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should transfer and mint new tokens", () => {
    simnet.callPublicFn(
      "cappable-token",
      "set-max-supply",
      [Cl.uint(10000)],
      deployer
    );
    
    simnet.callPublicFn(
      "cappable-token",
      "set-transfer-fee",
      [Cl.uint(100)],
      deployer
    );
    
    simnet.callPublicFn(
      "cappable-token",
      "mint",
      [Cl.uint(1000), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "cappable-token",
      "transfer",
      [Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get balance", () => {
    simnet.callPublicFn(
      "cappable-token",
      "mint",
      [Cl.uint(500), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cappable-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(500));
  });

  it("should burn tokens", () => {
    simnet.callPublicFn(
      "cappable-token",
      "mint",
      [Cl.uint(1000), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "cappable-token",
      "burn",
      [Cl.uint(200), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get total supply", () => {
    simnet.callPublicFn(
      "cappable-token",
      "mint",
      [Cl.uint(1000), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cappable-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1000));
  });

  it("should get token name", () => {
    const { result } = simnet.callReadOnlyFn(
      "cappable-token",
      "get-name",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Cappable Token"));
  });

  it("should get token symbol", () => {
    const { result } = simnet.callReadOnlyFn(
      "cappable-token",
      "get-symbol",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("CAP"));
  });

  it("should get decimals", () => {
    const { result } = simnet.callReadOnlyFn(
      "cappable-token",
      "get-decimals",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(6));
  });
});
