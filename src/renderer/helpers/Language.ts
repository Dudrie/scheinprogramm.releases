import * as i18n from 'i18n';
import * as path from 'path';
import * as fs from 'fs';
import { AppState } from './StateService';

export default class Language {
    private static initialized: boolean = false;
    private static languagePath: string;

    /**
     * Initializes the language and loads all required strings for the DEFAULT locale ('de').
     */
    public static init() {
        this.languagePath = path.join(__dirname, '..', 'locales');

        i18n.configure({
            locales: ['de'],
            directory: this.languagePath,
            defaultLocale: 'de'
        });

        // FIXME: Für die Production entfernen (webpack?)
        this.sortLanguageFiles((_, err) => {
            if (err) {
                console.error(err.message);
            }
        });

        this.initialized = true;
    }

    /**
     * Gets the string with the given ID. If it contains any replacements they will be replaced with the provided replacements.
     * @param id ID of the string
     * @param replacements Replacements if any
     */
    public static getString(id: string, ...replacements: string[]): string {
        if (!this.initialized) {
            throw new Error('[ERROR] Language:getString - You have called this method before calling init(). You must call init() first to load the language.');
        }

        return i18n.__(id, ...replacements);
    }

    /**
     * Returns the title for the AppBar for the given AppState.
     * @param appState AppState to get title for
     * @param replacements Replacements done in the string
     */
    public static getAppBarTitle(appState: AppState, isAlternative: boolean, ...replacements: string[]): string {
        let key: string = 'APP_BAR_TITLE_' + AppState[appState] + (isAlternative ? '_ALT' : '');

        return this.getString(key, ...replacements);
    }

    /**
     * Sorts the language file of all available locales.
     * @param callback Callback called while sorting
     */
    public static sortLanguageFiles(callback: (locale: string, err: NodeJS.ErrnoException | undefined) => void) {
        i18n.getLocales().forEach((locale) => {
            let p = path.join(this.languagePath, locale + '.json');

            if (!fs.existsSync(p)) {
                callback(locale, {
                    name: 'ENOENT',
                    message: 'File was not found'
                });
                return;
            }

            let json = fs.readFileSync(p).toString();
            let langObj: any = JSON.parse(json);
            let exportObj: any = {};
            let keys: string[] = [];

            for (let prop in langObj) {
                keys.push(prop);
            }

            keys.sort((a, b) => a.localeCompare(b));
            keys.forEach((key) => {
                exportObj[key] = langObj[key];
            });

            let exportJson = JSON.stringify(exportObj, null, 2);

            try {
                fs.writeFileSync(
                    p,
                    exportJson,
                    { encoding: 'utf8' }
                );

                callback(locale, undefined);
            } catch (err) {
                callback(locale, err);
            }
        });
    }
}

Language.init();