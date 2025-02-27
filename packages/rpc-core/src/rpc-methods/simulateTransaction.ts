import { Base58EncodedAddress } from '@solana/addresses';
import { Base64EncodedWireTransaction } from '@solana/transactions';

import { Commitment } from '../commitment';
import { TransactionError } from '../transaction-error';
import {
    AccountInfoBase,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Base58EncodedBytes,
    Base64EncodedDataResponse,
    RpcResponse,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

type SimulateTransactionConfigBase = Readonly<{
    /**
     * Commitment level to simulate the transaction at
     * @defaultValue finalized
     * */
    commitment?: Commitment;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

// Both are optional booleans, but conflict - so cannot both be true
type SigVerifyAndReplaceRecentBlockhashConfig =
    | Readonly<{
          /** if `true` the transaction signatures will be verified (conflicts with `replaceRecentBlockhash`) */
          sigVerify: true;
          /** if `true` the transaction recent blockhash will be replaced with the most recent blockhash. (conflicts with `sigVerify`) */
          replaceRecentBlockhash?: false;
      }>
    | Readonly<{
          /** if `true` the transaction recent blockhash will be replaced with the most recent blockhash. (conflicts with `sigVerify`) */
          replaceRecentBlockhash: true;
          /** if `true` the transaction signatures will be verified (conflicts with `replaceRecentBlockhash`) */
          sigVerify?: false;
      }>
    | Readonly<{
          /** if `true` the transaction signatures will be verified (conflicts with `replaceRecentBlockhash`) */
          sigVerify?: false;
          /** if `true` the transaction recent blockhash will be replaced with the most recent blockhash. (conflicts with `sigVerify`) */
          replaceRecentBlockhash?: false;
      }>;

type AccountsConfigWithBase64EncodingZstdCompression = Readonly<{
    accounts: {
        /** An `array` of accounts to return */
        addresses: Base58EncodedAddress[];
        /** Encoding for returned Account data */
        encoding: 'base64+zstd';
    };
}>;

type AccountsConfigWithJsonParsedEncoding = Readonly<{
    accounts: {
        /** An `array` of accounts to return */
        addresses: Base58EncodedAddress[];
        /** Encoding for returned Account data */
        encoding: 'jsonParsed';
    };
}>;

type AccountsConfigWithBase64Encoding = Readonly<{
    accounts: {
        /** An `array` of accounts to return */
        addresses: Base58EncodedAddress[];
        // Optional because this is the default encoding
        /** Encoding for returned Account data */
        encoding?: 'base64';
    };
}>;

type SimulateTransactionApiResponseBase = RpcResponse<{
    /** Error if transaction failed, null if transaction succeeded. */
    err: TransactionError | null;
    /** Array of log messages the transaction instructions output during execution, null if simulation failed before the transaction was able to execute (for example due to an invalid blockhash or signature verification failure) */
    logs: string[] | null;
    /** The number of compute budget units consumed during the processing of this transaction */
    unitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
    /** The most-recent return data generated by an instruction in the transaction */
    returnData: Readonly<{
        /** The program that generated the return data */
        programId: Base58EncodedAddress;
        /** The return data itself, as base-64 encoded binary data */
        data: Base64EncodedDataResponse;
    }> | null;
}>;

type SimulateTransactionApiResponseWithAccounts<T extends AccountInfoBase> = RpcResponse<{
    /** Array of accounts with the same length as the `accounts.addresses` array in the request */
    accounts: (T | null)[];
}>;

export interface SimulateTransactionApi {
    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: SimulateTransactionConfigBase &
            SigVerifyAndReplaceRecentBlockhashConfig &
            AccountsConfigWithBase64Encoding
    ): SimulateTransactionApiResponseBase &
        SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedData>;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: SimulateTransactionConfigBase &
            SigVerifyAndReplaceRecentBlockhashConfig &
            AccountsConfigWithBase64EncodingZstdCompression
    ): SimulateTransactionApiResponseBase &
        SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: SimulateTransactionConfigBase &
            SigVerifyAndReplaceRecentBlockhashConfig &
            AccountsConfigWithJsonParsedEncoding
    ): SimulateTransactionApiResponseBase &
        SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithJsonData>;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config?: SimulateTransactionConfigBase & SigVerifyAndReplaceRecentBlockhashConfig
    ): SimulateTransactionApiResponseBase & { accounts: null };

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: SimulateTransactionConfigBase & { encoding: 'base64' } & SigVerifyAndReplaceRecentBlockhashConfig &
            AccountsConfigWithBase64Encoding
    ): SimulateTransactionApiResponseBase &
        SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedData>;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: SimulateTransactionConfigBase & { encoding: 'base64' } & SigVerifyAndReplaceRecentBlockhashConfig &
            AccountsConfigWithBase64EncodingZstdCompression
    ): SimulateTransactionApiResponseBase &
        SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: SimulateTransactionConfigBase & { encoding: 'base64' } & SigVerifyAndReplaceRecentBlockhashConfig &
            AccountsConfigWithJsonParsedEncoding
    ): SimulateTransactionApiResponseBase &
        SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithJsonData>;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: SimulateTransactionConfigBase & { encoding: 'base64' } & SigVerifyAndReplaceRecentBlockhashConfig
    ): SimulateTransactionApiResponseBase & { accounts: null };
}
