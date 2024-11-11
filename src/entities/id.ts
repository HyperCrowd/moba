import { getSip } from '../utils/crypto'

const NODE_ID_MASK = 0x3FF; // 10 bits for nodeId
const SEQUENCE_MASK = 0xFFF; // 12 bits for sequence
const TIMESTAMP_SHIFT = 22; // 22 bits for timestamp
const HASH_KEY = 'secretKey';

export class SnowflakeIDGenerator {
  private nodeId: number;
  private sequence: number = 0;
  private lastTimestamp: number = -1;

  constructor(peerId: string) {
    // Assign a unique nodeId based on the peerId (e.g., player ID or hash of the player name)
    this.nodeId = parseInt(peerId.slice(-10), 16) & NODE_ID_MASK;
  }

  // SipHash-based fast hash function
  sipHash(value: string): number {
    const hash = getSip(HASH_KEY, value)

    // Return the first 4 bytes of the 64-bit result as a 32-bit integer
    return Buffer.from(hash).readUInt32LE(0)
  }

  // Generate a unique ID for an entity based on shared attributes (e.g., fireball)
  generateEntityId(entityType: string, entityAttributes: object): number {
    // Serialize entity type and attributes into a string
    const entityData = JSON.stringify({ entityType, ...entityAttributes });

    // Compute the SipHash for the entity attributes
    const entityHash = this.sipHash(entityData);

    // Get the current timestamp (millisecond precision)
    const timestamp = Date.now();

    // Handle sequence number and timestamp logic (same as before)
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & SEQUENCE_MASK; // Wrap sequence number if it exceeds 12 bits
      if (this.sequence === 0) {
        // Wait for next millisecond if sequence overflows
        while (Date.now() === timestamp) {}
      }
    } else {
      this.sequence = 0; // Reset sequence for new timestamp
    }

    this.lastTimestamp = timestamp;

    // Combine entity hash with timestamp, nodeId, and sequence number to form the final ID
    const entityId = (entityHash << TIMESTAMP_SHIFT) | (this.nodeId << 12) | this.sequence;
    return entityId;
  }
}
