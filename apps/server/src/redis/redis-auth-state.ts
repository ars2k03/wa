import type { Redis } from 'ioredis';
import type { AuthenticationState, SignalDataSet, SignalDataTypeMap } from 'baileys';

export async function useRedisAuthState(
  redis: Redis,
  sessionKey: string = process.env.WHATSAPP_SESSION_NAME || 'whatsapp_gateway_session',
): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const { BufferJSON, initAuthCreds, proto } = await import('baileys');
  const credsField = 'creds';
  const storedCreds = await redis.hget(sessionKey, credsField);

  let creds: AuthenticationState['creds'];
  if (storedCreds) {
    try {
      creds = JSON.parse(
        storedCreds,
        BufferJSON.reviver,
      ) as AuthenticationState['creds'];
    } catch {
      creds = initAuthCreds();
    }
  } else {
    creds = initAuthCreds();
  }

  const keyField = (type: keyof SignalDataTypeMap, id: string) =>
    `keys:${type}:${encodeURIComponent(id)}`;

  const state: AuthenticationState = {
    creds,
    keys: {
      async get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]) {
        if (ids.length === 0) return {};

        const storedValues = await redis.hmget(
          sessionKey,
          ...ids.map((id) => keyField(type, id)),
        );
        const result: Partial<Record<string, SignalDataTypeMap[T]>> = {};

        storedValues.forEach((storedValue, index) => {
          if (!storedValue) return;

          try {
            let value = JSON.parse(
              storedValue,
              BufferJSON.reviver,
            ) as SignalDataTypeMap[T];
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(
                value as Parameters<
                  typeof proto.Message.AppStateSyncKeyData.fromObject
                >[0],
              ) as unknown as SignalDataTypeMap[T];
            }

            result[ids[index]] = value;
          } catch {
            /* ignore corrupted key entry */
          }
        });

        return result as Record<string, SignalDataTypeMap[T]>;
      },

      async set(data: SignalDataSet) {
        const transaction = redis.multi();
        let hasOps = false;

        for (const type of Object.keys(data) as Array<
          keyof SignalDataTypeMap
        >) {
          const entries = data[type];
          if (!entries) continue;

          for (const [id, value] of Object.entries(entries)) {
            const field = keyField(type, id);
            if (value === null || value === undefined) {
              transaction.hdel(sessionKey, field);
              hasOps = true;
            } else {
              transaction.hset(
                sessionKey,
                field,
                JSON.stringify(value, BufferJSON.replacer),
              );
              hasOps = true;
            }
          }
        }

        if (hasOps) {
          await transaction.exec();
        }
      },
    },
  };

  return {
    state,
    saveCreds: async () => {
      await redis.hset(
        sessionKey,
        credsField,
        JSON.stringify(state.creds, BufferJSON.replacer),
      );
    },
  };
}
