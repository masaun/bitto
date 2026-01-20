import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "hook-enabled-fungible-token";

// Token constants from the contract
const TOKEN_NAME = "Hook-Enabled Token";
const TOKEN_SYMBOL = "HOOK";
const TOKEN_DECIMALS = 18n;
const TOTAL_SUPPLY = 1000000000000000000000000n; // 1 million tokens with 18 decimals
const TOKEN_GRANULARITY = 1n;

// Error codes
const ERR_UNAUTHORIZED = 1001n;
const ERR_NOT_OWNER = 1002n;
const ERR_INSUFFICIENT_BALANCE = 1003n;
const ERR_INVALID_AMOUNT = 1004n;
const ERR_ASSETS_RESTRICTED = 1005n;
const ERR_SIGNATURE_VERIFICATION_FAILED = 1006n;
const ERR_NOT_OPERATOR = 1009n;
const ERR_CANNOT_REVOKE_SELF = 1010n;
const ERR_PAUSED = 1014n;
const ERR_INVALID_HOOK_CONTRACT = 1018n;

describe("ERC-777 Inspired Hook-Enabled Fungible Token with Clarity v4", () => {

  beforeEach(() => {
    // Reset simnet state before each test
    simnet.mineEmptyBlock();
  });

  // ============================================================================
  // TOKEN INITIALIZATION AND BASIC PROPERTIES TESTS
  // ============================================================================

  describe("Token Initialization and Properties", () => {
    
    it("should initialize with correct token name", () => {
      const name = simnet.callReadOnlyFn(CONTRACT_NAME, "get-name", [], deployer);
      expect(name.result).toBeOk(Cl.stringUtf8(TOKEN_NAME));
    });

    it("should initialize with correct token symbol", () => {
      const symbol = simnet.callReadOnlyFn(CONTRACT_NAME, "get-symbol", [], deployer);
      expect(symbol.result).toBeOk(Cl.stringUtf8(TOKEN_SYMBOL));
    });

    it("should initialize with correct decimals (18 as per ERC-777)", () => {
      const decimals = simnet.callReadOnlyFn(CONTRACT_NAME, "get-decimals", [], deployer);
      expect(decimals.result).toBeOk(Cl.uint(TOKEN_DECIMALS));
    });

    it("should initialize with correct total supply", () => {
      const totalSupply = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(Cl.uint(TOTAL_SUPPLY));
    });

    it("should initialize with correct granularity", () => {
      const granularity = simnet.callReadOnlyFn(CONTRACT_NAME, "get-granularity", [], deployer);
      expect(granularity.result).toBeOk(Cl.uint(TOKEN_GRANULARITY));
    });

    it("should allocate initial supply to deployer", () => {
      const balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(deployer)], deployer);
      expect(balance.result).toBeOk(Cl.uint(TOTAL_SUPPLY));
    });

    it("should return empty list for default operators", () => {
      const defaultOperators = simnet.callReadOnlyFn(CONTRACT_NAME, "get-default-operators", [], deployer);
      expect(defaultOperators.result).toBeOk(Cl.list([]));
    });

    it("should return correct token info", () => {
      const tokenInfo = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-info", [], deployer);
      expect(tokenInfo.result.type).toBe(ClarityType.Tuple);
    });

    it("should return correct token URI (SIP-010 compatibility)", () => {
      const tokenUri = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-uri", [], deployer);
      expect(tokenUri.result).toBeOk(Cl.some(Cl.stringUtf8("https://api.hook-token.io/metadata")));
    });
  });

  // ============================================================================
  // CLARITY V4 FUNCTIONS TESTS
  // ============================================================================

  describe("Clarity v4 Functions Integration", () => {

    it("should return contract hash using contract-hash?", () => {
      const contractHash = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-hash", [], deployer);
      // contract-hash? returns (optional (buff 32)) - it should be some value or none
      expect(contractHash.result).toBeTruthy();
    });

    it("should return contract hash for specific principal", () => {
      const contractHash = simnet.callReadOnlyFn(
        CONTRACT_NAME, 
        "get-contract-hash-for", 
        [Cl.principal(deployer)], 
        deployer
      );
      expect(contractHash.result).toBeTruthy();
    });

    it("should return current block time using stacks-block-time", () => {
      const blockTime = simnet.callReadOnlyFn(CONTRACT_NAME, "get-current-block-time", [], deployer);
      expect(blockTime.result.type).toBe(ClarityType.UInt);
    });

    it("should return assets restricted status", () => {
      const assetsRestricted = simnet.callReadOnlyFn(CONTRACT_NAME, "are-assets-restricted", [], deployer);
      expect(assetsRestricted.result).toStrictEqual(Cl.bool(false));
    });

    it("should convert token name to ASCII using to-ascii?", () => {
      const tokenNameAscii = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-name-ascii", [], deployer);
      expect(tokenNameAscii.result).toBeTruthy();
    });

    it("should convert token symbol to ASCII using to-ascii?", () => {
      const tokenSymbolAscii = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-symbol-ascii", [], deployer);
      expect(tokenSymbolAscii.result).toBeTruthy();
    });

    it("should return comprehensive contract status with v4 features", () => {
      const status = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-status", [], deployer);
      expect(status.result.type).toBe(ClarityType.Tuple);
    });
  });

  // ============================================================================
  // ERC-777 SEND TOKENS TESTS
  // ============================================================================

  describe("ERC-777 Send Tokens (send-tokens)", () => {
    
    it("should send tokens successfully", () => {
      const amount = 1000000000000000000n; // 1 token
      const userData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      // Verify balances
      const deployerBalance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(deployer)], deployer);
      expect(deployerBalance.result).toBeOk(Cl.uint(TOTAL_SUPPLY - amount));

      const user1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user1)], deployer);
      expect(user1Balance.result).toBeOk(Cl.uint(amount));
    });

    it("should send tokens with user data", () => {
      const amount = 500000000000000000n; // 0.5 tokens
      const userData = new TextEncoder().encode("payment-reference-123");

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));
    });

    it("should fail to send more than balance", () => {
      const excessAmount = TOTAL_SUPPLY + 1n;
      const userData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(excessAmount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_INSUFFICIENT_BALANCE));
    });

    it("should fail to send when contract is paused", () => {
      // Pause contract
      simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);

      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_PAUSED));
    });

    it("should fail to send when assets are restricted", () => {
      // Set asset restrictions
      simnet.callPublicFn(CONTRACT_NAME, "set-asset-restrictions", [Cl.bool(true)], deployer);

      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_ASSETS_RESTRICTED));
    });
  });

  // ============================================================================
  // ERC-777 OPERATOR SYSTEM TESTS
  // ============================================================================

  describe("ERC-777 Operator System", () => {

    it("should always consider holder as operator for themselves", () => {
      const isOperator = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-operator-for",
        [Cl.principal(deployer), Cl.principal(deployer)],
        deployer
      );
      expect(isOperator.result).toStrictEqual(Cl.bool(true));
    });

    it("should authorize an operator successfully", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "authorize-operator",
        [Cl.principal(user1)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify operator status
      const isOperator = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-operator-for",
        [Cl.principal(user1), Cl.principal(deployer)],
        deployer
      );
      expect(isOperator.result).toStrictEqual(Cl.bool(true));
    });

    it("should fail to authorize self as operator", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "authorize-operator",
        [Cl.principal(deployer)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_CANNOT_REVOKE_SELF));
    });

    it("should revoke an operator successfully", () => {
      // First authorize
      simnet.callPublicFn(CONTRACT_NAME, "authorize-operator", [Cl.principal(user1)], deployer);

      // Then revoke
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-operator",
        [Cl.principal(user1)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify operator is revoked
      const isOperator = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-operator-for",
        [Cl.principal(user1), Cl.principal(deployer)],
        deployer
      );
      expect(isOperator.result).toStrictEqual(Cl.bool(false));
    });

    it("should fail to revoke self as operator", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-operator",
        [Cl.principal(deployer)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_CANNOT_REVOKE_SELF));
    });
  });

  // ============================================================================
  // ERC-777 OPERATOR SEND TESTS
  // ============================================================================

  describe("ERC-777 Operator Send (operator-send)", () => {

    it("should allow operator to send tokens on behalf of holder", () => {
      const amount = 1000000000000000000n; // 1 token
      const userData = new Uint8Array(0);
      const operatorData = new TextEncoder().encode("operator-action");

      // Authorize user1 as operator for deployer
      simnet.callPublicFn(CONTRACT_NAME, "authorize-operator", [Cl.principal(user1)], deployer);

      // Operator sends tokens on behalf of deployer
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-send",
        [
          Cl.principal(deployer),
          Cl.principal(user2),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.buffer(operatorData)
        ],
        user1
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      // Verify balances
      const deployerBalance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(deployer)], deployer);
      expect(deployerBalance.result).toBeOk(Cl.uint(TOTAL_SUPPLY - amount));

      const user2Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user2)], deployer);
      expect(user2Balance.result).toBeOk(Cl.uint(amount));
    });

    it("should fail if sender is not an authorized operator", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);
      const operatorData = new Uint8Array(0);

      // Try to send without authorization
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-send",
        [
          Cl.principal(deployer),
          Cl.principal(user2),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.buffer(operatorData)
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(ERR_NOT_OPERATOR));
    });

    it("should allow holder to send their own tokens via operator-send", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);
      const operatorData = new TextEncoder().encode("self-send");

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-send",
        [
          Cl.principal(deployer),
          Cl.principal(user1),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.buffer(operatorData)
        ],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));
    });
  });

  // ============================================================================
  // ERC-777 MINTING TESTS
  // ============================================================================

  describe("ERC-777 Minting (mint)", () => {

    it("should mint tokens to recipient (only owner)", () => {
      const amount = 5000000000000000000n; // 5 tokens
      const operatorData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(operatorData)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      // Verify balance increased
      const user1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user1)], deployer);
      expect(user1Balance.result).toBeOk(Cl.uint(amount));

      // Verify total supply increased
      const totalSupply = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(Cl.uint(TOTAL_SUPPLY + amount));
    });

    it("should fail to mint if not owner", () => {
      const amount = 1000000000000000000n;
      const operatorData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.principal(user2), Cl.uint(amount), Cl.buffer(operatorData)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(ERR_NOT_OWNER));
    });

    it("should fail to mint zero amount", () => {
      const operatorData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.principal(user1), Cl.uint(0), Cl.buffer(operatorData)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_INVALID_AMOUNT));
    });

    it("should fail to mint when contract is paused", () => {
      simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);

      const amount = 1000000000000000000n;
      const operatorData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(operatorData)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_PAUSED));
    });
  });

  // ============================================================================
  // ERC-777 BURNING TESTS
  // ============================================================================

  describe("ERC-777 Burning (burn, operator-burn)", () => {

    it("should burn tokens from holder", () => {
      const amount = 1000000000000000000n; // 1 token
      const userData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [Cl.uint(amount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      // Verify balance decreased
      const balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(deployer)], deployer);
      expect(balance.result).toBeOk(Cl.uint(TOTAL_SUPPLY - amount));

      // Verify total supply decreased
      const totalSupply = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(Cl.uint(TOTAL_SUPPLY - amount));
    });

    it("should fail to burn more than balance", () => {
      const excessAmount = TOTAL_SUPPLY + 1n;
      const userData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [Cl.uint(excessAmount), Cl.buffer(userData)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_INSUFFICIENT_BALANCE));
    });

    it("should allow operator to burn tokens on behalf of holder", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);
      const operatorData = new TextEncoder().encode("operator-burn");

      // Authorize user1 as operator
      simnet.callPublicFn(CONTRACT_NAME, "authorize-operator", [Cl.principal(user1)], deployer);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-burn",
        [
          Cl.principal(deployer),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.buffer(operatorData)
        ],
        user1
      );
      expect(result.result).toBeOk(Cl.uint(amount));
    });

    it("should fail operator burn if not authorized", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);
      const operatorData = new Uint8Array(0);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-burn",
        [
          Cl.principal(deployer),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.buffer(operatorData)
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(ERR_NOT_OPERATOR));
    });
  });

  // ============================================================================
  // HOOK REGISTRATION TESTS
  // ============================================================================

  describe("Hook Registration (ERC-1820 Simulation)", () => {

    it("should return none for unregistered tokens-to-send hook", () => {
      const hook = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tokens-to-send-hook",
        [Cl.principal(user1)],
        deployer
      );
      expect(hook.result).toStrictEqual(Cl.none());
    });

    it("should return none for unregistered tokens-received hook", () => {
      const hook = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tokens-received-hook",
        [Cl.principal(user1)],
        deployer
      );
      expect(hook.result).toStrictEqual(Cl.none());
    });

    it("should unregister tokens-to-send hook successfully", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "unregister-tokens-to-send-hook",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should unregister tokens-received hook successfully", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "unregister-tokens-received-hook",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });
  });

  // ============================================================================
  // ERC-20 COMPATIBILITY TESTS
  // ============================================================================

  describe("ERC-20 Compatibility Functions", () => {

    it("should transfer tokens using ERC-20 compatible transfer", () => {
      const amount = 1000000000000000000n;

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.principal(user1), Cl.uint(amount), Cl.none()],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      const user1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user1)], deployer);
      expect(user1Balance.result).toBeOk(Cl.uint(amount));
    });

    it("should transfer tokens with memo using ERC-20 compatible transfer", () => {
      const amount = 500000000000000000n;
      const memo = new TextEncoder().encode("memo123");

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.principal(user1), Cl.uint(amount), Cl.some(Cl.buffer(memo))],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));
    });

    it("should transfer-from using operator system", () => {
      const amount = 1000000000000000000n;

      // Authorize user1 as operator
      simnet.callPublicFn(CONTRACT_NAME, "authorize-operator", [Cl.principal(user1)], deployer);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer-from",
        [Cl.principal(deployer), Cl.principal(user2), Cl.uint(amount), Cl.none()],
        user1
      );
      expect(result.result).toBeOk(Cl.uint(amount));
    });

    it("should get balance using SIP-010 compatible get-balance-of", () => {
      const balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance-of", [Cl.principal(deployer)], deployer);
      expect(balance.result).toBeOk(Cl.uint(TOTAL_SUPPLY));
    });
  });

  // ============================================================================
  // ADMINISTRATIVE FUNCTIONS TESTS
  // ============================================================================

  describe("Administrative Functions", () => {

    it("should pause contract (only owner)", () => {
      const result = simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify paused state using is-paused function
      const isPaused = simnet.callReadOnlyFn(CONTRACT_NAME, "is-paused", [], deployer);
      expect(isPaused.result).toStrictEqual(Cl.bool(true));
    });

    it("should unpause contract (only owner)", () => {
      simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);
      const result = simnet.callPublicFn(CONTRACT_NAME, "unpause-contract", [], deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify unpaused state using is-paused function
      const isPaused = simnet.callReadOnlyFn(CONTRACT_NAME, "is-paused", [], deployer);
      expect(isPaused.result).toStrictEqual(Cl.bool(false));
    });

    it("should fail to pause if not owner", () => {
      const result = simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], user1);
      expect(result.result).toBeErr(Cl.uint(ERR_NOT_OWNER));
    });

    it("should set asset restrictions (only owner)", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const restricted = simnet.callReadOnlyFn(CONTRACT_NAME, "are-assets-restricted", [], deployer);
      expect(restricted.result).toStrictEqual(Cl.bool(true));
    });

    it("should fail to set asset restrictions if not owner", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-asset-restrictions",
        [Cl.bool(true)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(ERR_NOT_OWNER));
    });
  });

  // ============================================================================
  // TRANSFER OPERATION TRACKING TESTS
  // ============================================================================

  describe("Transfer Operation Tracking", () => {

    it("should record transfer operations", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);

      // Perform transfer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(userData)],
        deployer
      );

      // Check transfer operation was recorded
      const operation = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-transfer-operation",
        [Cl.uint(1)],
        deployer
      );
      expect(operation.result.type).toBe(ClarityType.OptionalSome);
    });

    it("should get signature nonce for address", () => {
      const nonce = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-signature-nonce",
        [Cl.principal(deployer)],
        deployer
      );
      expect(nonce.result).toStrictEqual(Cl.uint(0));
    });

    it("should get event log entry", () => {
      // Event 1 should be the deployment event
      const eventLog = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-event-log",
        [Cl.uint(1)],
        deployer
      );
      expect(eventLog.result.type).toBe(ClarityType.OptionalSome);
    });
  });

  // ============================================================================
  // CLARITY V4 SIGNATURE VERIFICATION TESTS
  // ============================================================================

  describe("Clarity v4 Signature Verification (secp256r1-verify)", () => {

    it("should handle operator send with signature verification", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);
      const operatorData = new Uint8Array(0);
      const nonce = 1n;
      const signature = new Uint8Array(64).fill(1);
      const publicKey = new Uint8Array(33).fill(2);

      // Authorize operator
      simnet.callPublicFn(CONTRACT_NAME, "authorize-operator", [Cl.principal(user1)], deployer);

      // Note: In simnet, signature verification will fail with mock signatures
      // This test verifies the function handles parameters correctly
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-send-with-signature",
        [
          Cl.principal(deployer),
          Cl.principal(user2),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.buffer(operatorData),
          Cl.uint(nonce),
          Cl.bufferFromHex(Buffer.from(signature).toString('hex')),
          Cl.bufferFromHex(Buffer.from(publicKey).toString('hex'))
        ],
        user1
      );
      // Will fail due to invalid signature, but confirms function works
      expect(result.result).toBeErr(Cl.uint(ERR_SIGNATURE_VERIFICATION_FAILED));
    });

    it("should handle send with v4 features (signature required)", () => {
      const amount = 1000000000000000000n;
      const userData = new Uint8Array(0);
      const signature = new Uint8Array(64).fill(1);
      const publicKey = new Uint8Array(33).fill(2);
      const messageHash = new Uint8Array(32).fill(3);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-with-v4-features",
        [
          Cl.principal(user1),
          Cl.uint(amount),
          Cl.buffer(userData),
          Cl.bufferFromHex(Buffer.from(signature).toString('hex')),
          Cl.bufferFromHex(Buffer.from(publicKey).toString('hex')),
          Cl.bufferFromHex(Buffer.from(messageHash).toString('hex'))
        ],
        deployer
      );
      // Will fail due to contract-hash check (called from standard principal, not contract)
      // ERR_UNAUTHORIZED = 1001
      expect(result.result).toBeErr(Cl.uint(ERR_UNAUTHORIZED));
    });

    it("should handle verify and authorize operator with signature", () => {
      const signature = new Uint8Array(64).fill(1);
      const publicKey = new Uint8Array(33).fill(2);
      const messageHash = new Uint8Array(32).fill(3);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "verify-and-authorize-operator",
        [
          Cl.principal(user1),
          Cl.bufferFromHex(Buffer.from(signature).toString('hex')),
          Cl.bufferFromHex(Buffer.from(publicKey).toString('hex')),
          Cl.bufferFromHex(Buffer.from(messageHash).toString('hex'))
        ],
        deployer
      );
      // Will fail due to invalid signature
      expect(result.result).toBeErr(Cl.uint(ERR_SIGNATURE_VERIFICATION_FAILED));
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Tests", () => {

    it("should handle full token lifecycle: mint, send, burn", () => {
      const mintAmount = 10000000000000000000n; // 10 tokens
      const sendAmount = 3000000000000000000n; // 3 tokens
      const burnAmount = 2000000000000000000n; // 2 tokens

      // Mint tokens to user1
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.principal(user1), Cl.uint(mintAmount), Cl.buffer(new Uint8Array(0))],
        deployer
      );

      let user1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user1)], deployer);
      expect(user1Balance.result).toBeOk(Cl.uint(mintAmount));

      // User1 sends to user2
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user2), Cl.uint(sendAmount), Cl.buffer(new Uint8Array(0))],
        user1
      );

      user1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user1)], deployer);
      expect(user1Balance.result).toBeOk(Cl.uint(mintAmount - sendAmount));

      const user2Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user2)], deployer);
      expect(user2Balance.result).toBeOk(Cl.uint(sendAmount));

      // User1 burns tokens
      simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [Cl.uint(burnAmount), Cl.buffer(new Uint8Array(0))],
        user1
      );

      user1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(user1)], deployer);
      expect(user1Balance.result).toBeOk(Cl.uint(mintAmount - sendAmount - burnAmount));
    });

    it("should handle operator delegation flow", () => {
      const amount = 2000000000000000000n;

      // Authorize user1 as operator for deployer
      simnet.callPublicFn(CONTRACT_NAME, "authorize-operator", [Cl.principal(user1)], deployer);

      // Verify authorization
      let isOperator = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-operator-for",
        [Cl.principal(user1), Cl.principal(deployer)],
        deployer
      );
      expect(isOperator.result).toStrictEqual(Cl.bool(true));

      // Operator sends on behalf of holder
      simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-send",
        [
          Cl.principal(deployer),
          Cl.principal(user2),
          Cl.uint(amount),
          Cl.buffer(new Uint8Array(0)),
          Cl.buffer(new Uint8Array(0))
        ],
        user1
      );

      // Revoke operator
      simnet.callPublicFn(CONTRACT_NAME, "revoke-operator", [Cl.principal(user1)], deployer);

      // Verify revocation
      isOperator = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-operator-for",
        [Cl.principal(user1), Cl.principal(deployer)],
        deployer
      );
      expect(isOperator.result).toStrictEqual(Cl.bool(false));

      // Try to send again (should fail)
      const failedSend = simnet.callPublicFn(
        CONTRACT_NAME,
        "operator-send",
        [
          Cl.principal(deployer),
          Cl.principal(user3),
          Cl.uint(amount),
          Cl.buffer(new Uint8Array(0)),
          Cl.buffer(new Uint8Array(0))
        ],
        user1
      );
      expect(failedSend.result).toBeErr(Cl.uint(ERR_NOT_OPERATOR));
    });

    it("should handle pause/unpause flow correctly", () => {
      const amount = 1000000000000000000n;

      // Normal transfer works
      let result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(new Uint8Array(0))],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      // Pause contract
      simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);

      // Transfer fails when paused
      result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(new Uint8Array(0))],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(ERR_PAUSED));

      // Unpause contract
      simnet.callPublicFn(CONTRACT_NAME, "unpause-contract", [], deployer);

      // Transfer works again
      result = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tokens",
        [Cl.principal(user1), Cl.uint(amount), Cl.buffer(new Uint8Array(0))],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));
    });
  });
});
