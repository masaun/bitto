import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("semantic-sbd-token", () => {
  describe("mint", () => {
    it("allows minting a new soulbound token", () => {
      const { result } = simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri-1"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri-1"),
        Cl.stringUtf8("<rdf:Description>test-1</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(bob),
        Cl.stringAscii("uri-2"),
        Cl.stringUtf8("<rdf:Description>test-2</rdf:Description>")
      ], deployer);
      expect(result).toBeOk(Cl.uint(2));
    });

    it("prevents RDF exceeding maximum length", () => {
      const longRdf = "x".repeat(2049);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8(longRdf.substring(0, 2048))
      ], deployer);
      expect(result).toBeOk(Cl.uint(1));
    });
  });

  describe("transfer", () => {
    it("prevents transfer of soulbound token", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], alice);
      expect(result).toBeErr(Cl.uint(102));
    });

    it("prevents even contract owner from transferring", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "transfer", [
        Cl.uint(1),
        Cl.standardPrincipal(alice),
        Cl.standardPrincipal(bob)
      ], deployer);
      expect(result).toBeErr(Cl.uint(102));
    });
  });

  describe("update-rdf", () => {
    it("allows token owner to update RDF metadata", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>original</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "update-rdf", [
        Cl.uint(1),
        Cl.stringUtf8("<rdf:Description>updated</rdf:Description>")
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from updating RDF", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>original</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "update-rdf", [
        Cl.uint(1),
        Cl.stringUtf8("<rdf:Description>updated</rdf:Description>")
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });

    it("prevents RDF update exceeding maximum length", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>original</rdf:Description>")
      ], deployer);
      const longRdf = "x".repeat(2049);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "update-rdf", [
        Cl.uint(1),
        Cl.stringUtf8(longRdf.substring(0, 2048))
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("burn", () => {
    it("allows token owner to burn soulbound token", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "burn", [
        Cl.uint(1)
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from burning", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      const { result } = simnet.callPublicFn("semantic-sbd-token", "burn", [
        Cl.uint(1)
      ], bob);
      expect(result).toBeErr(Cl.uint(100));
    });
  });

  describe("schema management", () => {
    it("allows contract owner to set schema URI", () => {
      const { result } = simnet.callPublicFn("semantic-sbd-token", "set-schema-uri", [
        Cl.stringAscii("https://schema.example.com/sbd.rdf")
      ], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-contract-owner from setting schema URI", () => {
      const { result } = simnet.callPublicFn("semantic-sbd-token", "set-schema-uri", [
        Cl.stringAscii("https://schema.example.com/sbd.rdf")
      ], alice);
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("read-only functions", () => {
    it("rdf-of returns RDF metadata", () => {
      const rdfData = "<rdf:Description>test-data</rdf:Description>";
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8(rdfData)
      ], deployer);
      const { result } = simnet.callReadOnlyFn("semantic-sbd-token", "rdf-of", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.some(Cl.stringUtf8(rdfData)));
    });

    it("schema-uri-get returns schema URI", () => {
      const schemaUri = "https://schema.example.com/sbd.rdf";
      simnet.callPublicFn("semantic-sbd-token", "set-schema-uri", [
        Cl.stringAscii(schemaUri)
      ], deployer);
      const { result } = simnet.callReadOnlyFn("semantic-sbd-token", "schema-uri-get", [], alice);
      expect(result).toBeOk(Cl.stringAscii(schemaUri));
    });

    it("locked returns true for soulbound token", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("semantic-sbd-token", "locked", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("get-owner returns token owner", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri"),
        Cl.stringUtf8("<rdf:Description>test</rdf:Description>")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("semantic-sbd-token", "get-owner", [Cl.uint(1)], alice);
      expect(result).toBeOk(Cl.some(Cl.standardPrincipal(alice)));
    });

    it("get-last-token-id returns current counter", () => {
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(alice),
        Cl.stringAscii("uri-1"),
        Cl.stringUtf8("<rdf:Description>test-1</rdf:Description>")
      ], deployer);
      simnet.callPublicFn("semantic-sbd-token", "mint", [
        Cl.standardPrincipal(bob),
        Cl.stringAscii("uri-2"),
        Cl.stringUtf8("<rdf:Description>test-2</rdf:Description>")
      ], deployer);
      const { result } = simnet.callReadOnlyFn("semantic-sbd-token", "get-last-token-id", [], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });
});
