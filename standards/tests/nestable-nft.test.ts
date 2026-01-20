import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("nestable-nft", () => {
  describe("mint", () => {
    it("allows minting a new NFT", () => {
      const { result } = simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("test-uri")], alice);
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs for each mint", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri-1")], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri-2")], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("nest-mint", () => {
    it("allows minting a child NFT", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent-uri")], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child-uri")
      ], alice);
      expect(result).toBeOk(Cl.uint(2));
    });

    it("prevents circular nesting", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("token-1")], alice);
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("token-2")], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child")
      ], alice);
      expect(result).toBeOk(Cl.uint(3));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer NFT", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("accept-child", () => {
    it("allows parent owner to accept pending child", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent")], alice);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "accept-child", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(2),
        Cl.standardPrincipal(alice)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from accepting child", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent")], alice);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "accept-child", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(2),
        Cl.standardPrincipal(alice)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("reject-all-children", () => {
    it("allows parent owner to reject all pending children", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent")], alice);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child-1")
      ], bob);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(charlie),
        Cl.stringAscii("child-2")
      ], charlie);
      const { result } = simnet.callPublicFn("nestable-nft", "reject-all-children", [
        Cl.uint(1),
        Cl.uint(10)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("burn", () => {
    it("allows burning an NFT without children", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "burn", [
        Cl.uint(1),
        Cl.uint(0)
      ], alice);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("prevents burning NFT with children", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent")], alice);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child")
      ], alice);
      simnet.callPublicFn("nestable-nft", "accept-child", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(2),
        Cl.standardPrincipal(alice)
      ], alice);
      const { result } = simnet.callPublicFn("nestable-nft", "burn", [
        Cl.uint(1),
        Cl.uint(0)
      ], alice);
      expect(result).toBeErr(Cl.uint(106));
    });
  });

  describe("read-only functions", () => {
    it("get-direct-owner returns NFT owner", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("uri")], alice);
      const { result } = simnet.callReadOnlyFn("nestable-nft", "get-direct-owner", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.tuple({ "parent-id": Cl.uint(0), "parent-contract": Cl.none(), "is-nft": Cl.bool(false) }));
    });

    it("get-children returns active children", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent")], alice);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child")
      ], alice);
      simnet.callPublicFn("nestable-nft", "accept-child", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(2),
        Cl.standardPrincipal(alice)
      ], alice);
      const { result } = simnet.callReadOnlyFn("nestable-nft", "get-children", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.list([Cl.tuple({ "child-id": Cl.uint(2), "child-contract": Cl.standardPrincipal(alice) })]));
    });

    it("get-pending-children returns pending children", () => {
      simnet.callPublicFn("nestable-nft", "mint", [Cl.standardPrincipal(alice), Cl.stringAscii("parent")], alice);
      simnet.callPublicFn("nestable-nft", "nest-mint", [
        Cl.uint(1),
        Cl.standardPrincipal(bob),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callReadOnlyFn("nestable-nft", "get-pending-children", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.list([Cl.tuple({ "child-id": Cl.uint(2), "child-contract": Cl.standardPrincipal(alice) })]));
    });
  });
});
