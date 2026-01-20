import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("async-vault-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should request deposit", () => {
    const { result } = simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(1000)],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should get deposit request", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(500)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "async-vault-token",
      "get-deposit-request",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
    expect(resultData.value.value.value.amount.value).toBe(500n);
    expect(resultData.value.value.value.fulfilled.type).toBe('false');
  });

  it("should fulfill deposit request", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(2000)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(2000));
  });

  it("should not fulfill already fulfilled deposit", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(1500)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should request redemption", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(3000)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "async-vault-token",
      "request-redeem",
      [Cl.uint(1000)],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should get redeem request", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(2500)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    simnet.callPublicFn(
      "async-vault-token",
      "request-redeem",
      [Cl.uint(500)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "async-vault-token",
      "get-redeem-request",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    const depositResult = result as any;
    expect(depositResult.type).toBe('ok');
    expect(depositResult.value.type).toBe('some');
    expect(depositResult.value.value.value.shares.value).toBe(500n);
    expect(depositResult.value.value.value.fulfilled.type).toBe('false');
  });

  it("should fulfill redeem request", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(4000)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    simnet.callPublicFn(
      "async-vault-token",
      "request-redeem",
      [Cl.uint(2000)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "async-vault-token",
      "fulfill-redeem",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(2000));
  });

  it("should get user balance", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(1800)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "async-vault-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1800));
  });

  it("should get total assets", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(5000)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "async-vault-token",
      "get-total-assets",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(5000));
  });

  it("should get total shares", () => {
    simnet.callPublicFn(
      "async-vault-token",
      "request-deposit",
      [Cl.uint(6000)],
      wallet1
    );
    simnet.callPublicFn(
      "async-vault-token",
      "fulfill-deposit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "async-vault-token",
      "get-total-shares",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(6000));
  });
});
