export class MyStatisticViewDto {
  sumScore: number;
  avgScore: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(players: any): Promise<MyStatisticViewDto> {
    return {
      sumScore: Number(players.sumScore),
      avgScore: parseFloat(players.avgScore),
      gamesCount: Number(players.gamesCount),
      winsCount: Number(players.winsCount),
      lossesCount: Number(players.lossesCount),
      drawsCount: Number(players.drawsCount),
    };
  }
}
