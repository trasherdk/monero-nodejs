'use strict';
import axios from 'axios';

// const request = axios.create();

export default class Wallet {
    constructor (optionsOrHostname, port, user, pass) {
        let options = {};
        if (typeof optionsOrHostname === 'object' && optionsOrHostname !== null) {
            options = optionsOrHostname;
        } else {
            options.hostname = optionsOrHostname;
            options.port = port;
            options.user = user;
            options.pass = pass;
        }
        this.hostname = options.hostname || '127.0.0.1';
        this.port = options.port || 18082;
        this.user = options.user || '';
        this.pass = options.pass || '';
        this.url = options.url;
        this.rpcPath = options.rpcPath || '';
        this.request = axios.create();

        console.log('connect:', this.hostname, this.port, this.user, this.pass);
        /**
         *  This line is necessary in order to do the initial
         * handshake between this wrapper and monero-wallet-rpc;
         * without it, the first request to the wrapper fails
         * (subsequent request succeed, though.)
         *  */
        this._request('get_balance', { 'account_index': 0 })
            .catch((err) => {
                console.log('error - constructor:', err);
            });
    }

    // general API wallet request
    _request (method = '', params = '') {
        let rpcPath = this.rpcPath.replace(/\$\{port\}/g, this.port);
        let url = this.url ? `${this.url}${rpcPath}/json_rpc` : `http://${this.hostname}:${this.port}${rpcPath}/json_rpc`;
        let options = {
            method: 'POST',
            url: url,
            data: {
                jsonrpc: '2.0',
                id: '0',
            }
        };

        if (!method) {
            throw new Error('method is required');
        }
        options.data.method = method;

        if (params) {
            options.data.params = params;
        }
        if (this.user) {
            options['auth'] = {
                'user': this.user,
                'pass': this.pass,
                'sendImmediately': false
            }
        }
        return this.request(`http://${this.hostname}:${this.port}/json_rpc`, options)
            .then((result) => {
                if (result.hasOwnProperty('result')) {
                    return result.result;
                } else {
                    return result;
                }
            })
            .catch((err) => {
                console.log('error - request %s:', method, err);
            });
    };

    /**
     * Wallet Methods
     * @type {Wallet}
     */

    // creates a new wallet
    create_wallet (filename, password, language) {
        const method = 'create_wallet';
        const params = {
            filename: filename || 'monero_wallet',
            'password': password || '',
            'language': language || 'English'
        };
        return this._request(method, params);
    };

    // open a wallet
    open_wallet (filename, password) {
        const method = 'open_wallet';
        const params = {
            filename: filename || 'monero_wallet',
            'password': password || ''
        };
        return this._request(method, params);
    };

    close_wallet () {
        const method = 'close_wallet';
        return this._request(method);
    }
    // stops the wallet
    stop_wallet () {
        let method = 'stop_wallet';
        return this._request(method);
    };

    // returns the wallet balance
    balance () {
        let method = 'get_balance';
        return this._request(method);
    };

    // return the wallet address
    address () {
        let method = 'get_address';
        return this._request(method);
    };

    // transfer Monero to a single recipient, or a group of recipients
    transfer (destinations, options) {
        if (typeof options === 'undefined') options = {};
        if (Array.isArray(destinations)) {
            destinations.forEach((dest) => dest.amount = convert(dest.amount));
        } else {
            destinations.amount = convert(destinations.amount);
            destinations = [destinations];
        }
        let method = 'transfer';
        let params = {
            destinations: destinations,
            mixin: parseInt(options.mixin) || 4,
            unlock_time: parseInt(options.unlockTime) || 0,
            payment_id: options.pid || null,
            do_not_relay: options.do_not_relay || false,
            priority: parseInt(options.priority) || 0,
            get_tx_hex: options.get_tx_hex || false,
            get_tx_key: options.get_tx_key || false
        };
        return this._request(method, params);
    };

    // split a transfer into more than one tx if necessary
    transferSplit (destinations, options) {
        if (typeof options === 'undefined') options = {};
        if (Array.isArray(destinations)) {
            destinations.forEach((dest) => dest.amount = convert(dest.amount));
        } else {
            destinations.amount = convert(destinations.amount);
            destinations = [destinations];
        }
        let method = 'transfer_split';
        let params = {
            destinations: destinations,
            mixin: parseInt(options.mixin) || 4,
            unlock_time: parseInt(options.unlockTime) || 0,
            payment_id: options.pid || null,
            do_not_relay: options.do_not_relay || false,
            priority: parseInt(options.priority) || 0,
            get_tx_hex: options.get_tx_hex || false,
            get_tx_key: options.get_tx_key || false,
            new_algorithm: options.new_algorithm || false
        };
        return this._request(method, params);
    };

    // send all dust outputs back to the wallet with 0 mixin
    sweep_dust () {
        let method = 'sweep_dust';
        return this._request(method);
    };

    // send all dust outputs back to the wallet with 0 mixin
    sweep_all (address) {
        let method = 'sweep_all';
        let params = { address: address };
        return this._request(method, params);
    };

    // get a list of incoming payments using a given payment ID
    getPayments (pid) {
        let method = 'get_payments';
        let params = {};
        params.payment_id = pid;
        return this._request(method, params);
    };

    // get a list of incoming payments using a single payment ID or list of payment IDs from a given height
    getBulkPayments (pids, minHeight) {
        let method = 'get_bulk_payments';
        let params = {};
        params.payment_ids = pids;
        params.min_block_height = minHeight;
        return this._request(method, params);
    };

    // return a list of incoming transfers to the wallet (type can be "all", "available", or "unavailable")
    incomingTransfers (type) {
        let method = 'incoming_transfers';
        let params = {};
        params.transfer_type = type;
        return this._request(method, params);
    };

    // return the spend key or view private key (type can be 'mnemonic' seed or 'view_key')
    queryKey (type) {
        let method = 'query_key';
        let params = {};
        params.key_type = type;
        return this._request(method, params);
    };

    // make an integrated address from the wallet address and a payment id
    integratedAddress (pid) {
        let method = 'make_integrated_address';
        let params = {};
        params.payment_id = pid;
        return this._request(method, params);
    };

    // retrieve the standard address and payment id from an integrated address
    splitIntegrated (address) {
        let method = 'split_integrated_address';
        let params = {};
        params.integrated_address = address;
        return this._request(method, params);
    };

    // return the current block height
    height () {
        let method = 'getheight';
        return this._request(method);
    };

    // stop the current simplewallet process
    stopWallet () {
        let method = 'stop_wallet';
        return this._request(method);
    };

}

// helper function to convert Monero amount to atomic units
const convert = (amount) => {
    let number = Number(amount) * 1e12;
    // remove any decimals
    number = number.toFixed(0);
    return Number(number);
}
