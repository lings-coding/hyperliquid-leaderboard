import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryBody } from './interface/leaderboard.interface';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
  getLeaderboard(
    @Body()
    body?: LeaderboardQueryBody,
  ) {
    return this.leaderboardService.getLeaderboard(body ?? {});
  }
}
