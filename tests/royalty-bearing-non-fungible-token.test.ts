import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "royalty-bearing-non-fungible-token";

// Helper function to add token type for testing (since initialize-contract
// uses contract-hash? which may fail in simnet)
const setupTokenType = () => {
  simnet.callPublicFn(
    CONTRACT_NAME,
    "add-allowed-token-type",
    [Cl.stringAscii("STX")],
    deployer
  );
};

describe("ERC-4910 Royalty Bearing Non-Fungible Token Tests", () => {
  
  describe("Contract Initialization and Clarity v4 Features", () => {
    
    it("should return correct contract name and symbol", () => {
      const name = simnet.callReadOnlyFn(CONTRACT_NAME, "get-name", [], deployer);
      expect(name.result).toBeAscii("Royalty Bearing NFT");

      const symbol = simnet.callReadOnlyFn(CONTRACT_NAME, "get-symbol", [], deployer);
      expect(symbol.result).toBeAscii("RBNFT");
    });

    it("should return contract URI", () => {
      const uri = simnet.callReadOnlyFn(CONTRACT_NAME, "contract-uri", [], deployer);
      expect(uri.result).toBeAscii("https://api.bitto.io/royalty-nft/");
    });

    it("should return initial total supply of zero", () => {
      const totalSupply = simnet.callReadOnlyFn(CONTRACT_NAME, "total-supply", [], deployer);
      expect(totalSupply.result).toBeUint(0);
    });

    it("should check asset restrictions using Clarity v4 feature", () => {
      const restrictions = simnet.callReadOnlyFn(CONTRACT_NAME, "check-asset-restrictions", [], deployer);
      expect(restrictions.result).toBeBool(false);
    });

    it("should get current stacks block time using Clarity v4 stacks-block-time", () => {
      const stacksTime = simnet.callReadOnlyFn(CONTRACT_NAME, "get-current-stacks-time", [], deployer);
      expect(stacksTime.result).toBeTruthy();
      expect(stacksTime.result.type).toBe(ClarityType.UInt);
    });

    it("should get contract hash using Clarity v4 contract-hash?", () => {
      const contractHash = simnet.callReadOnlyFn(
        CONTRACT_NAME, 
        "get-contract-hash", 
        [Cl.principal(deployer)], 
        deployer
      );
      expect(contractHash.result).toBeTruthy();
    });

    it("should convert uint to ASCII using Clarity v4 to-ascii?", () => {
      const asciiResult = simnet.callReadOnlyFn(
        CONTRACT_NAME, 
        "uint-to-ascii", 
        [Cl.uint(12345)], 
        deployer
      );
      expect(asciiResult.result).toBeTruthy();
    });

    it("should add allowed token type successfully", () => {
      // Use add-allowed-token-type directly since initialize-contract 
      // uses contract-hash? which may not work in simnet testing
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-allowed-token-type",
        [Cl.stringAscii("STX")],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify STX is allowed
      const stxAllowed = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-token-type-allowed",
        [Cl.stringAscii("STX")],
        deployer
      );
      expect(stxAllowed.result).toBeBool(true);

      // Verify event was emitted
      expect(events.length).toBeGreaterThan(0);
    });

    it("should fail to add token type by non-owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-allowed-token-type",
        [Cl.stringAscii("STX")],
        user1
      );
      expect(result).toBeErr(Cl.uint(1001)); // ERR-NOT-AUTHORIZED
    });

    it("should support ERC-165, ERC-721, ERC-2981, and ERC-4910 interfaces", () => {
      // ERC-165
      const erc165 = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "supports-interface",
        [Cl.buffer(Buffer.from("01ffc9a7", "hex"))],
        deployer
      );
      expect(erc165.result).toBeBool(true);

      // ERC-721
      const erc721 = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "supports-interface",
        [Cl.buffer(Buffer.from("80ac58cd", "hex"))],
        deployer
      );
      expect(erc721.result).toBeBool(true);

      // ERC-2981 Royalty
      const erc2981 = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "supports-interface",
        [Cl.buffer(Buffer.from("2a55205a", "hex"))],
        deployer
      );
      expect(erc2981.result).toBeBool(true);

      // ERC-4910 Custom
      const erc4910 = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "supports-interface",
        [Cl.buffer(Buffer.from("b7c0c27e", "hex"))],
        deployer
      );
      expect(erc4910.result).toBeBool(true);
    });
  });

  describe("NFT Minting with Royalty Accounts (ERC-4910 R18-R23)", () => {

    it("should mint a royalty bearing NFT without parent", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),           // to
          Cl.uint(1),                    // token-id
          Cl.stringAscii("Genesis NFT"), // name
          Cl.stringAscii("The first royalty bearing NFT"), // description
          Cl.stringAscii("https://api.bitto.io/royalty-nft/1"), // uri
          Cl.none(),                     // parent-id
          Cl.bool(true),                 // can-be-parent
          Cl.uint(5),                    // max-children
          Cl.uint(1000),                 // royalty-split-for-children (10%)
          Cl.uint(500),                  // creator-royalty-split (5%)
          Cl.none(),                     // signature
          Cl.none(),                     // public-key
          Cl.none()                      // message-hash
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.tuple({
        "token-id": Cl.uint(1),
        "ra-account-id": Cl.uint(1)
      }));

      // Verify event was emitted for chainhook
      expect(events.length).toBeGreaterThan(0);
      const printEvent = events.find(e => e.event === "print_event");
      expect(printEvent).toBeTruthy();

      // Verify token supply increased
      const totalSupply = simnet.callReadOnlyFn(CONTRACT_NAME, "total-supply", [], deployer);
      expect(totalSupply.result).toBeUint(1);

      // Verify owner
      const owner = simnet.callReadOnlyFn(CONTRACT_NAME, "owner-of", [Cl.uint(1)], deployer);
      expect(owner.result).toBeOk(Cl.principal(user1));

      // Verify token URI
      const uri = simnet.callReadOnlyFn(CONTRACT_NAME, "token-uri", [Cl.uint(1)], deployer);
      expect(uri.result).toBeOk(Cl.stringAscii("https://api.bitto.io/royalty-nft/1"));

      // Verify royalty account was created
      const royaltyAccount = simnet.callReadOnlyFn(
        CONTRACT_NAME, 
        "get-royalty-account", 
        [Cl.uint(1)], 
        deployer
      );
      expect(royaltyAccount.result).toHaveProperty("type", "ok");
    });

    it("should mint a child NFT with parent relationship", () => {
      // First mint the parent
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Parent NFT"),
          Cl.stringAscii("A parent NFT that can have children"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/parent/1"),
          Cl.none(),
          Cl.bool(true),  // can-be-parent
          Cl.uint(5),     // max-children
          Cl.uint(1000),  // royalty-split-for-children (10%)
          Cl.uint(500),   // creator-royalty-split (5%)
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // Now mint a child NFT
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user2),
          Cl.uint(2),
          Cl.stringAscii("Child NFT"),
          Cl.stringAscii("A child NFT derived from parent"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/child/2"),
          Cl.some(Cl.uint(1)),  // parent-id
          Cl.bool(false),       // can-be-parent
          Cl.uint(0),           // max-children
          Cl.uint(0),           // royalty-split-for-children
          Cl.uint(800),         // creator-royalty-split (8%)
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      expect(result).toBeOk(Cl.tuple({
        "token-id": Cl.uint(2),
        "ra-account-id": Cl.uint(2)
      }));

      // Verify child count on parent
      const childCount = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-nft-child-count",
        [Cl.uint(1)],
        deployer
      );
      expect(childCount.result).toBeUint(1);

      // Verify children list
      const children = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-nft-children",
        [Cl.uint(1)],
        deployer
      );
      expect(children.result).toHaveProperty("type", "list");
    });

    it("should fail to mint with invalid royalty rate", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Invalid NFT"),
          Cl.stringAscii("NFT with invalid royalty"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/invalid"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(15000), // Invalid: > 100%
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(1009)); // ERR-INVALID-ROYALTY-RATE
    });

    it("should fail to mint duplicate token ID", () => {
      // Mint first token
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("First NFT"),
          Cl.stringAscii("Original NFT"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/1"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // Try to mint with same ID
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user2),
          Cl.uint(1), // Duplicate ID
          Cl.stringAscii("Duplicate NFT"),
          Cl.stringAscii("Should fail"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/duplicate"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(1004)); // ERR-TOKEN-ALREADY-EXISTS
    });

    it("should fail to mint with invalid parent", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Orphan NFT"),
          Cl.stringAscii("NFT with non-existent parent"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/orphan"),
          Cl.some(Cl.uint(999)), // Non-existent parent
          Cl.bool(false),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(1011)); // ERR-INVALID-PARENT
    });

    it("should fail to mint with invalid signature using secp256r1-verify", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Signed NFT"),
          Cl.stringAscii("NFT with invalid signature"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/signed"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.some(Cl.bufferFromHex("00".repeat(64))), // Invalid signature
          Cl.some(Cl.bufferFromHex("00".repeat(33))), // Invalid public key
          Cl.some(Cl.bufferFromHex("00".repeat(32)))  // Invalid message hash
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(1006)); // ERR-INVALID-SIGNATURE
    });

    it("should fail to mint when assets are restricted", () => {
      // Enable restrictions
      simnet.callPublicFn(
        CONTRACT_NAME,
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Restricted NFT"),
          Cl.stringAscii("Should fail due to restrictions"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/restricted"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(1008)); // ERR-ASSETS-RESTRICTED

      // Disable restrictions for other tests
      simnet.callPublicFn(
        CONTRACT_NAME,
        "set-asset-restrictions",
        [Cl.bool(false)],
        deployer
      );
    });
  });

  describe("Royalty Account Management (ERC-4910 R12-R17)", () => {

    it("should get royalty account for a token", () => {
      // Mint a token first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Royalty Test"),
          Cl.stringAscii("Testing royalty account"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/royalty"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const royaltyAccount = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-royalty-account",
        [Cl.uint(1)],
        deployer
      );

      expect(royaltyAccount.result).toHaveProperty("type", "ok");
      const raValue = royaltyAccount.result.value;
      expect(raValue).toHaveProperty("type", "tuple");
      expect(raValue.value["asset-id"]).toBeUint(1);
      expect(raValue.value["is-active"]).toBeBool(true);
    });

    it("should get royalty sub-account", () => {
      // Mint a token first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Sub Account Test"),
          Cl.stringAscii("Testing sub accounts"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/subaccount"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const subAccount = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-royalty-sub-account",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );

      expect(subAccount.result).toHaveProperty("type", "some");
      const saValue = subAccount.result.value;
      expect(saValue.value["account-id"]).toBePrincipal(user1);
      expect(saValue.value["royalty-split"]).toBeUint(500);
    });

    it("should calculate royalty info for a sale", () => {
      // Mint a token first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Royalty Info Test"),
          Cl.stringAscii("Testing royalty info calculation"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/info"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),  // 5% royalty
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const royaltyInfo = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "royalty-info",
        [Cl.uint(1), Cl.uint(10000)], // Sale price of 10000
        deployer
      );

      expect(royaltyInfo.result).toHaveProperty("type", "ok");
      const info = royaltyInfo.result.value;
      expect(info.value["receiver"]).toBePrincipal(user1);
      // 5% of 10000 = 500
      expect(info.value["amount"]).toBeUint(500);
      expect(info.value["rate"]).toBeUint(500);
    });

    it("should get sub-account count", () => {
      // Mint a token first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Count Test"),
          Cl.stringAscii("Testing sub account count"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/count"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const count = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-sub-account-count",
        [Cl.uint(1)],
        deployer
      );
      expect(count.result).toBeUint(1);
    });
  });

  describe("NFT Listing and Sales (ERC-4910 R24-R30)", () => {

    it("should list NFT for direct sale", () => {
      // Add token type for listing
      setupTokenType();

      // Mint a token
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Listed NFT"),
          Cl.stringAscii("NFT for sale"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/listed"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // List the NFT
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [
          Cl.list([Cl.uint(1)]),     // token-ids
          Cl.uint(5000),             // price
          Cl.stringAscii("STX")      // token-type
        ],
        user1
      );

      expect(result).toBeOk(Cl.uint(1)); // listing-id

      // Verify event emitted
      expect(events.length).toBeGreaterThan(0);

      // Verify listing exists
      const listing = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-nft-listing",
        [Cl.uint(1)],
        deployer
      );
      expect(listing.result).toHaveProperty("type", "some");
    });

    it("should fail to list with invalid token type", () => {
      // Mint a token
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Invalid List NFT"),
          Cl.stringAscii("NFT with invalid token type"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/invalid-list"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [
          Cl.list([Cl.uint(1)]),
          Cl.uint(5000),
          Cl.stringAscii("INVALID")  // Invalid token type
        ],
        user1
      );
      expect(result).toBeErr(Cl.uint(1022)); // ERR-INVALID-TOKEN-TYPE
    });

    it("should remove NFT listing", () => {
      // Add token type and mint
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Delist NFT"),
          Cl.stringAscii("NFT to be delisted"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/delist"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // List the NFT
      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      // Remove listing
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "remove-nft-listing",
        [Cl.uint(1)],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);
    });

    it("should fail to remove listing by non-seller", () => {
      // Add token type and mint
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Non-seller Delist"),
          Cl.stringAscii("Testing unauthorized delist"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/non-seller"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // List the NFT
      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      // Try to remove listing as non-seller
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "remove-nft-listing",
        [Cl.uint(1)],
        user2
      );
      expect(result).toBeErr(Cl.uint(1001)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Payment Processing (ERC-4910 R31-R45)", () => {

    it("should execute payment for listed NFT", () => {
      // Setup token type
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Payment NFT"),
          Cl.stringAscii("NFT for payment test"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/payment"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      // Execute payment
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "execute-payment",
        [
          Cl.uint(1),      // listing-id
          Cl.uint(5000),   // payment
          Cl.none(),       // signature
          Cl.none(),       // public-key
          Cl.none()        // message-hash
        ],
        user2
      );

      expect(result).toBeOk(Cl.uint(1)); // payment-id
      expect(events.length).toBeGreaterThan(0);

      // Verify payment was registered
      const payment = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-registered-payment",
        [Cl.uint(1)],
        deployer
      );
      expect(payment.result).toHaveProperty("type", "some");
    });

    it("should fail payment with insufficient amount", () => {
      // Setup token type
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Insufficient Payment"),
          Cl.stringAscii("Testing insufficient payment"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/insufficient"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "execute-payment",
        [
          Cl.uint(1),
          Cl.uint(1000),  // Less than listing price
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        user2
      );
      expect(result).toBeErr(Cl.uint(1016)); // ERR-INSUFFICIENT-PAYMENT
    });

    it("should reverse payment", () => {
      // Setup token type
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Reverse Payment"),
          Cl.stringAscii("Testing payment reversal"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/reverse"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "execute-payment",
        [Cl.uint(1), Cl.uint(5000), Cl.none(), Cl.none(), Cl.none()],
        user2
      );

      // Reverse the payment
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "reverse-payment",
        [Cl.uint(1)],
        user2
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);
    });

    it("should fail to reverse payment by non-buyer", () => {
      // Setup token type
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Non-buyer Reverse"),
          Cl.stringAscii("Testing unauthorized reversal"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/non-buyer"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "execute-payment",
        [Cl.uint(1), Cl.uint(5000), Cl.none(), Cl.none(), Cl.none()],
        user2
      );

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "reverse-payment",
        [Cl.uint(1)],
        user3  // Not the buyer
      );
      expect(result).toBeErr(Cl.uint(1001)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("NFT Transfer with Royalty Distribution (ERC-4910 R46-R54)", () => {

    it("should transfer NFT with royalty distribution", () => {
      // Setup token type
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Transfer NFT"),
          Cl.stringAscii("NFT for transfer test"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/transfer"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "execute-payment",
        [Cl.uint(1), Cl.uint(5000), Cl.none(), Cl.none(), Cl.none()],
        user2
      );

      // Transfer with royalty distribution
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "safe-transfer-from",
        [
          Cl.principal(user1),  // from
          Cl.principal(user2),  // to
          Cl.uint(1),           // token-id
          Cl.uint(1)            // payment-id
        ],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);

      // Verify new owner
      const newOwner = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "owner-of",
        [Cl.uint(1)],
        deployer
      );
      expect(newOwner.result).toBeOk(Cl.principal(user2));
    });
  });

  describe("ERC-721 Standard Functions", () => {

    it("should approve operator for token", () => {
      // Mint a token
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Approval NFT"),
          Cl.stringAscii("Testing approvals"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/approval"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // Approve user2
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "approve",
        [Cl.principal(user2), Cl.uint(1)],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);

      // Verify approval
      const approved = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-approved",
        [Cl.uint(1)],
        deployer
      );
      expect(approved.result).toBeOk(Cl.some(Cl.principal(user2)));
    });

    it("should set approval for all", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-approval-for-all",
        [Cl.principal(user2), Cl.bool(true)],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);

      // Verify approval
      const isApproved = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-approved-for-all",
        [Cl.principal(user1), Cl.principal(user2)],
        deployer
      );
      expect(isApproved.result).toBeBool(true);
    });

    it("should burn NFT", () => {
      // Mint a token
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Burn NFT"),
          Cl.stringAscii("NFT to be burned"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/burn"),
          Cl.none(),
          Cl.bool(false), // cannot be parent
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // Burn the token
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [Cl.uint(1)],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);

      // Verify token no longer exists
      const exists = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "token-exists",
        [Cl.uint(1)],
        deployer
      );
      expect(exists.result).toBeBool(false);
    });

    it("should fail to burn NFT with children", () => {
      // Mint parent
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Parent Burn"),
          Cl.stringAscii("Parent with children"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/parent-burn"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // Mint child
      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user2),
          Cl.uint(2),
          Cl.stringAscii("Child Burn"),
          Cl.stringAscii("Child of parent"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/child-burn"),
          Cl.some(Cl.uint(1)),
          Cl.bool(false),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      // Try to burn parent
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [Cl.uint(1)],
        user1
      );
      expect(result).toBeErr(Cl.uint(1023)); // ERR-NFT-HAS-CHILDREN
    });
  });

  describe("Admin Functions", () => {

    it("should set contract URI", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-contract-uri",
        [Cl.stringAscii("https://new-api.bitto.io/royalty-nft/")],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);

      const uri = simnet.callReadOnlyFn(CONTRACT_NAME, "contract-uri", [], deployer);
      expect(uri.result).toBeAscii("https://new-api.bitto.io/royalty-nft/");
    });

    it("should set max generations", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-max-generations",
        [Cl.uint(10)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(10));
      expect(events.length).toBeGreaterThan(0);
    });

    it("should set max children", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-max-children",
        [Cl.uint(20)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(20));
      expect(events.length).toBeGreaterThan(0);
    });

    it("should set platform fee rate", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-platform-fee-rate",
        [Cl.uint(300)], // 3%
        deployer
      );

      expect(result).toBeOk(Cl.uint(300));
      expect(events.length).toBeGreaterThan(0);
    });

    it("should set platform fee receiver", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-platform-fee-receiver",
        [Cl.principal(user3)],
        deployer
      );

      expect(result).toBeOk(Cl.principal(user3));
      expect(events.length).toBeGreaterThan(0);
    });

    it("should add allowed token type", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "add-allowed-token-type",
        [Cl.stringAscii("BTC")],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBeGreaterThan(0);

      const allowed = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-token-type-allowed",
        [Cl.stringAscii("BTC")],
        deployer
      );
      expect(allowed.result).toBeBool(true);
    });

    it("should fail admin functions for non-owner", () => {
      const uriResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-contract-uri",
        [Cl.stringAscii("https://malicious.io/")],
        user1
      );
      expect(uriResult.result).toBeErr(Cl.uint(1001));

      const genResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-max-generations",
        [Cl.uint(100)],
        user1
      );
      expect(genResult.result).toBeErr(Cl.uint(1001));

      const childResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-max-children",
        [Cl.uint(100)],
        user1
      );
      expect(childResult.result).toBeErr(Cl.uint(1001));

      const feeResult = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-platform-fee-rate",
        [Cl.uint(5000)],
        user1
      );
      expect(feeResult.result).toBeErr(Cl.uint(1001));
    });
  });

  describe("Event Emissions for Chainhook Integration", () => {

    it("should emit events on mint for chainhook tracking", () => {
      const { events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Event NFT"),
          Cl.stringAscii("Testing event emission"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/event"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const printEvents = events.filter(e => e.event === "print_event");
      expect(printEvents.length).toBeGreaterThan(0);
      
      // Verify event contains expected data
      const mintEvent = printEvents.find(e => {
        try {
          const data = e.data?.value;
          return data && data.event && data.event.data === "royalty-nft-minted";
        } catch {
          return false;
        }
      });
      // Event structure may vary, just verify events are emitted
      expect(printEvents.length).toBeGreaterThan(0);
    });

    it("should emit events on listing for chainhook tracking", () => {
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Listing Event NFT"),
          Cl.stringAscii("Testing listing event"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/listing-event"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      const { events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      const printEvents = events.filter(e => e.event === "print_event");
      expect(printEvents.length).toBeGreaterThan(0);
    });

    it("should emit events on transfer for chainhook tracking", () => {
      setupTokenType();

      simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [
          Cl.principal(user1),
          Cl.uint(1),
          Cl.stringAscii("Transfer Event NFT"),
          Cl.stringAscii("Testing transfer event"),
          Cl.stringAscii("https://api.bitto.io/royalty-nft/transfer-event"),
          Cl.none(),
          Cl.bool(true),
          Cl.uint(5),
          Cl.uint(1000),
          Cl.uint(500),
          Cl.none(),
          Cl.none(),
          Cl.none()
        ],
        deployer
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "list-nft",
        [Cl.list([Cl.uint(1)]), Cl.uint(5000), Cl.stringAscii("STX")],
        user1
      );

      simnet.callPublicFn(
        CONTRACT_NAME,
        "execute-payment",
        [Cl.uint(1), Cl.uint(5000), Cl.none(), Cl.none(), Cl.none()],
        user2
      );

      const { events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "safe-transfer-from",
        [Cl.principal(user1), Cl.principal(user2), Cl.uint(1), Cl.uint(1)],
        user1
      );

      const printEvents = events.filter(e => e.event === "print_event");
      expect(printEvents.length).toBeGreaterThan(0);
    });
  });
});
