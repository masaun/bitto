import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("interoperable-security-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint tokens to partition", () => {
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get balance by partition", () => {
    simnet.callPublicFn(
      "interoperable-security-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "interoperable-security-token",
      "get-balance-by-partition",
      [Cl.principal(wallet1), Cl.uint(1)],
      deployer
    );
    expect(result).toBeUint(1000);
  });

  it("should lock tokens", () => {
    simnet.callPublicFn(
      "interoperable-security-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "lock-tokens",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(500), Cl.uint(1000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should restrict transfer for partition", () => {
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "restrict-transfer",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should remove restriction", () => {
    simnet.callPublicFn(
      "interoperable-security-token",
      "restrict-transfer",
      [Cl.uint(1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "remove-restriction",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should freeze address", () => {
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "freeze-address",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should unfreeze address", () => {
    simnet.callPublicFn(
      "interoperable-security-token",
      "freeze-address",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "unfreeze-address",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should forced transfer", () => {
    simnet.callPublicFn(
      "interoperable-security-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "interoperable-security-token",
      "forced-transfer",
      [Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(1), Cl.uint(500)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get total supply", () => {
    simnet.callPublicFn(
      "interoperable-security-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "interoperable-security-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1000));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "interoperable-security-token",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});
