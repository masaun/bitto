import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("lockable-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint NFT successfully", () => {
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get default locked status", () => {
    const { result } = simnet.callReadOnlyFn(
      "lockable-nft",
      "get-default-locked",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if token is locked", () => {
    simnet.callPublicFn("lockable-nft", "mint", [Cl.principal(wallet1)], deployer);
    
    const { result } = simnet.callReadOnlyFn(
      "lockable-nft",
      "is-locked",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should lock an unlocked token", () => {
    simnet.callPublicFn("lockable-nft", "mint", [Cl.principal(wallet1)], deployer);
    simnet.callPublicFn("lockable-nft", "set-default-locked", [Cl.bool(false)], deployer);
    simnet.callPublicFn("lockable-nft", "unlock", [Cl.uint(1)], wallet1);
    
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "lock",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should unlock a locked token", () => {
    simnet.callPublicFn("lockable-nft", "mint", [Cl.principal(wallet1)], deployer);
    
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "unlock",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not transfer locked token", () => {
    simnet.callPublicFn("lockable-nft", "mint", [Cl.principal(wallet1)], deployer);
    
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should transfer unlocked token", () => {
    simnet.callPublicFn("lockable-nft", "mint", [Cl.principal(wallet1)], deployer);
    simnet.callPublicFn("lockable-nft", "unlock", [Cl.uint(1)], wallet1);
    
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should set default locked status by owner", () => {
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "set-default-locked",
      [Cl.bool(true)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not set default locked status by non-owner", () => {
    const { result } = simnet.callPublicFn(
      "lockable-nft",
      "set-default-locked",
      [Cl.bool(false)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });
});
