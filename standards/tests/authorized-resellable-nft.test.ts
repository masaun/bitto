import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("authorized-resellable-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint ticket NFT", () => {
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get token status", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "authorized-resellable-nft",
      "get-token-status",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.stringAscii("Sold")));
  });

  it("should authorize reseller", () => {
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "authorize-reseller",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if reseller is authorized", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "authorize-reseller",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "authorized-resellable-nft",
      "is-authorized-reseller",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should resell ticket by authorized reseller", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "authorize-reseller",
      [Cl.principal(wallet2)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "resell",
      [Cl.uint(1), Cl.principal(wallet2), Cl.uint(1000)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not resell by unauthorized reseller", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "resell",
      [Cl.uint(1), Cl.principal(wallet2), Cl.uint(500)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should change ticket status by owner", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "change-status",
      [Cl.uint(1), Cl.stringAscii("Void")],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should redeem ticket", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "redeem",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not redeem already redeemed ticket", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "redeem",
      [Cl.uint(1)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "redeem",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(104));
  });

  it("should revoke reseller authorization", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "authorize-reseller",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "authorized-resellable-nft",
      "revoke-reseller",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get resale history", () => {
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "authorize-reseller",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "authorized-resellable-nft",
      "resell",
      [Cl.uint(1), Cl.principal(wallet2), Cl.uint(2000)],
      wallet2
    );
    
    const { result } = simnet.callReadOnlyFn(
      "authorized-resellable-nft",
      "get-resale-history",
      [Cl.uint(1), Cl.uint(0)],
      deployer
    );
    const historyResult = result as any;
    expect(historyResult.type).toBe('ok');
  });
});
