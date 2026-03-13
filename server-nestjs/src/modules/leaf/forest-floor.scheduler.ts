import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LeafService } from './leaf.service';

/**
 * Daily scheduler that updates the isForestFloor flag on published Leaves.
 * Leaves older than 12 months get isForestFloor = true.
 * Requirements: 5.1, 5.2
 */
@Injectable()
export class ForestFloorScheduler {
  private readonly logger = new Logger(ForestFloorScheduler.name);

  constructor(private readonly leafService: LeafService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleForestFloorUpdate(): Promise<void> {
    try {
      this.logger.log('Running Forest Floor flag update...');
      await this.leafService.updateForestFloorFlags(new Date());
      this.logger.log('Forest Floor flag update complete.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Forest Floor update failed: ${message}`);
    }
  }
}
