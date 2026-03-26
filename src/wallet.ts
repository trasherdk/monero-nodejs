import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import type {
  WalletOptions,
  BalanceResponse,
  AddressResponse,
  TransferDestination,
  TransferOptions,
  TransferResponse,
  IncomingTransfer,
  Payment,
  IntegratedAddress,
  RpcVersion,
  KeyResponse
} from './types.js';

export default class Wallet {
  private hostname: string;
  private port: number;
  private user: string;
  private pass: string;
  private url?: string;
  private rpcPath: string;
  private ssl: boolean;
  private rejectUnauthorized: boolean;
  private request: AxiosInstance;

  constructor(optionsOrHostname?: string | WalletOptions, port?: number, user?: string, pass?: string) {
    let options: WalletOptions = {};
    if (typeof optionsOrHostname === 'object' && optionsOrHostname !== null) {
      options = optionsOrHostname;
    } else if (typeof optionsOrHostname === 'string') {
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
    this.ssl = options.ssl || false;
    this.rejectUnauthorized = options.rejectUnauthorized !== false;
    
    this.request = axios.create({
      httpsAgent: this.ssl ? new https.Agent({
        rejectUnauthorized: this.rejectUnauthorized,
        keepAlive: true
      }) : undefined
    });
  }

  private _request<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    const rpcPath = this.rpcPath.replace(/\$\{port\}/g, String(this.port));
    const protocol = this.ssl ? 'https' : 'http';
    const url = this.url 
      ? `${this.url}${rpcPath}/json_rpc` 
      : `${protocol}://${this.hostname}:${this.port}${rpcPath}/json_rpc`;
    
    const options: AxiosRequestConfig = {
      method: 'POST',
      url,
      data: {
        jsonrpc: '2.0',
        id: '0',
        method,
        ...(params && { params })
      }
    };

    if (this.user) {
      options.auth = {
        username: this.user,
        password: this.pass
      };
    }

    return this.request(url, options)
      .then((response) => {
        const result = response.data;
        if (result && typeof result === 'object' && 'result' in result) {
          return result.result as T;
        }
        return result as T;
      });
  }

  create_wallet(filename?: string, password?: string, language?: string): Promise<unknown> {
    return this._request('create_wallet', {
      filename: filename || 'monero_wallet',
      password: password || '',
      language: language || 'English'
    });
  }

  open_wallet(filename?: string, password?: string): Promise<unknown> {
    return this._request('open_wallet', {
      filename: filename || 'monero_wallet',
      password: password || ''
    });
  }

  close_wallet(): Promise<unknown> {
    return this._request('close_wallet');
  }

  store(): Promise<unknown> {
    return this._request('store');
  }

  stop_wallet(): Promise<unknown> {
    return this._request('stop_wallet');
  }

  balance(): Promise<BalanceResponse> {
    return this._request<BalanceResponse>('get_balance');
  }

  address(): Promise<AddressResponse> {
    return this._request<AddressResponse>('get_address');
  }

  transfer(destinations: TransferDestination | TransferDestination[], options: TransferOptions = {}): Promise<TransferResponse> {
    const destArray = Array.isArray(destinations) ? destinations : [destinations];
    destArray.forEach((dest) => {
      dest.amount = convert(dest.amount);
    });
    
    return this._request<TransferResponse>('transfer', {
      destinations: destArray,
      mixin: parseInt(String(options.mixin)) || 4,
      unlock_time: parseInt(String(options.unlockTime)) || 0,
      payment_id: options.pid || null,
      do_not_relay: options.do_not_relay || false,
      priority: parseInt(String(options.priority)) || 0,
      get_tx_hex: options.get_tx_hex || false,
      get_tx_key: options.get_tx_key || false
    });
  }

  transferSplit(destinations: TransferDestination | TransferDestination[], options: TransferOptions = {}): Promise<TransferResponse[]> {
    const destArray = Array.isArray(destinations) ? destinations : [destinations];
    destArray.forEach((dest) => {
      dest.amount = convert(dest.amount);
    });
    
    return this._request<TransferResponse[]>('transfer_split', {
      destinations: destArray,
      mixin: parseInt(String(options.mixin)) || 4,
      unlock_time: parseInt(String(options.unlockTime)) || 0,
      payment_id: options.pid || null,
      do_not_relay: options.do_not_relay || false,
      priority: parseInt(String(options.priority)) || 0,
      get_tx_hex: options.get_tx_hex || false,
      get_tx_key: options.get_tx_key || false,
      new_algorithm: false
    });
  }

  sweep_dust(): Promise<unknown> {
    return this._request('sweep_dust');
  }

  sweep_all(address: string): Promise<unknown> {
    return this._request('sweep_all', { address });
  }

  getPayments(pid: string): Promise<{ payments: Payment[] }> {
    return this._request<{ payments: Payment[] }>('get_payments', { payment_id: pid });
  }

  getBulkPayments(pids: string[], minHeight: number): Promise<{ payments: Payment[] }> {
    return this._request<{ payments: Payment[] }>('get_bulk_payments', {
      payment_ids: pids,
      min_block_height: minHeight
    });
  }

  incomingTransfers(type: 'all' | 'available' | 'unavailable'): Promise<{ transfers: IncomingTransfer[] }> {
    return this._request<{ transfers: IncomingTransfer[] }>('incoming_transfers', {
      transfer_type: type
    });
  }

  queryKey(type: string): Promise<KeyResponse> {
    return this._request<KeyResponse>('query_key', { key_type: type });
  }

  integratedAddress(pid: string): Promise<IntegratedAddress> {
    return this._request<IntegratedAddress>('make_integrated_address', { payment_id: pid });
  }

  splitIntegrated(address: string): Promise<{ standard_address: string; payment_id: string }> {
    return this._request<{ standard_address: string; payment_id: string }>('split_integrated_address', {
      integrated_address: address
    });
  }

  height(): Promise<{ height: number }> {
    return this._request<{ height: number }>('getheight');
  }

  get_version(): Promise<RpcVersion> {
    return this._request<RpcVersion>('get_version');
  }

  stopWallet(): Promise<unknown> {
    return this._request('stop_wallet');
  }
}

// Helper function to convert Monero amount to atomic units (1 XMR = 10^12 atomic units)
function convert(amount: number | string): number {
  const atomicUnitsPerXMR = 1000000000000n; // 10^12 as BigInt
  const amountStr = String(amount);
  const [whole = '0', fraction = ''] = amountStr.split('.');
  const paddedFraction = fraction.padEnd(12, '0').slice(0, 12);
  const atomicUnits = BigInt(whole) * atomicUnitsPerXMR + BigInt(paddedFraction);
  return Number(atomicUnits);
}
