import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("multi-redemption-nft", () => {
  describe("mint", () => {
    it("allows minting a new NFT", () => {
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "mint",
        [Cl.standardPrincipal(alice), Cl.stringAscii("test-uri")],
        alice
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs for each mint", () => {
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri-1")], alice);
      const { result } = simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri-2")], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer NFT", () => {
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        bob
      );
      expect(result).toBeErr(Cl.uint(200));
    });
  });

  describe("redeem", () => {
    it("allows redemption by token owner", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const memo = Cl.stringUtf8("Redeemed for event ticket");
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "redeem",
        [redemptionId, Cl.uint(1), memo],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from redeeming", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const memo = Cl.stringUtf8("Unauthorized redemption");
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "redeem",
        [redemptionId, Cl.uint(1), memo],
        bob
      );
      expect(result).toBeErr(Cl.uint(200));
    });

    it("prevents duplicate redemption", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const memo = Cl.stringUtf8("First redemption");
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      simnet.callPublicFn("multi-redemption-nft", "redeem", [redemptionId, Cl.uint(1), memo], alice);
      
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "redeem",
        [redemptionId, Cl.uint(1), memo],
        alice
      );
      expect(result).toBeErr(Cl.uint(202));
    });

    it("allows multiple redemptions with different IDs", () => {
      const redemptionId1 = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const redemptionId2 = Cl.buffer(Uint8Array.from(Array(32).fill(2)));
      const memo = Cl.stringUtf8("Multiple redemptions");
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      simnet.callPublicFn("multi-redemption-nft", "redeem", [redemptionId1, Cl.uint(1), memo], alice);
      
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "redeem",
        [redemptionId2, Cl.uint(1), memo],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("cancel", () => {
    it("allows operator to cancel redemption", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const memo = Cl.stringUtf8("Cancellation");
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      simnet.callPublicFn("multi-redemption-nft", "redeem", [redemptionId, Cl.uint(1), Cl.stringUtf8("Original")], alice);
      
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "cancel",
        [redemptionId, Cl.uint(1), memo],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("fails to cancel non-existent redemption", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      const memo = Cl.stringUtf8("Cancellation");
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      
      const { result } = simnet.callPublicFn(
        "multi-redemption-nft",
        "cancel",
        [redemptionId, Cl.uint(1), memo],
        alice
      );
      expect(result).toBeErr(Cl.uint(201));
    });
  });

  describe("is-redeemed", () => {
    it("returns true for redeemed token", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      simnet.callPublicFn("multi-redemption-nft", "redeem", [redemptionId, Cl.uint(1), Cl.stringUtf8("Test")], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "multi-redemption-nft",
        "is-redeemed",
        [Cl.standardPrincipal(alice), redemptionId, Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("returns false for non-redeemed token", () => {
      const redemptionId = Cl.buffer(Uint8Array.from(Array(32).fill(1)));
      
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "multi-redemption-nft",
        "is-redeemed",
        [Cl.standardPrincipal(alice), redemptionId, Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.bool(false));
    });
  });

  describe("get-owner", () => {
    it("returns owner of minted NFT", () => {
      simnet.callPublicFn("multi-redemption-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "multi-redemption-nft",
        "get-owner",
        [Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.some(Cl.standardPrincipal(alice)));
    });

    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(
        "multi-redemption-nft",
        "get-owner",
        [Cl.uint(999)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });
});
