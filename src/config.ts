import dotenv from 'dotenv';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const port = 7013;

export interface AuthSchedulerEnvConfig {
  clientSecret: string;
  clientId: string;
  tokenUrl: string;
}

const getAuthSchedulerEnvConfig = (): AuthSchedulerEnvConfig => {
  switch (mode) {
    case 'development': {
      const clientSecret = process.env.SYSTEM_INTERNAL_AUTH_CLIENT_SECRET_DEV || '';
      if (!clientSecret) throw new Error('auth client secret missing');

      const clientId = '3o029nji154v0bm109hkvkoi5h';
      const tokenUrl =
        'https://auth-cito-dev.auth.eu-central-1.amazoncognito.com/oauth2/token';
      return { clientSecret, clientId, tokenUrl };
    }
    case 'test': {
      const clientSecret =
        process.env.AUTH_SCHEDULER_CLIENT_SECRET_STAGING || '';
      if (!clientSecret) throw new Error('auth client secret missing');

      const clientId = '';
      const tokenUrl = '';
      return { clientSecret, clientId, tokenUrl };
    }
    case 'production': {
      const clientSecret = process.env.SYSTEM_INTERNAL_AUTH_CLIENT_SECRET_PROD || '';
      if (!clientSecret) throw new Error('auth client secret missing');

      const clientId = '54n1ig9sb07d4d9tiihdi0kifq';
      const tokenUrl = 'https://auth.citodata.com/oauth2/token';
      return { clientSecret, clientId, tokenUrl };
    }
    default:
      throw new Error('node env misconfiguration');
  }
};

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
    authSchedulerEnvConfig: getAuthSchedulerEnvConfig(),
  },
};
