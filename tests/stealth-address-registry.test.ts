import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("stealth-address-registry", () => {
  describe("register-keys", () => {
    it("allows registering stealth meta-address", () => {
      const metaAddress = Cl.buffer(Uint8Array.from(Array(66).fill(1)));
      const { result } = simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys",
        [Cl.uint(1), metaAddress],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows updating stealth meta-address", () => {
      const metaAddress1 = Cl.buffer(Uint8Array.from(Array(66).fill(1)));
      const metaAddress2 = Cl.buffer(Uint8Array.from(Array(66).fill(2)));
      
      simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys",
        [Cl.uint(1), metaAddress1],
        alice
      );
      
      const { result } = simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys",
        [Cl.uint(1), metaAddress2],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows different scheme IDs for same registrant", () => {
      const metaAddress1 = Cl.buffer(Uint8Array.from(Array(66).fill(1)));
      const metaAddress2 = Cl.buffer(Uint8Array.from(Array(66).fill(2)));
      
      simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys",
        [Cl.uint(1), metaAddress1],
        alice
      );
      
      const { result } = simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys",
        [Cl.uint(2), metaAddress2],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("get-stealth-meta-address", () => {
    it("returns registered meta-address", () => {
      const metaAddress = Cl.buffer(Uint8Array.from(Array(66).fill(1)));
      
      simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys",
        [Cl.uint(1), metaAddress],
        alice
      );
      
      const { result } = simnet.callReadOnlyFn(
        "stealth-address-registry",
        "get-stealth-meta-address",
        [Cl.standardPrincipal(alice), Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.some(Cl.tuple({ "meta-address": metaAddress })));
    });

    it("returns none for unregistered address", () => {
      const { result } = simnet.callReadOnlyFn(
        "stealth-address-registry",
        "get-stealth-meta-address",
        [Cl.standardPrincipal(bob), Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("increment-nonce", () => {
    it("increments nonce for sender", () => {
      const { result } = simnet.callPublicFn(
        "stealth-address-registry",
        "increment-nonce",
        [],
        alice
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments nonce multiple times", () => {
      simnet.callPublicFn("stealth-address-registry", "increment-nonce", [], alice);
      const { result } = simnet.callPublicFn("stealth-address-registry", "increment-nonce", [], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("get-nonce", () => {
    it("returns zero for new account", () => {
      const { result } = simnet.callReadOnlyFn(
        "stealth-address-registry",
        "get-nonce",
        [Cl.standardPrincipal(charlie)],
        alice
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns incremented nonce", () => {
      simnet.callPublicFn("stealth-address-registry", "increment-nonce", [], alice);
      const { result } = simnet.callReadOnlyFn(
        "stealth-address-registry",
        "get-nonce",
        [Cl.standardPrincipal(alice)],
        alice
      );
      expect(result).toBeOk(Cl.uint(1));
    });
  });

  describe("register-keys-on-behalf", () => {
    it("allows registering with signature", () => {
      const metaAddress = Cl.buffer(Uint8Array.from(Array(66).fill(1)));
      const signature = Cl.buffer(Uint8Array.from(Array(65).fill(1)));
      
      const { result } = simnet.callPublicFn(
        "stealth-address-registry",
        "register-keys-on-behalf",
        [Cl.standardPrincipal(alice), Cl.uint(1), metaAddress, signature],
        bob
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
