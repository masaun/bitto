import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("aggregated-ids-nft", () => {
  describe("mint", () => {
    it("allows minting a new NFT", () => {
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "mint",
        [Cl.standardPrincipal(alice)],
        alice
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs for each mint", () => {
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      const { result } = simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer NFT", () => {
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        bob
      );
      expect(result).toBeErr(Cl.uint(500));
    });
  });

  describe("set-identities-root", () => {
    it("allows owner to set identities root", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "set-identities-root",
        [Cl.uint(1), root],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from setting root", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "set-identities-root",
        [Cl.uint(1), root],
        bob
      );
      expect(result).toBeErr(Cl.uint(500));
    });

    it("fails for non-existent token", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "set-identities-root",
        [Cl.uint(999), root],
        alice
      );
      expect(result).toBeErr(Cl.uint(501));
    });

    it("allows updating identities root", () => {
      const root1 = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const root2 = Cl.buffer(Uint8Array.from(Array(32).fill(2)));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      simnet.callPublicFn("aggregated-ids-nft", "set-identities-root", [Cl.uint(1), root1], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "set-identities-root",
        [Cl.uint(1), root2],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("get-identities-root", () => {
    it("returns set identities root", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      simnet.callPublicFn("aggregated-ids-nft", "set-identities-root", [Cl.uint(1), root], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "aggregated-ids-nft",
        "get-identities-root",
        [Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.some(root));
    });

    it("returns none for unset root", () => {
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "aggregated-ids-nft",
        "get-identities-root",
        [Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("verify-identities-binding", () => {
    it("verifies valid identities binding", () => {
      const userIds = Cl.list([]);
      const signature = Cl.buffer(Uint8Array.from(Array(65).fill(1)));
      const root = Cl.buffer(new Uint8Array(32).fill(0));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      simnet.callPublicFn("aggregated-ids-nft", "set-identities-root", [Cl.uint(1), root], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "verify-identities-binding",
        [Cl.uint(1), Cl.standardPrincipal(alice), userIds, root, signature],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("fails for non-existent token", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const userIds = Cl.list([Cl.stringUtf8("user@example.com")]);
      const signature = Cl.buffer(Uint8Array.from(Array(65).fill(1)));
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "verify-identities-binding",
        [Cl.uint(999), Cl.standardPrincipal(alice), userIds, root, signature],
        alice
      );
      expect(result).toBeErr(Cl.uint(501));
    });

    it("fails for wrong owner", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const userIds = Cl.list([Cl.stringUtf8("user@example.com")]);
      const signature = Cl.buffer(Uint8Array.from(Array(65).fill(1)));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      simnet.callPublicFn("aggregated-ids-nft", "set-identities-root", [Cl.uint(1), root], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "verify-identities-binding",
        [Cl.uint(1), Cl.standardPrincipal(bob), userIds, root, signature],
        alice
      );
      expect(result).toBeErr(Cl.uint(500));
    });

    it("fails for mismatched root", () => {
      const root = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const wrongRoot = Cl.buffer(Uint8Array.from(Array(32).fill(2)));
      const userIds = Cl.list([Cl.stringUtf8("user@example.com")]);
      const signature = Cl.buffer(Uint8Array.from(Array(65).fill(1)));
      
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      simnet.callPublicFn("aggregated-ids-nft", "set-identities-root", [Cl.uint(1), root], alice);
      
      const { result } = simnet.callPublicFn(
        "aggregated-ids-nft",
        "verify-identities-binding",
        [Cl.uint(1), Cl.standardPrincipal(alice), userIds, wrongRoot, signature],
        alice
      );
      expect(result).toBeErr(Cl.uint(502));
    });
  });

  describe("get-owner", () => {
    it("returns owner of minted NFT", () => {
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "aggregated-ids-nft",
        "get-owner",
        [Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.some(Cl.standardPrincipal(alice)));
    });

    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(
        "aggregated-ids-nft",
        "get-owner",
        [Cl.uint(999)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("get-last-token-id", () => {
    it("returns zero before any mints", () => {
      const { result } = simnet.callReadOnlyFn(
        "aggregated-ids-nft",
        "get-last-token-id",
        [],
        alice
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns last minted token ID", () => {
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(alice)], alice);
      simnet.callPublicFn("aggregated-ids-nft", "mint", [Cl.standardPrincipal(bob)], bob);
      
      const { result } = simnet.callReadOnlyFn(
        "aggregated-ids-nft",
        "get-last-token-id",
        [],
        alice
      );
      expect(result).toBeOk(Cl.uint(2));
    });
  });
});
