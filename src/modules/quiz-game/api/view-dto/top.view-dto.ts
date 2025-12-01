import { PlayerViewDto } from './game.view-dto';

export class TopViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: PlayerViewDto;

  static mapToView(top: any) {
    return {
      sumScore: Number(top.sumScore),
      avgScores: parseFloat(top.avgScores),
      gamesCount: Number(top.gamesCount),
      winsCount: Number(top.winsCount),
      lossesCount: Number(top.lossesCount),
      drawsCount: Number(top.drawsCount),
      player: {
        id: top.userId,
        login: top.login,
      }
    };
  }
}

