#!/bin/bash

BASE=$( realpath "$(dirname "$0")/.." )
#echo "BASE: ${BASE}"

#FILE="${BASE}/data/stagenet/wallets/test"
#FILE="test_wallet"
#echo "Create wallet: ${FILE}"

source ${BASE}/.env.dev

if [ $# -eq 0 ]; then
	FILE="${WALLET_RPC_NAME}-${WALLET_RPC_PORT}"
else
	FILE=$1
fi

PARAMS="{\"jsonrpc\":\"2.0\",\"id\":\"0\",\"method\":\"open_wallet\",\"params\":{\"filename\":\"${FILE}\"}}"
#echo "Parameters: ${PARAMS}"

curl http://${WALLET_RPC_IP}:${WALLET_RPC_PORT}/json_rpc \
  --silent \
  -d "${PARAMS}" \
  -H 'Content-Type: application/json'
