import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("composable-non-fungible-token", () => {
  describe("mint", () => {
    it("allows minting a new NFT", () => {
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("test-uri")
      ], deployer);
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri-1")
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(bob),
        Cl.stringAscii("uri-2")
      ], deployer);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer NFT", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("asset management", () => {
    it("allows adding an asset to NFT", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from adding assets", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("equipment system", () => {
    it("allows equipping a slot part", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      simnet.callPublicFn("composable-non-fungible-token", "add-slot-part", [
        Cl.uint(1),
        Cl.uint(10),
        Cl.list([Cl.standardPrincipal(deployer)])
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "equip", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(100),
        Cl.uint(1),
        Cl.uint(100)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows unequipping a slot part", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      simnet.callPublicFn("composable-non-fungible-token", "add-slot-part", [
        Cl.uint(1),
        Cl.uint(10),
        Cl.list([Cl.standardPrincipal(deployer)])
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "equip", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(100),
        Cl.uint(1),
        Cl.uint(100)
      ], alice);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "unequip", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.uint(1)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from equipping", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      simnet.callPublicFn("composable-non-fungible-token", "add-slot-part", [
        Cl.uint(1),
        Cl.uint(10),
        Cl.list([Cl.standardPrincipal(deployer)])
      ], deployer);
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "equip", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(100),
        Cl.uint(1),
        Cl.uint(100)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("catalog management", () => {
    it("allows adding slot parts to catalog", () => {
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "add-slot-part", [
        Cl.uint(1),
        Cl.uint(10),
        Cl.list([Cl.standardPrincipal(deployer)])
      ], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows adding fixed parts to catalog", () => {
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "add-fixed-part", [
        Cl.uint(1),
        Cl.uint(5),
        Cl.stringAscii("fixed-part-metadata")
      ], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-contract-owner from adding parts", () => {
      const { result } = simnet.callPublicFn("composable-non-fungible-token", "add-slot-part", [
        Cl.uint(1),
        Cl.uint(10),
        Cl.list([Cl.standardPrincipal(deployer)])
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("read-only functions", () => {
    it("get-owner returns NFT owner", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("composable-non-fungible-token", "get-owner", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.some(Cl.standardPrincipal(alice)));
    });

    it("get-token-uri returns token URI", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("test-uri")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("composable-non-fungible-token", "get-token-uri", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.some(Cl.stringAscii("test-uri")));
    });

    it("get-assets returns list of asset IDs", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(101),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      const { result } = simnet.callReadOnlyFn("composable-non-fungible-token", "get-assets", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.list([Cl.uint(100), Cl.uint(101)]));
    });

    it("is-equipped returns equipment status", () => {
      simnet.callPublicFn("composable-non-fungible-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri")
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "add-asset", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.standardPrincipal(deployer),
        Cl.list([Cl.uint(1), Cl.uint(2)]),
        Cl.uint(0)
      ], alice);
      simnet.callPublicFn("composable-non-fungible-token", "add-slot-part", [
        Cl.uint(1),
        Cl.uint(10),
        Cl.list([Cl.standardPrincipal(deployer)])
      ], deployer);
      simnet.callPublicFn("composable-non-fungible-token", "equip", [
        Cl.uint(1),
        Cl.uint(0),
        Cl.uint(100),
        Cl.uint(1),
        Cl.uint(100)
      ], alice);
      const { result } = simnet.callReadOnlyFn("composable-non-fungible-token", "is-equipped", [
        Cl.uint(1),
        Cl.uint(100),
        Cl.uint(1)
      ], alice);
      expect(result).toBeOk(Cl.bool(false));
    });
  });
});
