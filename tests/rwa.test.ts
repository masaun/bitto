import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("rwa contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint RWA tokens", () => {
    const { result } = simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get balance", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "rwa",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeUint(1000);
  });

  it("should transfer tokens", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    simnet.callPublicFn(
      "rwa",
      "set-can-transact",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    
    simnet.callPublicFn(
      "rwa",
      "set-can-transact",
      [Cl.principal(wallet2), Cl.bool(true)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "rwa",
      "transfer",
      [Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should forced transfer", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "rwa",
      "forced-transfer",
      [Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(500)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should set frozen tokens", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "rwa",
      "set-frozen-tokens",
      [Cl.principal(wallet1), Cl.uint(200), Cl.bool(true)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get frozen tokens", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    simnet.callPublicFn(
      "rwa",
      "set-frozen-tokens",
      [Cl.principal(wallet1), Cl.uint(200), Cl.bool(true)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "rwa",
      "get-frozen-tokens",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeUint(200);
  });

  it("should set can-transact", () => {
    const { result } = simnet.callPublicFn(
      "rwa",
      "set-can-transact",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check can-transfer", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    simnet.callPublicFn(
      "rwa",
      "set-can-transact",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    
    simnet.callPublicFn(
      "rwa",
      "set-can-transact",
      [Cl.principal(wallet2), Cl.bool(true)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "rwa",
      "can-transfer",
      [Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(500)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should get total supply", () => {
    simnet.callPublicFn(
      "rwa",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "rwa",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1000));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "rwa",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});
