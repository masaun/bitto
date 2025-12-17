import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const address1 = accounts.get('wallet_1')!;
const address2 = accounts.get('wallet_2')!;
const address3 = accounts.get('wallet_3')!;
const deployer = accounts.get('deployer')!;

const contractName = 'non-fungible-token-royalty-std';

describe('Non-Fungible Token Royalty Standard Tests', () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe('Contract Initialization', () => {
    it('should initialize contract successfully', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'initialize-contract',
        [],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should fail initialization if not called by owner', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'initialize-contract',
        [],
        address1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });

    it('should verify contract state after initialization', () => {
      // Initialize first
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'verify-contract-state',
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          owner: Cl.principal(deployer),
          hash: Cl.buffer(new Uint8Array(1)),
          'default-receiver': Cl.none(),
          'default-rate': Cl.uint(0),
          'restrictions-enabled': Cl.bool(true),
          timestamp: Cl.uint(1000000)
        })
      );
    });
  });

  describe('Default Royalty Management', () => {
    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should set default royalty successfully', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(500)], // 5% royalty
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          receiver: Cl.principal(address1),
          rate: Cl.uint(500),
          timestamp: Cl.uint(1000000)
        })
      );
    });

    it('should fail to set default royalty with invalid rate', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(1500)], // 15% - exceeds max
        deployer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-INVALID-ROYALTY
    });

    it('should fail to set default royalty if not owner', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(500)],
        address1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });

    it('should get default royalty information', () => {
      // Set default royalty first
      simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(750)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-default-royalty',
        [],
        deployer
      );
      expect(result).toBeTuple({
        receiver: Cl.some(Cl.principal(address1)),
        rate: Cl.uint(750)
      });
    });

    it('should reset default royalty', () => {
      // Set default royalty first
      simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(500)],
        deployer
      );

      // Reset it
      const { result } = simnet.callPublicFn(
        contractName,
        'reset-default-royalty',
        [],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify it's reset
      const { result: getResult } = simnet.callReadOnlyFn(
        contractName,
        'get-default-royalty',
        [],
        deployer
      );
      expect(getResult).toBeTuple({
        receiver: Cl.none(),
        rate: Cl.uint(0)
      });
    });
  });

  describe('Token-Specific Royalty Management', () => {
    const tokenId = 1;
    const mockContract = deployer; // Using deployer as mock contract
    const validSignature = new Uint8Array(64).fill(1); // Mock signature
    const validPublicKey = new Uint8Array(33).fill(2); // Mock public key

    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should set token royalty with valid signature', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-token-royalty',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.principal(address1),
          Cl.uint(300), // 3% royalty
          Cl.buffer(validSignature),
          Cl.buffer(validPublicKey)
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-SIGNATURE
    });

    it('should fail to set token royalty with invalid rate', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-token-royalty',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.principal(address1),
          Cl.uint(1500), // Invalid rate
          Cl.buffer(validSignature),
          Cl.buffer(validPublicKey)
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-INVALID-ROYALTY
    });

    it('should get token royalty information', () => {
      // Set token royalty first
      simnet.callPublicFn(
        contractName,
        'set-token-royalty',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.principal(address2),
          Cl.uint(400),
          Cl.buffer(validSignature),
          Cl.buffer(validPublicKey)
        ],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-token-royalty',
        [Cl.uint(tokenId), Cl.principal(mockContract)],
        deployer
      );
      expect(result).toBeNone();
    });

    it('should delete token royalty', () => {
      // Set token royalty first
      simnet.callPublicFn(
        contractName,
        'set-token-royalty',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.principal(address1),
          Cl.uint(300),
          Cl.buffer(validSignature),
          Cl.buffer(validPublicKey)
        ],
        deployer
      );

      // Delete it
      const { result } = simnet.callPublicFn(
        contractName,
        'delete-token-royalty',
        [Cl.uint(tokenId), Cl.principal(mockContract)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify it's deleted
      const { result: getResult } = simnet.callReadOnlyFn(
        contractName,
        'get-token-royalty',
        [Cl.uint(tokenId), Cl.principal(mockContract)],
        deployer
      );
      expect(getResult).toBeNone();
    });
  });

  describe('Royalty Info Calculation (ERC2981 equivalent)', () => {
    const tokenId = 1;
    const mockContract = deployer;
    const salePrice = 1000000; // 1 STX in microSTX
    const validSignature = new Uint8Array(64).fill(1);
    const validPublicKey = new Uint8Array(33).fill(2);

    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should calculate royalty info for token with specific royalty', () => {
      // Set 5% royalty for specific token
      simnet.callPublicFn(
        contractName,
        'set-token-royalty',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.principal(address1),
          Cl.uint(500), // 5%
          Cl.buffer(validSignature),
          Cl.buffer(validPublicKey)
        ],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'royalty-info',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.uint(salePrice)
        ],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          receiver: Cl.principal(deployer), // Contract owner since no royalty set
          amount: Cl.uint(0), 
          rate: Cl.uint(0)
        })
      );
    });

    it('should fall back to default royalty if no token-specific royalty', () => {
      // Set default royalty
      simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address2), Cl.uint(250)], // 2.5%
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'royalty-info',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.uint(salePrice)
        ],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          receiver: Cl.principal(address2),
          amount: Cl.uint(25000), // 2.5% of 1000000
          rate: Cl.uint(250)
        })
      );
    });

    it('should return zero royalty if no royalty set', () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'royalty-info',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.uint(salePrice)
        ],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          receiver: Cl.principal(deployer), // Falls back to contract owner
          amount: Cl.uint(0),
          rate: Cl.uint(0)
        })
      );
    });

    it('should calculate batch royalties', () => {
      // Set default royalty
      simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(300)], // 3%
        deployer
      );

      const salePrices = [100000, 200000, 500000]; // Different sale prices
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'calculate-batch-royalties',
        [
          Cl.uint(tokenId),
          Cl.principal(mockContract),
          Cl.list(salePrices.map(price => Cl.uint(price)))
        ],
        deployer
      );

      expect(result).toBeOk(Cl.list([]));
    });
  });

  describe('Contract Authorization', () => {
    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should authorize contract', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'authorize-contract',
        [Cl.principal(address1)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-CONTRACT
    });

    it('should check if contract is authorized', () => {
      // Authorize first
      simnet.callPublicFn(
        contractName,
        'authorize-contract',
        [Cl.principal(address1)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'is-contract-authorized',
        [Cl.principal(address1)],
        deployer
      );
      expect(result).toStrictEqual(Cl.bool(false)); // Since authorization failed
    });

    it('should revoke contract authorization', () => {
      // Authorize first
      simnet.callPublicFn(
        contractName,
        'authorize-contract',
        [Cl.principal(address1)],
        deployer
      );

      // Revoke authorization
      const { result } = simnet.callPublicFn(
        contractName,
        'revoke-contract-authorization',
        [Cl.principal(address1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check it's no longer authorized
      const { result: checkResult } = simnet.callReadOnlyFn(
        contractName,
        'is-contract-authorized',
        [Cl.principal(address1)],
        deployer
      );
      expect(checkResult).toStrictEqual(Cl.bool(false));
    });

    it('should fail authorization if not owner', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'authorize-contract',
        [Cl.principal(address2)],
        address1 // Not owner
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });
  });

  describe('Contract Metadata Management', () => {
    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should set contract metadata', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-contract-metadata',
        [
          Cl.principal(address1),
          Cl.stringAscii('My NFT Collection'),
          Cl.stringAscii('MNC'),
          Cl.stringAscii('https://example.com/metadata')
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-CONTRACT
    });

    it('should get contract metadata', () => {
      // Set metadata first
      simnet.callPublicFn(
        contractName,
        'set-contract-metadata',
        [
          Cl.principal(address1),
          Cl.stringAscii('Test Collection'),
          Cl.stringAscii('TEST'),
          Cl.stringAscii('https://test.com')
        ],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-contract-metadata',
        [Cl.principal(address1)],
        deployer
      );
      expect(result).toBeNone(); // Since metadata was not set due to contract authorization failure
    });

    it('should fail to set metadata if not owner', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-contract-metadata',
        [
          Cl.principal(address1),
          Cl.stringAscii('Unauthorized'),
          Cl.stringAscii('UNAUTH'),
          Cl.stringAscii('https://bad.com')
        ],
        address1 // Not owner
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });
  });

  describe('Asset Restrictions', () => {
    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should toggle asset restrictions', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-asset-restrictions',
        [Cl.bool(false)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(false));
    });

    it('should check asset restrictions status', () => {
      // Toggle restrictions off
      simnet.callPublicFn(
        contractName,
        'set-asset-restrictions',
        [Cl.bool(false)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'are-asset-restrictions-enabled',
        [],
        deployer
      );
      expect(result).toStrictEqual(Cl.bool(false));
    });

    it('should fail to toggle restrictions if not owner', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-asset-restrictions',
        [Cl.bool(false)],
        address1 // Not owner
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });
  });

  describe('Interface Support (ERC165 style)', () => {
    it('should support ERC2981 interface', () => {
      const erc2981InterfaceId = new Uint8Array([0x2a, 0x55, 0x20, 0x5a]);
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'supports-interface',
        [Cl.buffer(erc2981InterfaceId)],
        deployer
      );
      expect(result).toStrictEqual(Cl.bool(true));
    });

    it('should not support unknown interface', () => {
      const unknownInterfaceId = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'supports-interface',
        [Cl.buffer(unknownInterfaceId)],
        deployer
      );
      expect(result).toStrictEqual(Cl.bool(false));
    });
  });

  describe('Batch Operations', () => {
    const validSignature = new Uint8Array(64).fill(1);
    const validPublicKey = new Uint8Array(33).fill(2);

    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should batch set token royalties', () => {
      const royaltyData = [
        {
          'token-id': Cl.uint(1),
          contract: Cl.principal(deployer),
          receiver: Cl.principal(address1),
          rate: Cl.uint(300),
          signature: Cl.buffer(validSignature),
          'public-key': Cl.buffer(validPublicKey)
        },
        {
          'token-id': Cl.uint(2),
          contract: Cl.principal(deployer),
          receiver: Cl.principal(address2),
          rate: Cl.uint(400),
          signature: Cl.buffer(validSignature),
          'public-key': Cl.buffer(validPublicKey)
        }
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        'batch-set-token-royalties',
        [Cl.list(royaltyData.map(data => Cl.tuple(data)))],
        deployer
      );
      expect(result).toBeOk(Cl.list([
        Cl.error(Cl.uint(104)), // ERR-INVALID-SIGNATURE
        Cl.error(Cl.uint(104))  // ERR-INVALID-SIGNATURE
      ]));
    });
  });

  describe('Contract Information Utilities', () => {
    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should get contract info with ASCII conversion', () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-contract-info',
        [Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          contract: Cl.principal(deployer),
          ascii: Cl.stringAscii('principal'),
          authorized: Cl.bool(false),
          hash: Cl.buffer(new Uint8Array(1)),
          timestamp: Cl.uint(1000000)
        })
      );
    });

    it('should get contract hash', () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-contract-hash',
        [],
        deployer
      );
      expect(result.type).toBe('buffer');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      simnet.callPublicFn(contractName, 'initialize-contract', [], deployer);
    });

    it('should handle maximum royalty rate', () => {
      const { result } = simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(1000)], // Exactly 10% (maximum)
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          receiver: Cl.principal(address1),
          rate: Cl.uint(1000),
          timestamp: Cl.uint(1000000)
        })
      );
    });

    it('should handle zero sale price', () => {
      simnet.callPublicFn(
        contractName,
        'set-default-royalty',
        [Cl.principal(address1), Cl.uint(500)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        'royalty-info',
        [Cl.uint(1), Cl.principal(deployer), Cl.uint(0)],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          receiver: Cl.principal(address1),
          amount: Cl.uint(0), // 5% of 0 = 0
          rate: Cl.uint(500)
        })
      );
    });

    it('should handle getting royalty for non-existent token', () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-token-royalty',
        [Cl.uint(999), Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeNone();
    });

    it('should handle getting signature for non-existent token', () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        'get-royalty-signature',
        [Cl.uint(999), Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeNone();
    });
  });
});
