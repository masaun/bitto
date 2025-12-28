import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("hierarchical-non-fungible-token", () => {
  describe("mint", () => {
    it("allows minting a root NFT", () => {
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root-uri")
      ], deployer);
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri-1")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(bob),
        Cl.stringAscii("uri-2")
      ], deployer);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("mint-child", () => {
    it("allows minting a child NFT", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("parent-uri")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child-uri")
      ], alice);
      expect(result).toBeOk(Cl.uint(2));
    });

    it("prevents circular parent relationship", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("token-1")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("token-2")
      ], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer NFT", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("transfer-parent", () => {
    it("allows changing parent of a token", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root-1")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root-2")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "transfer-parent", [
        Cl.uint(2),
        Cl.uint(3)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from changing parent", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root-1")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root-2")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "transfer-parent", [
        Cl.uint(2),
        Cl.uint(3)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });

    it("prevents circular parent relationship", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "transfer-parent", [
        Cl.uint(2),
        Cl.uint(1)
      ], alice);
      expect(result).toBeErr(Cl.uint(103));
    });
  });

  describe("burn", () => {
    it("allows burning a leaf NFT", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "burn", [
        Cl.uint(1)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from burning", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("hierarchical-non-fungible-token", "burn", [
        Cl.uint(1)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("read-only functions", () => {
    it("parent-of returns parent ID", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("parent")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child")
      ], alice);
      const { result } = simnet.callReadOnlyFn("hierarchical-non-fungible-token", "parent-of", [Cl.uint(2)], alice);
      expect(result).toBeOk(Cl.uint(1));
    });

    it("children-of returns list of children", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("parent")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child-1")
      ], alice);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child-2")
      ], alice);
      const { result } = simnet.callReadOnlyFn("hierarchical-non-fungible-token", "children-of", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.list([Cl.uint(2), Cl.uint(3)]));
    });

    it("is-root returns true for root token", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("root")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("hierarchical-non-fungible-token", "is-root", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("is-leaf returns true for leaf token", () => {
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("parent")
      ], deployer);
      simnet.callPublicFn("hierarchical-non-fungible-token", "mint-child", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.stringAscii("child")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("hierarchical-non-fungible-token", "is-leaf", [Cl.uint(2)], alice);
      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
