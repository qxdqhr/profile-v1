/**
 * 与 sa2kit createSa2kitAuth 等价，但使用 profile-v1 扩展的 authDrizzleSchema（含 account.issuer）。
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { bearer, emailOTP, phoneNumber } from 'better-auth/plugins';
import {
  consumePhoneSignupPassword,
  defaultPhoneValidator,
  defaultTempEmailFromPhone,
  type Sa2kitAuthConfig,
  type Sa2kitAuthInstance,
} from 'sa2kit/common/auth/server';
import { authDrizzleSchema } from '@profile/db/schema/auth';
import { db } from '@profile/db';
import { upsertCredentialPassword } from './credential-password';

type ProfileDatabase = typeof db;

/** 本地多端口子应用跨 origin 打主站 `/api/auth` 时需要 CORS */
const LOCAL_SIDECAR_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005',
] as const;

function mergeTrustedOrigins(configured: string[] | undefined): string[] {
  const extra = process.env.NODE_ENV === 'production' ? [] : [...LOCAL_SIDECAR_ORIGINS];
  return [...(configured ?? []), ...extra].filter(
    (origin, index, list) => list.indexOf(origin) === index,
  );
}

function createDevOtpLogger(enabled: boolean | undefined) {
  if (!enabled || process.env.NODE_ENV === 'production') {
    return undefined;
  }
  return (channel: string, target: string, code: string) => {
    console.info(`[sa2kit/auth][${channel}] ${target} => ${code}`);
  };
}

export function createProfileAuth(config: Sa2kitAuthConfig): Sa2kitAuthInstance {
  if (!config.secret || config.secret.length < 32) {
    throw new Error('createProfileAuth: secret 至少 32 字符');
  }

  const database = config.db as ProfileDatabase;
  const devLog = createDevOtpLogger(config.logOtpInDev ?? process.env.NODE_ENV !== 'production');
  const phoneValidator = config.phoneNumberValidator ?? defaultPhoneValidator;

  return betterAuth({
    appName: 'sa2kit',
    baseURL: config.baseURL,
    basePath: config.basePath ?? '/api/auth',
    secret: config.secret,
    trustedOrigins: mergeTrustedOrigins(config.trustedOrigins),
    database: drizzleAdapter(database as Parameters<typeof drizzleAdapter>[0], {
      provider: 'pg',
      schema: authDrizzleSchema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'USER',
          input: false,
        },
      },
    },
    plugins: [
      bearer(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          devLog?.('email', `${email} (${type})`, otp);
          if (config.email?.sendVerificationOTP) {
            await config.email.sendVerificationOTP(email, otp, type);
          }
        },
      }),
      phoneNumber({
        allowedAttempts: 5,
        phoneNumberValidator: phoneValidator,
        async sendOTP({ phoneNumber: phone, code }) {
          devLog?.('sms', phone, code);
          if (config.sms?.sendOTP) {
            await config.sms.sendOTP(phone, code);
          }
        },
        async callbackOnVerification({ phoneNumber: phone, user: verifiedUser }) {
          const pendingPassword = consumePhoneSignupPassword(phone);
          if (pendingPassword && verifiedUser?.id) {
            await upsertCredentialPassword(database, String(verifiedUser.id), pendingPassword);
          }
        },
        signUpOnVerification: {
          getTempEmail: defaultTempEmailFromPhone,
          getTempName: (phone) => phone,
        },
      }),
    ],
  }) as Sa2kitAuthInstance;
}
