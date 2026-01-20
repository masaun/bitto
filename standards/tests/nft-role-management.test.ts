import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("nft-role-management contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint NFT", () => {
    const { result } = simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should grant role to account", () => {
    const futureTime = simnet.blockHeight + 1000;
    const roleData = new Uint8Array(10).fill(99);
    
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "nft-role-management",
      "grant-role",
      [
        Cl.uint(1),
        Cl.stringAscii("admin"),
        Cl.principal(wallet2),
        Cl.uint(futureTime),
        Cl.bool(true),
        Cl.buffer(roleData)
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get role data", () => {
    const futureTime = simnet.blockHeight + 1000;
    const roleData = new Uint8Array(10).fill(88);
    
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "nft-role-management",
      "grant-role",
      [
        Cl.uint(1),
        Cl.stringAscii("moderator"),
        Cl.principal(wallet2),
        Cl.uint(futureTime),
        Cl.bool(false),
        Cl.buffer(roleData)
      ],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "nft-role-management",
      "get-role-data",
      [Cl.uint(1), Cl.stringAscii("moderator")],
      deployer
    );
    const roleResult = result as any;
    expect(roleResult.type).toBe('ok');
  });

  it("should check if account has role", () => {
    const futureTime = simnet.blockHeight + 1000;
    const roleData = new Uint8Array(5).fill(77);
    
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "nft-role-management",
      "grant-role",
      [Cl.uint(1), Cl.stringAscii("editor"), Cl.principal(wallet2), Cl.uint(futureTime), Cl.bool(true), Cl.buffer(roleData)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "nft-role-management",
      "has-role",
      [Cl.uint(1), Cl.stringAscii("editor"), Cl.principal(wallet2)],
      deployer
    );
    const hasRoleResult = result as any;
    expect(hasRoleResult.type).toBe('ok');
  });

  it("should revoke revocable role", () => {
    const futureTime = simnet.blockHeight + 1000;
    const roleData = new Uint8Array(5).fill(66);
    
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "nft-role-management",
      "grant-role",
      [
        Cl.uint(1),
        Cl.stringAscii("viewer"),
        Cl.principal(wallet2),
        Cl.uint(futureTime),
        Cl.bool(true),
        Cl.buffer(roleData)
      ],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "nft-role-management",
      "revoke-role",
      [Cl.uint(1), Cl.stringAscii("viewer")],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not revoke non-revocable role", () => {
    const futureTime = simnet.blockHeight + 1000;
    const roleData = new Uint8Array(5).fill(55);
    
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "nft-role-management",
      "grant-role",
      [
        Cl.uint(1),
        Cl.stringAscii("owner"),
        Cl.principal(wallet2),
        Cl.uint(futureTime),
        Cl.bool(false),
        Cl.buffer(roleData)
      ],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "nft-role-management",
      "revoke-role",
      [Cl.uint(1), Cl.stringAscii("owner")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should approve role operator", () => {
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "nft-role-management",
      "approve-role",
      [Cl.uint(1), Cl.stringAscii("manager"), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get role expiration", () => {
    const futureTime = simnet.blockHeight + 5000;
    const roleData = new Uint8Array(3).fill(44);
    
    simnet.callPublicFn(
      "nft-role-management",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "nft-role-management",
      "grant-role",
      [
        Cl.uint(1),
        Cl.stringAscii("temp"),
        Cl.principal(wallet2),
        Cl.uint(futureTime),
        Cl.bool(true),
        Cl.buffer(roleData)
      ],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "nft-role-management",
      "get-role-expiration",
      [Cl.uint(1), Cl.stringAscii("temp")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(futureTime));
  });
});
