import { Commitment } from '../commitment';
import { Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetEpochInfoApiResponse = Readonly<{
    /** the current slot */
    absoluteSlot: Slot;
    /** the current block height */
    blockHeight: U64UnsafeBeyond2Pow53Minus1;
    /** the current epoch */
    epoch: U64UnsafeBeyond2Pow53Minus1;
    /** the current slot relative to the start of the current epoch */
    slotIndex: U64UnsafeBeyond2Pow53Minus1;
    /** the number of slots in this epoch */
    slotsInEpoch: U64UnsafeBeyond2Pow53Minus1;
    /** total number of transactions processed without error since genesis */
    transactionCount: U64UnsafeBeyond2Pow53Minus1 | null;
}>;

export interface GetEpochInfoApi {
    /**
     * Returns the balance of the account of provided Pubkey
     */
    getEpochInfo(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): GetEpochInfoApiResponse;
}
