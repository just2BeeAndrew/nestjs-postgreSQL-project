export class MyStatisticViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(players: any): MyStatisticViewDto {
    return {
      sumScore: Number(players.sumScore),
      avgScores: parseFloat(players.avgScores),
      gamesCount: Number(players.gamesCount),
      winsCount: Number(players.winsCount),
      lossesCount: Number(players.lossesCount),
      drawsCount: Number(players.drawsCount),
    };
  }
}
