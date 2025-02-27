import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../../commitment';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getTokenAccountsByOwner', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns RPC response with account info', async () => {
                expect.assertions(1);
                // Owner for fixtures/spl-token-token-account-owner.json
                const owner =
                    'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

                // token program for above token account
                const tokenProgram =
                    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                const accountInfosPromise = rpc
                    .getTokenAccountsByOwner(
                        owner,
                        { programId: tokenProgram },
                        {
                            commitment,
                            encoding: 'base64',
                        }
                    )
                    .send();

                await expect(accountInfosPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            account: {
                                data: [
                                    'Gm8Iy/4ID/afCSL46M6y025/coiwRHJeND8W2XNpBsTfvmMWzYiFjPs8cR2LldhcqyJmR9pfd8kyFD6O4A8OiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                    'base64',
                                ],
                                executable: false,
                                lamports: 2039280n,
                                owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                rentEpoch: 0n,
                                space: 165n,
                            },
                            pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                        },
                    ],
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws a slot not reached error', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // token program for above token account
            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByOwner(
                    owner,
                    { programId: tokenProgram },
                    {
                        minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    }
                )
                .send();
            await expect(accountInfoPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with an owner with no accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // randomly generated
            const owner =
                'GS2BpYHDF7p3NortvgvUFsFyqZGe7HjBPNkBiABccfN8' as Base58EncodedAddress<'GS2BpYHDF7p3NortvgvUFsFyqZGe7HjBPNkBiABccfN8'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc.getTokenAccountsByOwner(owner, { programId: tokenProgram }).send();
            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with a mint that does not exist', () => {
        it('throws an error for mint not existing', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // randomly generated
            const mint =
                'bYaTaiLtMmTfqZaVbo2rwQrdj1iA2DdjMrSACLCSZj4' as Base58EncodedAddress<'bYaTaiLtMmTfqZaVbo2rwQrdj1iA2DdjMrSACLCSZj4'>;

            const accountInfoPromise = rpc.getTokenAccountsByOwner(owner, { mint }).send();
            await expect(accountInfoPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a mint that has a token account', () => {
        it('returns RPC response with account info', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Mint at fixtures/spl-token-mint-account-with-owner.json (mint for above account)
            const mint =
                '2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf' as Base58EncodedAddress<'2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByOwner(
                    owner,
                    { mint },
                    {
                        encoding: 'base64',
                    }
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: [
                                'Gm8Iy/4ID/afCSL46M6y025/coiwRHJeND8W2XNpBsTfvmMWzYiFjPs8cR2LldhcqyJmR9pfd8kyFD6O4A8OiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                'base64',
                            ],
                            executable: false,
                            lamports: 2039280n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                    },
                ],
            });
        });
    });

    describe('when called with a mint that has no token accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Mint at fixtures/spl-token-mint-no-token-accounts.json (not the same mint as above account)
            const mint =
                'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj' as Base58EncodedAddress<'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj'>;

            const accountInfoPromise = rpc.getTokenAccountsByOwner(owner, { mint }).send();

            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with a program that is not a Token program', () => {
        it('throws an error for unrecognized program', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // randomly generated
            const programId =
                'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk' as Base58EncodedAddress<'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk'>;

            const accountInfoPromise = rpc.getTokenAccountsByOwner(owner, { programId }).send();
            await expect(accountInfoPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a program that has no token accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Token22 program (not the same as above account fixture)
            const programId =
                'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Base58EncodedAddress<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

            const accountInfoPromise = rpc.getTokenAccountsByOwner(owner, { programId }).send();

            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with base58 encoding', () => {
        // Currently we can't test this because every token account is >128 bytes
        // The solana source only allows base58 encoding up to 128 bytes: https://github.com/solana-labs/solana/blob/master/account-decoder/src/lib.rs#L37
        it.todo('returns RPC Response with account info with annotated base58 encoding');
    });

    describe('when called with base64 encoding', () => {
        it('returns RPC Response with account info with annotated base64 encoding', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByOwner(
                    owner,
                    { programId: tokenProgram },
                    {
                        encoding: 'base64',
                    }
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: [
                                'Gm8Iy/4ID/afCSL46M6y025/coiwRHJeND8W2XNpBsTfvmMWzYiFjPs8cR2LldhcqyJmR9pfd8kyFD6O4A8OiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                'base64',
                            ],
                            executable: false,
                            lamports: 2039280n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                    },
                ],
            });
        });
    });

    describe('when called with base64+zstd encoding', () => {
        it('returns RPC Response with account info with annotated base64+zstd encoding', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByOwner(
                    owner,
                    { programId: tokenProgram },
                    {
                        encoding: 'base64+zstd',
                    }
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: [
                                'KLUv/QBYbQIANAQabwjL/ggP9p8JIvjozrLTbn9yiLBEcl40PxbZc2kGxN++YxbNiIWM+zxxHYuV2FyrImZH2l93yTIUPo7gDw6JAAEAAgAEJwaY4Aw=',
                                'base64+zstd',
                            ],
                            executable: false,
                            lamports: 2039280n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                    },
                ],
            });
        });
    });

    describe('when called with jsonParsed encoding', () => {
        it('returns RPC response with parsed JSON data for SPL Token token account', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByOwner(
                    owner,
                    { programId: tokenProgram },
                    {
                        encoding: 'jsonParsed',
                    }
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: {
                                parsed: {
                                    info: {
                                        isNative: false,
                                        mint: '2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf',
                                        owner: 'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL',
                                        state: 'initialized',
                                        tokenAmount: {
                                            amount: '0',
                                            decimals: 9,
                                            uiAmount: 0,
                                            uiAmountString: '0',
                                        },
                                    },
                                    type: 'account',
                                },
                                program: 'spl-token',
                                space: 165n,
                            },
                            executable: false,
                            lamports: 2039280n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                    },
                ],
            });
        });
    });

    describe('when called with no encoding', () => {
        // Currently we can't test this because every token account is >128 bytes
        // The solana source only allows base58 encoding up to 128 bytes: https://github.com/solana-labs/solana/blob/master/account-decoder/src/lib.rs#L37
        it.todo('returns base58 data without an annotation');
    });

    describe('when called with a dataSlice', () => {
        it('returns the slice of the data', async () => {
            expect.assertions(1);
            // Owner for fixtures/spl-token-token-account-owner.json
            const owner =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfo = await rpc
                .getTokenAccountsByOwner(
                    owner,
                    { programId: tokenProgram },
                    {
                        dataSlice: { length: 10, offset: 0 },
                        encoding: 'base64',
                    }
                )
                .send();

            expect(accountInfo.value[0].account.data[0].length).toBeLessThan(20);
        });
    });
});
