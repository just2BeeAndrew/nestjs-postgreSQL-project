import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { envFilePaths } from './src/dynamic-config-module';
import { existsSync } from 'fs';
import { Blog } from './src/modules/bloggers-platform/domain/entities/blog.entity';
import { Comment } from './src/modules/bloggers-platform/domain/entities/comment.entity';
import { CommentStatus } from './src/modules/bloggers-platform/domain/entities/comment-status.entity';
import { ExtendedLikesInfo } from './src/modules/bloggers-platform/domain/entities/extended-likes-info.entity';
import { LikesInfo } from './src/modules/bloggers-platform/domain/entities/likes-info';
import { PostStatus } from './src/modules/bloggers-platform/domain/entities/post-status.entity';
import { Post } from './src/modules/bloggers-platform/domain/entities/post.entity';
import { Answer } from './src/modules/quiz-game/domain/entity/answer.entity';
import { Game } from './src/modules/quiz-game/domain/entity/game.entity';
import { GameQuestion } from './src/modules/quiz-game/domain/entity/game-question.entity';
import { Player } from './src/modules/quiz-game/domain/entity/player.entity';
import { Question } from './src/modules/quiz-game/domain/entity/question.entity';
import { AccountData } from './src/modules/user-accounts/domain/entities/account-data.entity';
import { EmailConfirmation } from './src/modules/user-accounts/domain/entities/email-confirmation.entity';
import { Session } from './src/modules/user-accounts/domain/entities/session.entity';
import { User } from './src/modules/user-accounts/domain/entities/user.entity';

for (const envPath of envFilePaths) {
  if (envPath && existsSync(envPath)) {
    config({ path: envPath });
  }
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Blog,
    Comment,
    CommentStatus,
    ExtendedLikesInfo,
    LikesInfo,
    PostStatus,
    Post,
    Answer,
    Game,
    GameQuestion,
    Player,
    Question,
    AccountData,
    EmailConfirmation,
    Session,
    User,
  ],
  migrations: [join(process.cwd(), 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
