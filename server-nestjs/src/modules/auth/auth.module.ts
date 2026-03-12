import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CognitoGuard } from './cognito.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CognitoGuard],
  exports: [AuthService, CognitoGuard],
})
export class AuthModule {}
