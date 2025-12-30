import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("ac-registry contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should register contract with admin", () => {
    const { result } = simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract info", () => {
    simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "ac-registry",
      "get-contract-info",
      [Cl.principal(deployer)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "is-active": Cl.bool(true),
      admin: Cl.principal(wallet1)
    }));
  });

  it("should grant role to account", () => {
    simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const role = new Uint8Array(32);
    role[0] = 1;
    
    const { result } = simnet.callPublicFn(
      "ac-registry",
      "grant-role",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if account has role", () => {
    simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const role = new Uint8Array(32);
    role[0] = 1;
    
    simnet.callPublicFn(
      "ac-registry",
      "grant-role",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "ac-registry",
      "has-role",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should revoke role from account", () => {
    simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const role = new Uint8Array(32);
    role[0] = 1;
    
    simnet.callPublicFn(
      "ac-registry",
      "grant-role",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "ac-registry",
      "revoke-role",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should unregister contract", () => {
    simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ac-registry",
      "unregister-contract",
      [Cl.principal(deployer)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get role info", () => {
    simnet.callPublicFn(
      "ac-registry",
      "register-contract",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const role = new Uint8Array(32);
    role[0] = 1;
    
    simnet.callPublicFn(
      "ac-registry",
      "grant-role",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "ac-registry",
      "get-role-info",
      [Cl.principal(deployer), Cl.buffer(role), Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "ac-registry",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});
