import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("non-addr-held-device-sig-verifier contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should register key", () => {
    const key = new Uint8Array(33);
    key[0] = 2;
    for (let i = 1; i < 33; i++) key[i] = i;
    
    const { result } = simnet.callPublicFn(
      "non-addr-held-device-sig-verifier",
      "register-key",
      [Cl.buffer(key)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if key is registered", () => {
    const key = new Uint8Array(33);
    key[0] = 2;
    for (let i = 1; i < 33; i++) key[i] = i;
    
    simnet.callPublicFn(
      "non-addr-held-device-sig-verifier",
      "register-key",
      [Cl.buffer(key)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "non-addr-held-device-sig-verifier",
      "is-key-registered",
      [Cl.buffer(key)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should unregister key", () => {
    const key = new Uint8Array(33);
    key[0] = 2;
    for (let i = 1; i < 33; i++) key[i] = i;
    
    simnet.callPublicFn(
      "non-addr-held-device-sig-verifier",
      "register-key",
      [Cl.buffer(key)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "non-addr-held-device-sig-verifier",
      "unregister-key",
      [Cl.buffer(key)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should verify signature", () => {
    const key = new Uint8Array(33);
    key[0] = 2;
    for (let i = 1; i < 33; i++) key[i] = i;
    
    const msgHash = new Uint8Array(32);
    msgHash[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 1;
    
    simnet.callPublicFn(
      "non-addr-held-device-sig-verifier",
      "register-key",
      [Cl.buffer(key)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "non-addr-held-device-sig-verifier",
      "verify",
      [Cl.buffer(msgHash), Cl.buffer(signature), Cl.buffer(key)],
      deployer
    );
    expect(result).toBeBuffer(new Uint8Array([2, 74, 211, 24]));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "non-addr-held-device-sig-verifier",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});
