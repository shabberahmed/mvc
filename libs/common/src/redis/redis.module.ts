import { Module } from '@nestjs/common';
import  Redis from 'ioredis';

@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                return new Redis({
                    host: 'redis-12876.c322.us-east-1-2.ec2.redns.redis-cloud.com',
                    port: 12876,
                    password: 'Lxz9zm1OD0UPb15fXmX8fzBMoXcEKVCm',
                });
            },
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
