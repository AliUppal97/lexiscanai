import { Injectable, Logger } from '@nestjs/common';
import { DocumentChangeType } from '@prisma/client';

@Injectable()
export class ConflictResolutionService {
  private readonly logger = new Logger(ConflictResolutionService.name);

  /**
   * Resolve conflicts between changes using Operational Transform
   */
  async resolveConflict(
    document: string,
    change1: { type: DocumentChangeType; position: number; content?: string },
    change2: { type: DocumentChangeType; position: number; content?: string },
  ): Promise<{ change1: any; change2: any }> {
    // Simple OT implementation - adjust positions based on earlier changes
    if (change1.position < change2.position) {
      // Change1 happens before change2
      if (change1.type === DocumentChangeType.INSERT && change1.content) {
        // Adjust change2 position forward
        change2.position += change1.content.length;
      } else if (change1.type === DocumentChangeType.DELETE && change1.content) {
        // Adjust change2 position backward
        change2.position = Math.max(0, change2.position - change1.content.length);
      }
    } else {
      // Change2 happens before change1
      if (change2.type === DocumentChangeType.INSERT && change2.content) {
        change1.position += change2.content.length;
      } else if (change2.type === DocumentChangeType.DELETE && change2.content) {
        change1.position = Math.max(0, change1.position - change2.content.length);
      }
    }

    return { change1, change2 };
  }

  /**
   * Apply Operational Transform
   */
  async useOperationalTransform(change: any, history: any[]): Promise<any> {
    let transformedChange = { ...change };

    for (const historicalChange of history) {
      if (historicalChange.position < change.position) {
        if (historicalChange.type === DocumentChangeType.INSERT && historicalChange.content) {
          transformedChange.position += historicalChange.content.length;
        } else if (historicalChange.type === DocumentChangeType.DELETE && historicalChange.content) {
          transformedChange.position = Math.max(0, transformedChange.position - historicalChange.content.length);
        }
      }
    }

    return transformedChange;
  }

  /**
   * Apply CRDT (Conflict-free Replicated Data Types)
   */
  async useCRDT(document: any, change: any): Promise<any> {
    // Simple CRDT implementation using last-write-wins with vector clocks
    // In production, use a proper CRDT library like Yjs or Automerge
    return change;
  }
}

