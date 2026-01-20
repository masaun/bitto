import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("multi-asset-vault contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should add asset to vault", () => {
    const { result } = simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get vault asset info", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "multi-asset-vault",
      "get-vault-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    const assetResult = result as any;
    expect(assetResult.type).toBe('ok');
  });

  it("should get asset count", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet2)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "multi-asset-vault",
      "get-asset-count",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(2));
  });

  it("should deposit to vault", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "multi-asset-vault",
      "deposit",
      [Cl.principal(wallet1), Cl.uint(1000)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get user shares for asset", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "multi-asset-vault",
      "deposit",
      [Cl.principal(wallet1), Cl.uint(500)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "multi-asset-vault",
      "get-user-shares",
      [Cl.principal(wallet1), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(500));
  });

  it("should withdraw from vault", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "multi-asset-vault",
      "deposit",
      [Cl.principal(wallet1), Cl.uint(2000)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "multi-asset-vault",
      "withdraw",
      [Cl.principal(wallet1), Cl.uint(500)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not withdraw more than balance", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "multi-asset-vault",
      "deposit",
      [Cl.principal(wallet1), Cl.uint(100)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "multi-asset-vault",
      "withdraw",
      [Cl.principal(wallet1), Cl.uint(500)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should transfer shares between users", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "multi-asset-vault",
      "deposit",
      [Cl.principal(wallet1), Cl.uint(1500)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "multi-asset-vault",
      "transfer-shares",
      [Cl.principal(wallet1), Cl.uint(300), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get total assets", () => {
    simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "multi-asset-vault",
      "deposit",
      [Cl.principal(wallet1), Cl.uint(3000)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "multi-asset-vault",
      "get-total-assets",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(3000));
  });

  it("should not add asset by non-owner", () => {
    const { result } = simnet.callPublicFn(
      "multi-asset-vault",
      "add-asset",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });
});
