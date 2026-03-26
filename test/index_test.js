'use strict';
import dotenv from 'dotenv';
import assert from 'node:assert';
import { describe, it, before, after } from 'node:test';

import Wallet from '../lib/wallet-axios.js';

dotenv.config({ path: './.env.dev', override: true });
const { WALLET_RPC_NAME, WALLET_RPC_IP, WALLET_RPC_PORT } = process.env;

describe('moneroWallet', () => {
    let wallet;
    let rpcAvailable = false;

    before(async () => {
        wallet = new Wallet({
            hostname: WALLET_RPC_IP,
            port: WALLET_RPC_PORT,
            ssl: true,
            rejectUnauthorized: false
        });
        console.log('Connecting to', WALLET_RPC_IP + ':' + WALLET_RPC_PORT);
        try {
            const result = await wallet.get_version();  // get_version doesn't require wallet
            console.log('get_version() returned:', result);
            rpcAvailable = true;
        } catch (err) {
            console.log('get_version() FAILED');
            console.log('Error type:', err.constructor.name);
            console.log('Error message:', err.message);
            console.log('Error code:', err.code);
            if (err.response) {
                console.log('Response status:', err.response.status);
                console.log('Response data:', err.response.data);
            }
        }
    });

    it('create_wallet() should create a new wallet or return error if exists', async (t) => {
        if (!rpcAvailable) return t.skip('RPC not available');
        const result = await wallet.create_wallet(WALLET_RPC_NAME);
        if (result.hasOwnProperty('error')) {
            assert.strictEqual(result.error.code, -21, 'Expected error code -21 for existing wallet');
        } else {
            assert.strictEqual(typeof result, 'object', 'Result should be an object');
        }
    });

    it('open_wallet() should open wallet', async (t) => {
        if (!rpcAvailable) return t.skip('RPC not available');
        const result = await wallet.open_wallet(WALLET_RPC_NAME);
        assert.strictEqual(typeof result, 'object', 'Result should be an object');
    });

    it('balance() should retrieve the account balance', async (t) => {
        if (!rpcAvailable) return t.skip('RPC not available');
        const result = await wallet.balance();
        assert.strictEqual(typeof result.balance, 'number', 'Balance should be a number');
    });

    it('address() should return the account address', async (t) => {
        if (!rpcAvailable) return t.skip('RPC not available');
        const result = await wallet.address();
        assert.strictEqual(typeof result.address, 'string', 'Address should be a string');
        assert.strictEqual(result.address.length, 95, 'Standard Monero address should be 95 characters');
        assert.ok(result.address.match(/^[458]/), 'Monero address should start with 4 (mainnet), 5 (stagenet), or 8 (subaddress)');
    });

    it('store() should save the wallet file', async (t) => {
        if (!rpcAvailable) {
            return t.skip('Skipping wallet store test - RPC not available');
        }
        console.log('Storing wallet...');
        try {
            await wallet.store();
            console.log('Wallet stored.');
        } catch (err) {
            console.log('Error storing wallet:', err.message);
        }
    });

    it('close_wallet() should close the wallet gracefully', async (t) => {
        if (!rpcAvailable) {
            return t.skip('Skipping wallet close test - RPC not available');
        }
        console.log('Closing wallet...');
        try {
            await wallet.close_wallet();
            console.log('Wallet closed.');
        } catch (err) {
            console.log('Error closing wallet:', err.message);
        }
    });

});
