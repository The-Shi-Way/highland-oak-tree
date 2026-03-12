import {
  Controller,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { DomainError } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';
import { DashboardService } from './dashboard.service';

function domainErrorMessage(error: DomainError): string {
  switch (error.kind) {
    case 'not_found':
      return `${error.entity} not found: ${error.id}`;
    case 'validation':
    case 'unauthorized':
    case 'conflict':
      return error.message;
    case 'external_service':
      return error.message;
  }
}

@Controller('dashboard')
@UseGuards(CognitoGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(): Promise<unknown> {
    const result = await this.dashboardService.getStats();
    if (!result.ok) {
      throw new HttpException(domainErrorMessage(result.error), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.value;
  }

  @Get('recent')
  async getRecent(): Promise<unknown> {
    const result = await this.dashboardService.getRecentItems();
    if (!result.ok) {
      throw new HttpException(domainErrorMessage(result.error), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.value;
  }
}
