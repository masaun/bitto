import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("designate-executor contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint executor token", () => {
    const { result } = simnet.callPublicFn(
      "designate-executor",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should set will with executors", () => {
    simnet.callPublicFn(
      "designate-executor",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "designate-executor",
      "set-will",
      [Cl.uint(1), Cl.list([Cl.principal(wallet2), Cl.principal(wallet3)]), Cl.uint(2592000)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get will info", () => {
    simnet.callPublicFn(
      "designate-executor",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    simnet.callPublicFn(
      "designate-executor",
      "set-will",
      [Cl.uint(1), Cl.list([Cl.principal(wallet2)]), Cl.uint(2592000)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "designate-executor",
      "get-will",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      executors: Cl.list([Cl.principal(wallet2)]),
      "moratorium-ttl": Cl.uint(2592000)
    }));
  });

  it("should announce obituary", () => {
    simnet.callPublicFn(
      "designate-executor",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    simnet.callPublicFn(
      "designate-executor",
      "set-will",
      [Cl.uint(1), Cl.list([Cl.principal(wallet2)]), Cl.uint(2592000)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "designate-executor",
      "announce-obit",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet3)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should cancel obituary", () => {
    simnet.callPublicFn(
      "designate-executor",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    simnet.callPublicFn(
      "designate-executor",
      "announce-obit",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet3)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "designate-executor",
      "cancel-obit",
      [Cl.uint(1), Cl.principal(wallet1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get obituary status", () => {
    simnet.callPublicFn(
      "designate-executor",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    simnet.callPublicFn(
      "designate-executor",
      "announce-obit",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet3)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "designate-executor",
      "get-obit-status",
      [Cl.uint(1), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      announced: Cl.bool(true),
      inheritor: Cl.some(Cl.principal(wallet3)),
      "announcement-time": Cl.uint(0)
    }));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "designate-executor",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});
