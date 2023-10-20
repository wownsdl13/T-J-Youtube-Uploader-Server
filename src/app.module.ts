import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Process from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { UserModule } from './user/user.module';
import { UserTag } from './entities/user.tag';
import { JwtModule } from '@nestjs/jwt';
import { YoutubeModule } from './youtube/youtube.module';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: Process.env.DB_HOST,
      port: parseInt(Process.env.DB_PORT),
      username: Process.env.DB_USERNAME,
      password: Process.env.DB_PASSWORD,
      database: Process.env.DB_DATABASE,
      synchronize: true,
      autoLoadEntities: true,
      entities: [User, UserTag],
      charset: 'utf8mb4',
    }),
    UserModule,
    YoutubeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
