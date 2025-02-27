import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment } from '../commitment';
import { LamportsUnsafeBeyond2Pow53Minus1 } from '../lamports';
import { Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetInflationRewardApiResponse = Readonly<{
    // Reward amount in lamports
    amount: LamportsUnsafeBeyond2Pow53Minus1;
    // Vote account commission when the reward was credited
    commission: number;
    // The slot in which the rewards are effective
    effectiveSlot: Slot;
    // Epoch for which reward occured
    epoch: U64UnsafeBeyond2Pow53Minus1;
    // Post balance of the account in lamports
    postBalance: LamportsUnsafeBeyond2Pow53Minus1;
}>;

export interface GetInflationRewardApi {
    /**
     * Returns the current block height of the node
     */
    getInflationReward(
        addresses: Base58EncodedAddress[],
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
            // An epoch for which the reward occurs.
            // If omitted, the previous epoch will be used
            epoch?: U64UnsafeBeyond2Pow53Minus1;
            // The minimum slot that the request can be evaluated at
            minContextSlot?: Slot;
        }>
    ): Promise<readonly (GetInflationRewardApiResponse | null)[]>;
}
