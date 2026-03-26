'use strict';
import dotenv from 'dotenv';
import assert from 'node:assert';
import test from 'node:test';

import Wallet from '../lib/wallet-axios.js';

dotenv.config({ path: './.env.dev' });
const { WALLET_RPC_NAME, WALLET_RPC_IP, WALLET_RPC_PORT } = process.env;

let wallet
test('moneroWallet', () => {
    wallet = new Wallet(WALLET_RPC_IP, WALLET_RPC_PORT); // Edit to match your own hostname, port, RPC username (if RPC login enabled,) and RPC password.

    // Disabled these checks because users may access unique daemon hostname:port combinations.
    // test('constructor', () => {
    //     it('should have default host set to `127.0.0.1`', () => {
    //         new moneroWallet().hostname.should.equal('127.0.0.1');
    //     });
    //
    //     // it('should have default port set to 18082', () => {
    //     //     new moneroWallet().port.should.equal(18082);
    //     // });
    // });

    test('methods', () => {
        test('create_wallet()', () => {
            it('should create a new wallet monero_wallet (if monero_wallet doesn\'t exist)', (done) => {
                wallet.create_wallet('monero_wallet').then(function (result) {
                    if (result.hasOwnProperty('error')) {
                        if (result.hasOwnProperty('error')) {
                            if (result.error.code == -21) {
                                result.error.code.should.be.equal(-21)
                            }
                        }
                    } else {
                        result.should.be.a.Object();
                    }
                    done();
                })
            })
        })

        test('open_wallet()', () => {
            it('should open monero_wallet', (done) => {
                wallet.open_wallet('monero_wallet').then(function (result) {
                    result.should.be.a.Object();
                    done();
                })
            })
        })

        test('balance()', () => {
            it('should retrieve the account balance', (done) => {
                wallet.balance().then(function (result) {
                    result.balance.should.be.a.Number();
                    done();
                })
            })
        })

        test('address()', () => {
            it('should return the account address', (done) => {
                wallet.address().then(function (result) {
                    result.address.should.be.a.String();
                    done();
                })
            })
        })
    })
})
