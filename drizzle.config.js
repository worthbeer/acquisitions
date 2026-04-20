import 'dotenv/config';

const isLocal = process.env.NODE_ENV !== 'production';

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: !isLocal,
  },
};
