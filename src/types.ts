/**
 * Type definitions for Monero Wallet RPC
 * Based on monero-wallet-rpc JSON-RPC API
 */

// Wallet connection options
export interface WalletOptions {
  hostname?: string;
  port?: number;
  user?: string;
  pass?: string;
  url?: string;
  rpcPath?: string;
  ssl?: boolean;
  rejectUnauthorized?: boolean;
}

// RPC request structure
export interface RpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

// RPC response structure
export interface RpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string;
  result?: T;
  error?: RpcError;
}

export interface RpcError {
  code: number;
  message: string;
}

// Wallet balance response
export interface BalanceResponse {
  balance: number;
  unlocked_balance: number;
}

// Wallet address response
export interface AddressResponse {
  address: string;
  addresses?: SubAddress[];
}

export interface SubAddress {
  address: string;
  address_index: number;
  label: string;
  used: boolean;
}

// Transfer destination
export interface TransferDestination {
  address: string;
  amount: number | string;
}

// Transfer options
export interface TransferOptions {
  mixin?: number;
  unlockTime?: number;
  pid?: string;
  do_not_relay?: boolean;
  priority?: number;
  get_tx_hex?: boolean;
  get_tx_key?: boolean;
}

// Transfer response
export interface TransferResponse {
  tx_hash: string;
  tx_key?: string;
  amount: number;
  fee: number;
  tx_blob?: string;
}

// Incoming transfers
export interface IncomingTransfer {
  amount: number;
  spent: boolean;
  global_index: number;
  tx_hash: string;
  subaddr_index: number;
}

// Payment
export interface Payment {
  payment_id: string;
  tx_hash: string;
  amount: number;
  block_height: number;
  unlock_time: number;
  subaddr_index: number;
}

// Integrated address
export interface IntegratedAddress {
  integrated_address: string;
  payment_id: string;
}

// RPC version
export interface RpcVersion {
  version: number;
  release: boolean;
}

// Key query response
export interface KeyResponse {
  key: string;
}
