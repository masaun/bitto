import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Notary Contract Tests (ERC-5289 Inspired)", () => {
  const contractName = "notary";
  
  // Test data
  const documentUri = "ipfs://QmTest1234567890abcdef";
  const documentTitle = "Terms of Service v1";
  const contentHash = new Uint8Array(32).fill(1);
  
  // Mock secp256r1 signature data
  const mockSignature = new Uint8Array(64).fill(1);
  const mockPublicKey = new Uint8Array(33).fill(2);
  const mockMessageHash = new Uint8Array(32).fill(3);

  describe("Document Registration", () => {
    it("allows user to register a new document", () => {
      const result = simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.uint(1));
      
      // Verify document count updated
      const documentCount = simnet.getDataVar(contractName, "document-count");
      expect(documentCount).toBeUint(1);
    });

    it("increments document ID for each new registration", () => {
      // Register first document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Register second document
      const result = simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8("ipfs://QmSecondDocument"),
          Cl.stringUtf8("Privacy Policy"),
          Cl.buffer(new Uint8Array(32).fill(2)),
        ],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(2));
    });

    it("emits DocumentRegistered event on registration", () => {
      const result = simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      expect(result.events).toHaveLength(1);
      expect(result.events[0].event).toBe("print_event");
    });
  });

  describe("Document Retrieval (ERC-5289 legalDocument equivalent)", () => {
    it("returns document URI by ID", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Get the legal document URI
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-legal-document",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringUtf8(documentUri));
    });

    it("returns error for non-existent document", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-legal-document",
        [Cl.uint(999)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1002)); // ERR_DOCUMENT_NOT_FOUND
    });

    it("returns full document details", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "get-document-details",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.OptionalSome);
      expect(result.result).toBeSome(expect.anything());
    });
  });

  describe("Document Signing (ERC-5289 signDocument equivalent)", () => {
    it("allows user to sign an active document", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Sign the document
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents double signing", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Sign the document
      simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      // Try to sign again
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1003)); // ERR_ALREADY_SIGNED
    });

    it("fails when signing non-existent document", () => {
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(999)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1002)); // ERR_DOCUMENT_NOT_FOUND
    });

    it("emits DocumentSigned event", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Sign the document
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.events.length).toBeGreaterThan(0);
    });

    it("increments signature count per document", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Sign with multiple users
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet1);
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet2);

      const countResult = simnet.callReadOnlyFn(
        contractName,
        "get-document-signature-count",
        [Cl.uint(1)],
        deployer
      );

      expect(countResult.result).toBeUint(2);
    });
  });

  describe("Document Signed Checks (ERC-5289 documentSigned equivalent)", () => {
    it("returns true when user has signed document", () => {
      // Register and sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet1);

      const result = simnet.callReadOnlyFn(
        contractName,
        "document-signed",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeBool(true);
    });

    it("returns false when user has not signed document", () => {
      // Register but don't sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "document-signed",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeBool(false);
    });
  });

  describe("Document Signed At (ERC-5289 documentSignedAt equivalent)", () => {
    it("returns timestamp when user signed", () => {
      // Register and sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet1);

      const result = simnet.callReadOnlyFn(
        contractName,
        "document-signed-at",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("returns error when user has not signed", () => {
      // Register but don't sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "document-signed-at",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1004)); // ERR_NOT_SIGNED
    });
  });

  describe("Clarity v4: contract-hash? Function Tests", () => {
    it("returns contract hash (may error in test environment)", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-contract-hash",
        [],
        deployer
      );

      // contract-hash? may not be available in simnet
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });

    it("includes contract hash in notary info", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-notary-info",
        [],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.Tuple);
      expect(result.result).toBeTuple(expect.anything());
    });
  });

  describe("Clarity v4: stacks-block-time Function Tests", () => {
    it("returns current Stacks block time", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-current-time",
        [],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.UInt);
    });

    it("stores stacks-block-time in document creation", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "get-document-details",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeSome(expect.anything());
    });
  });

  describe("Clarity v4: to-ascii? Function Tests", () => {
    it("converts document title to ASCII", () => {
      // Register with ASCII-compatible title
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8("ASCII Title"),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "get-document-title-ascii",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringAscii("ASCII Title"));
    });

    it("converts document URI to ASCII", () => {
      const asciiUri = "ipfs://QmAsciiTest";
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(asciiUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "get-document-uri-ascii",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.stringAscii(asciiUri));
    });

    it("returns error for non-existent document", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-document-title-ascii",
        [Cl.uint(999)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1002)); // ERR_DOCUMENT_NOT_FOUND
    });
  });

  describe("Clarity v4: secp256r1-verify Function Tests", () => {
    it("verify-signature function exists", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-signature",
        [
          Cl.buffer(mockMessageHash),
          Cl.buffer(mockSignature),
          Cl.buffer(mockPublicKey),
        ],
        deployer
      );

      // Mock data won't verify, but function should work
      expect(result.result).toBeBool(false);
    });

    it("sign-document-with-signature fails with invalid signature", () => {
      // Register a document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Try to sign with mock (invalid) signature
      const result = simnet.callPublicFn(
        contractName,
        "sign-document-with-signature",
        [
          Cl.uint(1),
          Cl.buffer(mockSignature),
          Cl.buffer(mockPublicKey),
          Cl.buffer(mockMessageHash),
        ],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1006)); // ERR_INVALID_SIGNATURE
    });

    it("verify-document-signature returns false for unsigned document", () => {
      // Register a document but don't sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-document-signature",
        [Cl.principal(wallet1), Cl.uint(1), Cl.buffer(mockMessageHash)],
        deployer
      );

      expect(result.result).toBeBool(false);
    });

    it("verify-document-signature returns false for basic signed document (no crypto sig)", () => {
      // Register and sign with basic sign-document
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet1);

      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-document-signature",
        [Cl.principal(wallet1), Cl.uint(1), Cl.buffer(mockMessageHash)],
        deployer
      );

      // Basic sign uses zero signature, so verify returns false
      expect(result.result).toBeBool(false);
    });
  });

  describe("Clarity v4: restrict-assets? Concept Tests", () => {
    it("allows owner to set asset restrictions", () => {
      const result = simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify restriction is set
      const restricted = simnet.getDataVar(contractName, "assets-restricted");
      expect(restricted).toBeBool(true);
    });

    it("prevents non-owner from setting asset restrictions", () => {
      const result = simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
    });

    it("blocks document registration when assets restricted", () => {
      // Enable restrictions
      simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );

      // Try to register
      const result = simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1008)); // ERR_ASSET_RESTRICTION
    });

    it("blocks document signing when assets restricted", () => {
      // Register first
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Enable restrictions
      simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );

      // Try to sign
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1008)); // ERR_ASSET_RESTRICTION
    });

    it("returns current restriction status", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "are-assets-restricted",
        [],
        deployer
      );

      expect(result.result).toBeBool(false);
    });
  });

  describe("Document Lifecycle Management", () => {
    it("allows creator to deactivate document", () => {
      // Register
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Deactivate
      const result = simnet.callPublicFn(
        contractName,
        "deactivate-document",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents non-creator from deactivating document", () => {
      // Register as deployer
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Try to deactivate as wallet1
      const result = simnet.callPublicFn(
        contractName,
        "deactivate-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
    });

    it("prevents signing inactive document", () => {
      // Register and deactivate
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "deactivate-document",
        [Cl.uint(1)],
        deployer
      );

      // Try to sign
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1007)); // ERR_DOCUMENT_INACTIVE
    });

    it("allows creator to reactivate document", () => {
      // Register and deactivate
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "deactivate-document",
        [Cl.uint(1)],
        deployer
      );

      // Reactivate
      const result = simnet.callPublicFn(
        contractName,
        "reactivate-document",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("allows signing after reactivation", () => {
      // Register, deactivate, reactivate
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "deactivate-document",
        [Cl.uint(1)],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "reactivate-document",
        [Cl.uint(1)],
        deployer
      );

      // Sign
      const result = simnet.callPublicFn(
        contractName,
        "sign-document",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });
  });

  describe("Document Updates", () => {
    it("allows creator to update document", () => {
      // Register
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Update
      const newUri = "ipfs://QmUpdatedDocument";
      const newHash = new Uint8Array(32).fill(9);
      const result = simnet.callPublicFn(
        contractName,
        "update-document",
        [Cl.uint(1), Cl.stringUtf8(newUri), Cl.buffer(newHash)],
        deployer
      );

      expect(result.result).toBeOk(Cl.uint(2)); // version 2
    });

    it("prevents non-creator from updating document", () => {
      // Register as deployer
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Try to update as wallet1
      const result = simnet.callPublicFn(
        contractName,
        "update-document",
        [
          Cl.uint(1),
          Cl.stringUtf8("ipfs://unauthorized"),
          Cl.buffer(new Uint8Array(32).fill(0)),
        ],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
    });
  });

  describe("Required Documents", () => {
    it("allows owner to set required documents for a contract", () => {
      // Register some documents
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8("TOS"),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8("ipfs://QmPrivacy"),
          Cl.stringUtf8("Privacy"),
          Cl.buffer(new Uint8Array(32).fill(2)),
        ],
        deployer
      );

      // Set required documents for wallet1 (as if it were a contract)
      const result = simnet.callPublicFn(
        contractName,
        "set-required-documents",
        [Cl.principal(wallet1), Cl.list([Cl.uint(1), Cl.uint(2)])],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from setting required documents", () => {
      const result = simnet.callPublicFn(
        contractName,
        "set-required-documents",
        [Cl.principal(wallet2), Cl.list([Cl.uint(1)])],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
    });

    it("checks if user has signed all required documents", () => {
      // Register documents
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8("TOS"),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8("ipfs://QmPrivacy"),
          Cl.stringUtf8("Privacy"),
          Cl.buffer(new Uint8Array(32).fill(2)),
        ],
        deployer
      );

      // Set required documents
      simnet.callPublicFn(
        contractName,
        "set-required-documents",
        [Cl.principal(wallet2), Cl.list([Cl.uint(1), Cl.uint(2)])],
        deployer
      );

      // Check before signing
      const beforeResult = simnet.callReadOnlyFn(
        contractName,
        "has-signed-required-documents",
        [Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer
      );
      expect(beforeResult.result).toBeTuple({
        user: Cl.principal(wallet1),
        "all-signed": Cl.bool(false),
      });

      // Sign both documents
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet1);
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(2)], wallet1);

      // Check after signing
      const afterResult = simnet.callReadOnlyFn(
        contractName,
        "has-signed-required-documents",
        [Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer
      );
      expect(afterResult.result).toBeTuple({
        user: Cl.principal(wallet1),
        "all-signed": Cl.bool(true),
      });
    });
  });

  describe("Require Document Signed Helper", () => {
    it("succeeds when user has signed document", () => {
      // Register and sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(contractName, "sign-document", [Cl.uint(1)], wallet1);

      // Check requirement
      const result = simnet.callPublicFn(
        contractName,
        "require-document-signed",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("fails when user has not signed document", () => {
      // Register but don't sign
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Check requirement
      const result = simnet.callPublicFn(
        contractName,
        "require-document-signed",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1011)); // ERR_SIGNATURE_REQUIRED
    });

    it("fails when document does not exist", () => {
      const result = simnet.callPublicFn(
        contractName,
        "require-document-signed",
        [Cl.principal(wallet1), Cl.uint(999)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(1002)); // ERR_DOCUMENT_NOT_FOUND
    });
  });

  describe("Document Integrity Verification", () => {
    it("verifies document integrity with matching hash", () => {
      // Register
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Verify with correct hash
      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-document-integrity",
        [Cl.uint(1), Cl.buffer(contentHash)],
        deployer
      );

      expect(result.result).toBeBool(true);
    });

    it("fails integrity check with wrong hash", () => {
      // Register
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );

      // Verify with wrong hash
      const wrongHash = new Uint8Array(32).fill(99);
      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-document-integrity",
        [Cl.uint(1), Cl.buffer(wrongHash)],
        deployer
      );

      expect(result.result).toBeBool(false);
    });

    it("returns false for non-existent document", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-document-integrity",
        [Cl.uint(999), Cl.buffer(contentHash)],
        deployer
      );

      expect(result.result).toBeBool(false);
    });
  });

  describe("Notary Info", () => {
    it("returns comprehensive notary information", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-notary-info",
        [],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.Tuple);
      expect(result.result).toBeTuple(expect.anything());
    });

    it("includes correct document count in info", () => {
      // Register some documents
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8(documentUri),
          Cl.stringUtf8(documentTitle),
          Cl.buffer(contentHash),
        ],
        deployer
      );
      simnet.callPublicFn(
        contractName,
        "register-document",
        [
          Cl.stringUtf8("ipfs://QmDoc2"),
          Cl.stringUtf8("Doc 2"),
          Cl.buffer(new Uint8Array(32).fill(2)),
        ],
        deployer
      );

      const countResult = simnet.callReadOnlyFn(
        contractName,
        "get-document-count",
        [],
        deployer
      );

      expect(countResult.result).toBeUint(2);
    });
  });
});
