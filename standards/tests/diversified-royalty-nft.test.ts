import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("diversified-royalty-nft", () => {
  describe("mint", () => {
    it("allows minting a new NFT", () => {
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("test-uri")
      ], deployer);
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri-1")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(bob),
        Cl.stringAscii("uri-2")
      ], deployer);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer NFT", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("marketplace", () => {
    it("allows listing an NFT", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "list-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.uint(999999999999),
        Cl.none()
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents listing by non-owner", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "list-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.uint(999999999999),
        Cl.none()
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });

    it("allows delisting an NFT", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("diversified-royalty-nft", "list-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.uint(999999999999),
        Cl.none()
      ], alice);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "delist-item", [
        Cl.uint(1)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows buying a listed NFT", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("diversified-royalty-nft", "list-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.uint(999999999999),
        Cl.none()
      ], alice);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "buy-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.none()
      ], bob);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents buying unlisted NFT", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "buy-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.none()
      ], bob);
      expect(result).toBeErr(Cl.uint(103));
    });
  });

  describe("royalties", () => {
    it("allows setting royalty percentage", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "set-royalty", [
        Cl.standardPrincipal(alice),
        Cl.uint(500)
      ], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents setting royalty above maximum", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("diversified-royalty-nft", "set-royalty", [
        Cl.standardPrincipal(alice),
        Cl.uint(3000)
      ], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("calculates royalties on profit only", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("diversified-royalty-nft", "set-royalty", [
        Cl.standardPrincipal(deployer),
        Cl.uint(1000)
      ], deployer);
      simnet.callPublicFn("diversified-royalty-nft", "list-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.uint(999999999999),
        Cl.none()
      ], alice);
      simnet.callPublicFn("diversified-royalty-nft", "buy-item", [
        Cl.uint(1),
        Cl.uint(1000000),
        Cl.none()
      ], bob);
      simnet.callPublicFn("diversified-royalty-nft", "list-item", [
        Cl.uint(1),
        Cl.uint(2000000),
        Cl.uint(999999999999),
        Cl.none()
      ], bob);
      const { result } = simnet.callReadOnlyFn("diversified-royalty-nft", "get-royalty-info", [
        Cl.uint(1),
        Cl.uint(2000000)
      ], alice);
      expect(result).toBeOk(Cl.tuple({
        "recipient": Cl.standardPrincipal(deployer),
        "amount": Cl.uint(100000)
      }));
    });
  });

  describe("read-only functions", () => {
    it("get-owner returns NFT owner", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("diversified-royalty-nft", "get-owner", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.some(Cl.standardPrincipal(alice)));
    });

    it("get-token-uri returns token URI", () => {
      simnet.callPublicFn("diversified-royalty-nft", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("test-uri")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("diversified-royalty-nft", "get-token-uri", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.some(Cl.stringAscii("test-uri")));
    });
  });
});
