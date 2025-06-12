import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeaderboardController } from './leaderboard/leaderboard.controller';
import { LeaderboardService } from './leaderboard/leaderboard.service';

@Module({
  imports: [],
  controllers: [AppController, LeaderboardController],
  providers: [AppService, LeaderboardService],
})
export class AppModule {}
