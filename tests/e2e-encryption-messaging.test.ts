import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("e2e-encryption-messaging contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should update public key", () => {
    const publicKey = new Uint8Array(33).fill(123);
    
    const { result } = simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get user public key", () => {
    const publicKey = new Uint8Array(33).fill(234);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "e2e-encryption-messaging",
      "get-public-key",
      [Cl.principal(wallet1)],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
  });

  it("should send encrypted message", () => {
    const publicKey = new Uint8Array(33).fill(111);
    const encryptedMsg = new Uint8Array(100).fill(222);
    const sessionId = new Uint8Array(32).fill(333);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet2
    );
    
    const { result } = simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [
        Cl.principal(wallet2),
        Cl.buffer(encryptedMsg),
        Cl.buffer(sessionId)
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("should get message count for recipient", () => {
    const publicKey = new Uint8Array(33).fill(100);
    const encryptedMsg = new Uint8Array(50).fill(200);
    const sessionId = new Uint8Array(32).fill(150);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet2
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [Cl.principal(wallet2), Cl.buffer(encryptedMsg), Cl.buffer(sessionId)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "e2e-encryption-messaging",
      "get-message-count",
      [Cl.principal(wallet1), Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get message details", () => {
    const publicKey = new Uint8Array(33).fill(44);
    const encryptedMsg = new Uint8Array(75).fill(88);
    const sessionId = new Uint8Array(32).fill(66);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet2
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [Cl.principal(wallet2), Cl.buffer(encryptedMsg), Cl.buffer(sessionId)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "e2e-encryption-messaging",
      "get-message",
      [Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(0)],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
  });

  it("should not send message without recipient public key", () => {
    const publicKey = new Uint8Array(33).fill(77);
    const encryptedMsg = new Uint8Array(50).fill(99);
    const sessionId = new Uint8Array(32).fill(55);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [Cl.principal(wallet2), Cl.buffer(encryptedMsg), Cl.buffer(sessionId)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });

  it("should delete message by recipient", () => {
    const publicKey = new Uint8Array(33).fill(33);
    const encryptedMsg = new Uint8Array(60).fill(66);
    const sessionId = new Uint8Array(32).fill(99);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet2
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [Cl.principal(wallet2), Cl.buffer(encryptedMsg), Cl.buffer(sessionId)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "e2e-encryption-messaging",
      "delete-message",
      [Cl.principal(wallet2), Cl.uint(0)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not delete message by non-recipient", () => {
    const publicKey = new Uint8Array(33).fill(22);
    const encryptedMsg = new Uint8Array(55).fill(44);
    const sessionId = new Uint8Array(32).fill(88);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet2
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [Cl.principal(wallet2), Cl.buffer(encryptedMsg), Cl.buffer(sessionId)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "e2e-encryption-messaging",
      "delete-message",
      [Cl.principal(wallet2), Cl.uint(0)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(102));
  });

  it("should get sent message count", () => {
    const publicKey = new Uint8Array(33).fill(11);
    const encryptedMsg = new Uint8Array(40).fill(22);
    const sessionId = new Uint8Array(32).fill(33);
    
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet1
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "update-public-key",
      [Cl.buffer(publicKey), Cl.stringAscii("secp256r1")],
      wallet2
    );
    simnet.callPublicFn(
      "e2e-encryption-messaging",
      "send-message",
      [Cl.principal(wallet2), Cl.buffer(encryptedMsg), Cl.buffer(sessionId)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "e2e-encryption-messaging",
      "get-message-count",
      [Cl.principal(wallet1), Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });
});
