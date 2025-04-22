import 'dotenv/config';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '@/core/user/entities/user.entity';
import { Url } from '@/core/url/entities/url.entity';

export async function seedUsers(dataSource: DataSource, quantity: number = 3) {
  console.log('Populando tabela user');

  const userRepository = dataSource.getRepository(User);

  const users: Partial<User>[] = Array.from({ length: quantity }).map(() => ({
    email: faker.internet.email(),
    password: faker.internet.password(),
  }));

  await userRepository.save(users);

  console.log('Tabela User populada');
}

if (require.main === module) {
  const quantity = Number(process.argv[2]) || 3;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL não definida no .env');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Url],
    synchronize: true,
    logging: false,
  });

  dataSource
    .initialize()
    .then(() => seedUsers(dataSource, quantity))
    .catch((err) => console.error('Erro ao rodar seed de usuários:', err))
    .finally(() => void dataSource.destroy());
}
