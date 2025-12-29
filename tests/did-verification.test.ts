import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("did-verification contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should create identity", () => {
    const identityHash = new Uint8Array(32).fill(123);
    const verificationHash = new Uint8Array(32).fill(234);
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get DID document", () => {
    const identityHash = new Uint8Array(32).fill(234);
    const verificationHash = new Uint8Array(32).fill(111);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "did-verification",
      "get-identity",
      [Cl.principal(wallet1)],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
  });

  it("should update DID document", () => {
    const identityHash1 = new Uint8Array(32).fill(111);
    const verificationHash1 = new Uint8Array(32).fill(111 + 50);
    const identityHash2 = new Uint8Array(32).fill(222);
    const verificationHash2 = new Uint8Array(32).fill(222 + 50);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash1), Cl.buffer(verificationHash1)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "update-identity",
      [Cl.buffer(identityHash2), Cl.buffer(verificationHash2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should add verifier", () => {
    const { result } = simnet.callPublicFn(
      "did-verification",
      "authorize-verifier",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if verifier is authorized", () => {
    simnet.callPublicFn(
      "did-verification",
      "authorize-verifier",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "did-verification",
      "is-verifier",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should verify identity by authorized verifier", () => {
    const identityHash = new Uint8Array(32).fill(55);
    const verificationHash = new Uint8Array(32).fill(105);
    const proofHash = new Uint8Array(32).fill(105); // matches verificationHash
    const signature = new Uint8Array(65).fill(66);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    simnet.callPublicFn(
      "did-verification",
      "authorize-verifier",
      [Cl.principal(wallet2)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "verify-identity",
      [
        Cl.principal(wallet1),
        Cl.buffer(proofHash),
        Cl.buffer(signature)
      ],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not verify identity by unauthorized verifier", () => {
    const identityHash = new Uint8Array(32).fill(77);
    const verificationHash = new Uint8Array(32).fill(127);
    const proofHash = new Uint8Array(32).fill(127);
    const signature = new Uint8Array(65).fill(88);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "verify-identity",
      [
        Cl.principal(wallet1),
        Cl.buffer(proofHash),
        Cl.buffer(signature)
      ],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  it("should get verification history", () => {
    const identityHash = new Uint8Array(32).fill(44);
    const verificationHash = new Uint8Array(32).fill(94);
    const proofHash = new Uint8Array(32).fill(94);
    const signature = new Uint8Array(65).fill(33);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    simnet.callPublicFn(
      "did-verification",
      "authorize-verifier",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "did-verification",
      "verify-identity",
      [
        Cl.principal(wallet1),
        Cl.buffer(proofHash),
        Cl.buffer(signature)
      ],
      wallet2
    );
    
    const { result } = simnet.callReadOnlyFn(
      "did-verification",
      "get-verification-history",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
  });

  it("should check if identity is verified", () => {
    const identityHash = new Uint8Array(32).fill(22);
    const verificationHash = new Uint8Array(32).fill(72);
    const proofHash = new Uint8Array(32).fill(72);
    const signature = new Uint8Array(65).fill(11);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    simnet.callPublicFn(
      "did-verification",
      "authorize-verifier",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "did-verification",
      "verify-identity",
      [
        Cl.principal(wallet1),
        Cl.buffer(proofHash),
        Cl.buffer(signature)
      ],
      wallet2
    );
    
    const { result } = simnet.callReadOnlyFn(
      "did-verification",
      "is-verified",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should revoke identity", () => {
    const identityHash = new Uint8Array(32).fill(99);
    const verificationHash = new Uint8Array(32).fill(149);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash), Cl.buffer(verificationHash)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "revoke-identity",
      [],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should remove verifier", () => {
    simnet.callPublicFn(
      "did-verification",
      "authorize-verifier",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "revoke-verifier",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should update identity", () => {
    const identityHash1 = new Uint8Array(32).fill(111);
    const verificationHash1 = new Uint8Array(32).fill(161);
    const identityHash2 = new Uint8Array(32).fill(222);
    const verificationHash2 = new Uint8Array(32).fill(162);
    
    simnet.callPublicFn(
      "did-verification",
      "create-identity",
      [Cl.buffer(identityHash1), Cl.buffer(verificationHash1)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "did-verification",
      "update-identity",
      [Cl.buffer(identityHash2), Cl.buffer(verificationHash2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });
});
