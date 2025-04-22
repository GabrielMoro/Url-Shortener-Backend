import 'dotenv/config';
import { DataSource } from 'typeorm';
import { seedUsers } from './user.seeder';
import { seedUrls } from './url.seeder';
import { User } from '@/core/user/entities/user.entity';
import { Url } from '@/core/url/entities/url.entity';

const userQty = Number(process.argv[2]) || 3;
const urlQty = Number(process.argv[3]) || 3;

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Url],
  synchronize: true,
  logging: false,
});

async function run() {
  await dataSource.initialize();

  await seedUsers(dataSource, userQty);
  await seedUrls(dataSource, urlQty);

  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Erro ao rodar os seeders:', err);
});
