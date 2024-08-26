import Wallet from './lib/wallet-axios.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.dev' });

const { WALLET_RPC_NAME, WALLET_RPC_IP, WALLET_RPC_PORT } = process.env;

const wallet = new Wallet(WALLET_RPC_IP, WALLET_RPC_PORT);

/*
await wallet.create_wallet(WALLET_RPC_NAME).then(async (result) => {
    console.log('create_wallet:', result.data);
    if (result.data.hasOwnProperty('error')) {
        await wallet.open_wallet(WALLET_RPC_NAME).then((result) => {
            console.log('open_wallet:', result.data);
        })
    }
});
*/

const WALLET_FILE = WALLET_RPC_NAME + '-' + WALLET_RPC_PORT

let response = await wallet.open_wallet(WALLET_FILE).then((result) => {
    console.log('open_wallet:', result.data);
    return result.data;
})

if (response.hasOwnProperty('error')) {
    const error = response.error;
    console.log('wallet open response: code[%s] message:[%s]', error.code, error.message || '');
} else {

    await wallet.address().then((result) => {
        console.log('address:', result.data);
    });

    await wallet.balance().then((result) => {
        console.log('balance:', result.data);
    });

    await wallet.close_wallet().then((result) => {
        console.log('close_wallet:', result.data);
    })
}
console.log('Exiting...');
process.exit(0);


/*

if (response.hasOwnProperty('error')) {
    const error = response.error;
    //console.log('wallet open response: code[%s] message:[%s]', error.code, error.message || '');
    await wallet.close_wallet().then((result) => {
        console.log('close_wallet:', result.data);
    })
    await wallet.create_wallet(WALLET_RPC_NAME)
        .then((result) => {
            console.log('create_wallet:', result.data);
        })
}
*/

/**
 * This will shot down the wallet process
 *
await wallet.stop_wallet().then((result) => {
    console.log('stop_wallet', result.data);
})
 **/

