import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("key-bound-nft", () => {
  describe("mint", () => {
    it("allows minting a new NFT", () => {
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "mint",
        [Cl.standardPrincipal(alice)],
        alice
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs for each mint", () => {
      simnet.callPublicFn("key-bound-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      const { result } = simnet.callPublicFn("key-bound-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("add-bindings", () => {
    it("allows adding key wallets", () => {
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "add-bindings",
        [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents same key wallets", () => {
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "add-bindings",
        [Cl.standardPrincipal(bob), Cl.standardPrincipal(bob)],
        alice
      );
      expect(result).toBeErr(Cl.uint(302));
    });

    it("prevents holder as key wallet", () => {
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "add-bindings",
        [Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        alice
      );
      expect(result).toBeErr(Cl.uint(302));
    });

    it("prevents duplicate binding", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "add-bindings",
        [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)],
        alice
      );
      expect(result).toBeErr(Cl.uint(305));
    });
  });

  describe("reset-bindings", () => {
    it("allows key wallet to reset bindings", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "reset-bindings",
        [Cl.standardPrincipal(alice)],
        bob
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-key wallet from resetting", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "reset-bindings",
        [Cl.standardPrincipal(alice)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(300));
    });
  });

  describe("safe-fallback", () => {
    it("allows key wallet to activate fallback", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "safe-fallback",
        [Cl.standardPrincipal(alice)],
        bob
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-key wallet from fallback", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "safe-fallback",
        [Cl.standardPrincipal(alice)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(300));
    });
  });

  describe("allow-transfer", () => {
    it("allows key wallet to set transfer conditions", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "allow-transfer",
        [Cl.uint(1), Cl.uint(100), Cl.standardPrincipal(bob), Cl.bool(false)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-secured wallet from setting conditions", () => {
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "allow-transfer",
        [Cl.uint(1), Cl.uint(100), Cl.standardPrincipal(bob), Cl.bool(false)],
        bob
      );
      expect(result).toBeErr(Cl.uint(300));
    });
  });

  describe("allow-approval", () => {
    it("allows key wallet to set approval conditions", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "allow-approval",
        [Cl.uint(100), Cl.uint(5)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("transfer", () => {
    it("allows unsecured transfer", () => {
      simnet.callPublicFn("key-bound-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized transfer", () => {
      simnet.callPublicFn("key-bound-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callPublicFn(
        "key-bound-nft",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        bob
      );
      expect(result).toBeErr(Cl.uint(300));
    });
  });

  describe("get-bindings", () => {
    it("returns bindings for secured account", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "key-bound-nft",
        "get-bindings",
        [Cl.standardPrincipal(alice)],
        alice
      );
      expect(result).toBeOk(Cl.some(Cl.tuple({
        "key-wallet-1": Cl.standardPrincipal(bob),
        "key-wallet-2": Cl.standardPrincipal(charlie)
      })));
    });

    it("returns none for unsecured account", () => {
      const { result } = simnet.callReadOnlyFn(
        "key-bound-nft",
        "get-bindings",
        [Cl.standardPrincipal(deployer)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("is-secure-wallet", () => {
    it("returns true for secured wallet", () => {
      simnet.callPublicFn("key-bound-nft", "add-bindings", [Cl.standardPrincipal(bob), Cl.standardPrincipal(charlie)], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "key-bound-nft",
        "is-secure-wallet",
        [Cl.standardPrincipal(alice)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("returns false for unsecured wallet", () => {
      const { result } = simnet.callReadOnlyFn(
        "key-bound-nft",
        "is-secure-wallet",
        [Cl.standardPrincipal(deployer)],
        alice
      );
      expect(result).toBeOk(Cl.bool(false));
    });
  });
});
