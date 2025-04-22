import 'dotenv/config';
import { Url } from '@/core/url/entities/url.entity';
import { User } from '@/core/user/entities/user.entity';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

export async function seedUrls(dataSource: DataSource, quantity: number = 3) {
  console.log('Populando tabela url');

  const urlRepository = dataSource.getRepository(Url);
  const userRepository = dataSource.getRepository(User);

  const users = await userRepository.find();

  const urls: Partial<Url>[] = Array.from({ length: quantity }).map(() => {
    const maybeUser = users.length > 0 ? faker.helpers.arrayElement(users) : null;

    return {
      shortCode: faker.string.alphanumeric(6),
      targetUrl: faker.internet.url(),
      clicks: faker.number.int({ max: 10000 }),
      user: maybeUser ?? undefined,
    };
  });

  await urlRepository.save(urls);

  console.log('Tabela url populada');
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
    .then(() => seedUrls(dataSource, quantity))
    .catch((err) => console.error('Erro ao rodar seed de urls:', err))
    .finally(() => void dataSource.destroy());
}
