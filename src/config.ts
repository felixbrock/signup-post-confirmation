import dotenv from 'dotenv';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const port = 7013;

export interface AuthSchedulerEnvConfig {
  clientSecret: string;
  clientId: string;
  tokenUrl: string;
}

export const appConfig = {
  express: {
    port,
    mode,
  },
  cloud: {
    region: 'eu-central-1',
    ses: {
      bcc: ['felix@citodata.com', 'clemens@citodata.com'],
      source: 'felix@citodata.com'
    },
  },
};
