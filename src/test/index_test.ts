import dotenv from 'dotenv';
import assert from 'node:assert';
import { describe, it, before, type TestContext } from 'node:test';

import Wallet from '../wallet.js';

dotenv.config({ path: './.env.dev', override: true });
const { WALLET_RPC_NAME, WALLET_RPC_IP, WALLET_RPC_PORT } = process.env;

describe('moneroWallet', () => {
  let wallet: Wallet;
  let rpcAvailable = false;

  before(async () => {
    wallet = new Wallet({
      hostname: WALLET_RPC_IP,
      port: WALLET_RPC_PORT ? parseInt(WALLET_RPC_PORT, 10) : undefined,
      ssl: true,
      rejectUnauthorized: false
    });
    console.log('Connecting to', WALLET_RPC_IP + ':' + WALLET_RPC_PORT);
    try {
      const result = await wallet.get_version();
      console.log('get_version() returned:', result);
      rpcAvailable = true;
    } catch (err) {
      console.log('get_version() FAILED');
      console.log('Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.log('Error message:', err instanceof Error ? err.message : String(err));
    }
  });

  it('create_wallet() should create a new wallet or return error if exists', async (t: TestContext) => {
    if (!rpcAvailable) return t.skip('RPC not available');
    const result = await wallet.create_wallet(WALLET_RPC_NAME);
    if (result && typeof result === 'object' && 'error' in result) {
      assert.strictEqual((result as { error: { code: number } }).error.code, -21, 'Expected error code -21 for existing wallet');
    } else {
      assert.strictEqual(typeof result, 'object', 'Result should be an object');
    }
  });

  it('open_wallet() should open wallet', async (t: TestContext) => {
    if (!rpcAvailable) return t.skip('RPC not available');
    const result = await wallet.open_wallet(WALLET_RPC_NAME);
    assert.strictEqual(typeof result, 'object', 'Result should be an object');
  });

  it('balance() should retrieve the account balance', async (t: TestContext) => {
    if (!rpcAvailable) return t.skip('RPC not available');
    const result = await wallet.balance();
    assert.strictEqual(typeof result.balance, 'number', 'Balance should be a number');
  });

  it('address() should return the account address', async (t: TestContext) => {
    if (!rpcAvailable) return t.skip('RPC not available');
    const result = await wallet.address();
    assert.strictEqual(typeof result.address, 'string', 'Address should be a string');
    assert.strictEqual(result.address.length, 95, 'Standard Monero address should be 95 characters');
    assert.ok(result.address.match(/^[458]/), 'Monero address should start with 4 (mainnet), 5 (stagenet), or 8 (subaddress)');
  });

  it('store() should save the wallet', async (t: TestContext) => {
    if (!rpcAvailable) return t.skip('RPC not available');
    const result = await wallet.store();
    assert.strictEqual(typeof result, 'object', 'Result should be an object');
  });

  it('close_wallet() should close the wallet gracefully', async (t: TestContext) => {
    if (!rpcAvailable) return t.skip('RPC not available');
    const result = await wallet.close_wallet();
    assert.strictEqual(typeof result, 'object', 'Result should be an object');
  });
});
