import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { DB_OPTIONS, DBConfigType } from "./database.interface";

@Module({})
export class DatabaseModule {
  static register(config: DBConfigType) {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DB_OPTIONS,
          useValue: config,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
