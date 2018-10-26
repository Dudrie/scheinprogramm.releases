import Store from 'electron-store';
import * as path from 'path';
import { isDevelopment } from './IsDevelopment';

export interface StoreType {
    recentFile: string | undefined;
}

export abstract class ConfigStoreService {
    private static store: Store;

    public static init() {
        let devPath: string | undefined;
        let encryptionKey: string = 'sup3rS3cr3!EncryptionKey';

        if (isDevelopment) {
            // Make sure that the data is not 'encrypted' (technically it's more 'uglifying' than encrypting) and that the data does NOT override any changes made to the users data.
            encryptionKey = '';
            devPath = path.resolve(path.join(__dirname, '..', '..', 'devStore'));
        }

        ConfigStoreService.store = new Store({
            defaults: {
                recentFile: undefined
            },
            cwd: devPath,
            encryptionKey
        });
    }

    public static set(key: keyof StoreType, value: StoreType[keyof StoreType]) {
        ConfigStoreService.store.set(key, value);
    }

    public static get(key: keyof StoreType, defaultValue: StoreType[keyof StoreType]): StoreType[keyof StoreType] {
        return ConfigStoreService.store.get(key, defaultValue);
    }

    public static has(key: keyof StoreType): boolean {
        return ConfigStoreService.store.has(key);
    }

    public static delete(key: keyof StoreType) {
        ConfigStoreService.store.delete(key);
    }
}

ConfigStoreService.init();