import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@task-mgmt/database';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.register({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: (() => {
        if (process.env.DB_SSL === 'true') {
          const sslConfig: any = {
            rejectUnauthorized:
              process.env.DB_SSL_INSECURE === 'true' ? false : true,
          };

          if (process.env.DB_SSL_CA) {
            sslConfig.ca = process.env.DB_SSL_CA;
          }

          return sslConfig;
        }
        return false;
      })(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
