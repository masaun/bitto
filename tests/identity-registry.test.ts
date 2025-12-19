import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("Identity Registry Contract Tests (ERC-7812 Inspired)", () => {
  const contractName = "identity-registry";
  
  // Sample test data
  const sampleKey = Cl.buffer(
    new Uint8Array(32).fill(1)
  );
  const sampleValue = Cl.buffer(
    new Uint8Array(32).fill(2)
  );
  const sampleKey2 = Cl.buffer(
    new Uint8Array(32).fill(3)
  );
  const sampleValue2 = Cl.buffer(
    new Uint8Array(32).fill(4)
  );

  describe("Registry Information", () => {
    it("returns registry info with all Clarity v4 features", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-registry-info",
        [],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.Tuple);
      
      // The result should be a tuple (access via .value for tuple data)
      expect(result.result).toBeDefined();
    });

    it("returns current block time using stacks-block-time", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-current-block-time",
        [],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.UInt);
    });

    it("checks if operations are restricted", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "are-operations-restricted",
        [],
        deployer
      );

      expect(result.result).toBeBool(false);
    });
  });

  describe("Contract Hash (Clarity v4)", () => {
    it("attempts to get contract hash", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-contract-hash",
        [],
        deployer
      );

      // contract-hash? returns (response (buff 32) uint) - returns err in simnet environment
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });

    it("verifies contract integrity", () => {
      // Provide a dummy expected hash
      const dummyHash = Cl.buffer(new Uint8Array(32).fill(0));
      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-contract-integrity",
        [dummyHash],
        deployer
      );

      // Will return false since the dummy hash won't match
      expect(result.result).toBeBool(false);
    });
  });

  describe("Key Isolation (ERC-7812 Core)", () => {
    it("generates isolated key from source and key", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-isolated-key",
        [Cl.principal(address1), sampleKey],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.Buffer);
    });

    it("generates different isolated keys for different sources", () => {
      const result1 = simnet.callReadOnlyFn(
        contractName,
        "get-isolated-key",
        [Cl.principal(address1), sampleKey],
        deployer
      );

      const result2 = simnet.callReadOnlyFn(
        contractName,
        "get-isolated-key",
        [Cl.principal(address2), sampleKey],
        deployer
      );

      expect(result1.result).toHaveClarityType(ClarityType.Buffer);
      expect(result2.result).toHaveClarityType(ClarityType.Buffer);
      expect(result1.result).not.toEqual(result2.result);
    });
  });

  describe("Statement Management (ERC-7812 EvidenceRegistry)", () => {
    it("adds a new statement", () => {
      const result = simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
      
      // Check events
      expect(result.events.length).toBeGreaterThan(0);
    });

    it("fails to add duplicate statement", () => {
      // Add first statement
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      // Try to add same key again
      const result = simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue2],
        address1
      );

      expect(result.result).toBeErr(Cl.uint(1002)); // ERR_KEY_ALREADY_EXISTS
    });

    it("allows different users to add statements with same key", () => {
      const result1 = simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      const result2 = simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address2
      );

      expect(result1.result).toHaveClarityType(ClarityType.ResponseOk);
      expect(result2.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("updates an existing statement", () => {
      // Add statement first
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      // Update it
      const result = simnet.callPublicFn(
        contractName,
        "update-statement",
        [sampleKey, sampleValue2],
        address1
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("fails to update non-existent statement", () => {
      const result = simnet.callPublicFn(
        contractName,
        "update-statement",
        [sampleKey2, sampleValue],
        address1
      );

      expect(result.result).toBeErr(Cl.uint(1003)); // ERR_KEY_DOES_NOT_EXIST
    });

    it("removes a statement", () => {
      // Add statement first
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      // Remove it
      const result = simnet.callPublicFn(
        contractName,
        "remove-statement",
        [sampleKey],
        address1
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("fails to remove non-existent statement", () => {
      const result = simnet.callPublicFn(
        contractName,
        "remove-statement",
        [sampleKey2],
        address1
      );

      expect(result.result).toBeErr(Cl.uint(1003)); // ERR_KEY_DOES_NOT_EXIST
    });

    it("prevents unauthorized removal", () => {
      // Address1 adds statement
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      // Address2 tries to remove it (should fail due to isolation)
      const result = simnet.callPublicFn(
        contractName,
        "remove-statement",
        [sampleKey],
        address2
      );

      expect(result.result).toBeErr(Cl.uint(1003)); // ERR_KEY_DOES_NOT_EXIST (isolated key doesn't exist for address2)
    });
  });

  describe("Statement Reading", () => {
    it("retrieves statement by key and registrar", () => {
      // Add statement
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "get-statement-by-key",
        [Cl.principal(address1), sampleKey],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.OptionalSome);
    });

    it("returns none for non-existent statement", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-statement-by-key",
        [Cl.principal(address1), sampleKey],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.OptionalNone);
    });

    it("gets statement count", () => {
      const initialCount = simnet.callReadOnlyFn(
        contractName,
        "get-statement-count",
        [],
        deployer
      );

      expect(initialCount.result).toBeUint(0);

      // Add statements
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      const afterCount = simnet.callReadOnlyFn(
        contractName,
        "get-statement-count",
        [],
        deployer
      );

      expect(afterCount.result).toBeUint(1);
    });
  });

  describe("Root Management (ERC-7812)", () => {
    it("gets initial root", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-root",
        [],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.Buffer);
    });

    it("updates root after adding statement", () => {
      const initialRoot = simnet.callReadOnlyFn(
        contractName,
        "get-root",
        [],
        deployer
      );

      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      const newRoot = simnet.callReadOnlyFn(
        contractName,
        "get-root",
        [],
        deployer
      );

      expect(newRoot.result).not.toEqual(initialRoot.result);
    });

    it("gets root version", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-root-version",
        [],
        deployer
      );

      expect(result.result).toBeUint(0);

      // Add statement to increment version
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      const newVersion = simnet.callReadOnlyFn(
        contractName,
        "get-root-version",
        [],
        deployer
      );

      expect(newVersion.result).toBeUint(1);
    });

    it("gets root timestamp for current root", () => {
      const currentRoot = simnet.callReadOnlyFn(
        contractName,
        "get-root",
        [],
        deployer
      );

      const timestamp = simnet.callReadOnlyFn(
        contractName,
        "get-root-timestamp",
        [currentRoot.result],
        deployer
      );

      expect(timestamp.result).toHaveClarityType(ClarityType.UInt);
    });
  });

  describe("Registrar Management", () => {
    it("authorizes a registrar (owner only)", () => {
      const result = simnet.callPublicFn(
        contractName,
        "authorize-registrar",
        [Cl.principal(address1), Cl.stringUtf8("Test Registrar")],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("fails when non-owner tries to authorize registrar", () => {
      const result = simnet.callPublicFn(
        contractName,
        "authorize-registrar",
        [Cl.principal(address2), Cl.stringUtf8("Test Registrar")],
        address1
      );

      expect(result.result).toBeErr(Cl.uint(1001)); // ERR_UNAUTHORIZED
    });

    it("checks if principal is authorized registrar", () => {
      // Not authorized initially
      let result = simnet.callReadOnlyFn(
        contractName,
        "is-authorized-registrar",
        [Cl.principal(address1)],
        deployer
      );
      expect(result.result).toBeBool(false);

      // Authorize
      simnet.callPublicFn(
        contractName,
        "authorize-registrar",
        [Cl.principal(address1), Cl.stringUtf8("Test Registrar")],
        deployer
      );

      // Now authorized
      result = simnet.callReadOnlyFn(
        contractName,
        "is-authorized-registrar",
        [Cl.principal(address1)],
        deployer
      );
      expect(result.result).toBeBool(true);
    });

    it("revokes registrar authorization", () => {
      // Authorize first
      simnet.callPublicFn(
        contractName,
        "authorize-registrar",
        [Cl.principal(address1), Cl.stringUtf8("Test Registrar")],
        deployer
      );

      // Revoke
      const result = simnet.callPublicFn(
        contractName,
        "revoke-registrar",
        [Cl.principal(address1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Check no longer authorized
      const checkResult = simnet.callReadOnlyFn(
        contractName,
        "is-authorized-registrar",
        [Cl.principal(address1)],
        deployer
      );
      expect(checkResult.result).toBeBool(false);
    });

    it("gets registrar info", () => {
      // Authorize first
      simnet.callPublicFn(
        contractName,
        "authorize-registrar",
        [Cl.principal(address1), Cl.stringUtf8("Test Registrar")],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "get-registrar-info",
        [Cl.principal(address1)],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.OptionalSome);
    });
  });

  describe("Asset Restrictions (Clarity v4)", () => {
    it("toggles asset restrictions (owner only)", () => {
      // Enable restrictions
      let result = simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Check restrictions are enabled
      const checkResult = simnet.callReadOnlyFn(
        contractName,
        "are-operations-restricted",
        [],
        deployer
      );
      expect(checkResult.result).toBeBool(true);
    });

    it("fails when non-owner tries to set restrictions", () => {
      const result = simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        address1
      );

      expect(result.result).toBeErr(Cl.uint(1001)); // ERR_UNAUTHORIZED
    });

    it("blocks operations when assets are restricted", () => {
      // Enable restrictions
      simnet.callPublicFn(
        contractName,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );

      // Try to add statement
      const result = simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      expect(result.result).toBeErr(Cl.uint(1008)); // ERR_ASSET_RESTRICTED
    });
  });

  describe("Statement with Metadata", () => {
    it("adds statement with metadata", () => {
      const result = simnet.callPublicFn(
        contractName,
        "add-statement-with-metadata",
        [
          sampleKey,
          sampleValue,
          Cl.stringUtf8("identity"),
          Cl.stringUtf8("Test identity statement"),
        ],
        address1
      );

      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });
  });

  describe("ASCII Conversion (Clarity v4 to-ascii?)", () => {
    it("converts statement type to ASCII", () => {
      const result = simnet.callReadOnlyFn(
        contractName,
        "statement-type-to-ascii",
        [Cl.stringUtf8("identity")],
        deployer
      );

      // to-ascii? returns (response string-ascii uint) not optional
      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });
  });

  describe("Signature Verification (Clarity v4 secp256r1-verify)", () => {
    it("verifies secp256r1 signature", () => {
      // Note: This test uses dummy signature data
      // In production, real secp256r1 signatures would be used
      const messageHash = Cl.buffer(new Uint8Array(32).fill(5));
      const signature = Cl.buffer(new Uint8Array(64).fill(6));
      const publicKey = Cl.buffer(new Uint8Array(33).fill(7));

      const result = simnet.callReadOnlyFn(
        contractName,
        "verify-identity-signature",
        [messageHash, signature, publicKey],
        deployer
      );

      // Will return false for invalid signature, but function should work
      expect(result.result).toHaveClarityType(ClarityType.BoolFalse);
    });
  });

  describe("Statement Expiration", () => {
    it("checks if statement is expired", () => {
      // Current time should not be expired
      const currentTime = simnet.callReadOnlyFn(
        contractName,
        "get-current-block-time",
        [],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        contractName,
        "is-statement-expired",
        [currentTime.result],
        deployer
      );

      expect(result.result).toBeBool(false);
    });

    it("identifies expired statements", () => {
      // A very old timestamp should be expired
      const result = simnet.callReadOnlyFn(
        contractName,
        "is-statement-expired",
        [Cl.uint(0)], // epoch time = 0
        deployer
      );

      expect(result.result).toBeBool(true);
    });
  });

  describe("Proof Storage", () => {
    it("stores a proof", () => {
      // First add a statement to have a valid root
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      // Get current root
      const rootResult = simnet.callReadOnlyFn(
        contractName,
        "get-root",
        [],
        deployer
      );

      // Store proof
      const result = simnet.callPublicFn(
        contractName,
        "store-proof",
        [
          sampleKey,
          rootResult.result,
          Cl.bool(true), // existence
          Cl.none(), // aux-key
          Cl.none(), // aux-value
        ],
        address1
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("retrieves stored proof", () => {
      // Add statement and store proof
      simnet.callPublicFn(
        contractName,
        "add-statement",
        [sampleKey, sampleValue],
        address1
      );

      const rootResult = simnet.callReadOnlyFn(
        contractName,
        "get-root",
        [],
        deployer
      );

      simnet.callPublicFn(
        contractName,
        "store-proof",
        [
          sampleKey,
          rootResult.result,
          Cl.bool(true),
          Cl.none(),
          Cl.none(),
        ],
        address1
      );

      // Get proof
      const result = simnet.callReadOnlyFn(
        contractName,
        "get-proof",
        [sampleKey],
        deployer
      );

      expect(result.result).toHaveClarityType(ClarityType.OptionalSome);
    });
  });
});
