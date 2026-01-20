import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("parent-child-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint parent NFT", () => {
    const { result } = simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should mint child NFT", () => {
    const { result } = simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get parent info", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "parent-child-nft",
      "get-parent-info",
      [Cl.uint(1)],
      deployer
    );
    const parentResult = result as any;
    expect(parentResult.type).toBe('ok');
  });

  it("should get child info", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "parent-child-nft",
      "get-child-info",
      [Cl.uint(1)],
      deployer
    );
    const childResult = result as any;
    expect(childResult.type).toBe('ok');
  });

  it("should propose adding child to parent", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet2)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "parent-child-nft",
      "propose-add-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should accept child proposal", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "propose-add-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "parent-child-nft",
      "accept-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get parent of child", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "propose-add-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet1
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "accept-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet2
    );
    
    const { result } = simnet.callReadOnlyFn(
      "parent-child-nft",
      "get-parent-of-child",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.uint(1)));
  });

  it("should remove child from parent", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "propose-add-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet1
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "accept-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet2
    );
    
    const { result } = simnet.callPublicFn(
      "parent-child-nft",
      "remove-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not accept child without proposal", () => {
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-parent",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "parent-child-nft",
      "mint-child",
      [Cl.principal(wallet2)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "parent-child-nft",
      "accept-child",
      [Cl.uint(1), Cl.uint(1)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(103));
  });
});
