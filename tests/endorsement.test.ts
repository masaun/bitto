import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("endorsement contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should submit endorsement", () => {
    const functionHash = new Uint8Array(32);
    functionHash[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    const { result } = simnet.callPublicFn(
      "endorsement",
      "submit-endorsement",
      [
        Cl.buffer(functionHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.buffer(signature)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should verify endorsement is valid", () => {
    const functionHash = new Uint8Array(32);
    functionHash[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "endorsement",
      "submit-endorsement",
      [
        Cl.buffer(functionHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.buffer(signature)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "endorsement",
      "verify-endorsement",
      [Cl.buffer(functionHash), Cl.uint(1), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should check if nonce is used", () => {
    const functionHash = new Uint8Array(32);
    functionHash[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "endorsement",
      "submit-endorsement",
      [
        Cl.buffer(functionHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.buffer(signature)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "endorsement",
      "is-nonce-used",
      [Cl.principal(wallet1), Cl.uint(1)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should get endorsement details", () => {
    const functionHash = new Uint8Array(32);
    functionHash[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "endorsement",
      "submit-endorsement",
      [
        Cl.buffer(functionHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.buffer(signature)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "endorsement",
      "get-endorsement",
      [Cl.buffer(functionHash), Cl.uint(1), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "valid-until": Cl.uint(1000),
      signature: Cl.buffer(signature),
      used: Cl.bool(false)
    }));
  });

  it("should not allow duplicate nonce", () => {
    const functionHash = new Uint8Array(32);
    functionHash[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "endorsement",
      "submit-endorsement",
      [
        Cl.buffer(functionHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.buffer(signature)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "endorsement",
      "submit-endorsement",
      [
        Cl.buffer(functionHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.buffer(signature)
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "endorsement",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});
