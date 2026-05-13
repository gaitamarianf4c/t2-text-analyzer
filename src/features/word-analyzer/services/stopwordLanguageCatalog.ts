import * as stopword from 'stopword';

import { ALL_LANGUAGES_VALUE } from '../config/analysisConfig.ts';
import type { StopwordLanguageOption } from '../types/analysis.ts';

const LANGUAGE_LABEL_OVERRIDES: Readonly<Record<string, string>> = {
    eng: 'English',
    ron: 'Romanian',
};

const IGNORED_EXPORT_NAMES = new Set(['default', 'removeStopwords']);

/**
 * Builds the list of available stopword languages from the installed
 * stopword package exports.
 *
 * This keeps the UI in sync with the library instead of maintaining
 * a hardcoded language list in the application.
 */
export class StopwordLanguageCatalog {
    private readonly moduleExports: Record<string, unknown>;

    constructor(moduleExports: Record<string, unknown> = stopword as unknown as Record<string, unknown>) {
        this.moduleExports = moduleExports;
    }

    /**
     * Returns the special "all languages" option plus every language list
     * exported by the stopword package.
     */
    getLanguageOptions(): StopwordLanguageOption[] {
        const languageOptions = this.getAvailableLanguageOptions();

        return [
            {
                code: ALL_LANGUAGES_VALUE,
                label: 'All available languages',
                stopwords: this.mergeStopwords(languageOptions),
            },
            ...languageOptions,
        ];
    }

    /**
     * Finds all stopword arrays exported by the library.
     */
    private getAvailableLanguageOptions(): StopwordLanguageOption[] {
        const languageOptions: StopwordLanguageOption[] = [];

        for (const [exportName, value] of Object.entries(this.moduleExports)) {
            if (!this.isLanguageExport(exportName, value)) {
                continue;
            }

            languageOptions.push({
                code: exportName,
                label: this.createLanguageLabel(exportName),
                stopwords: value,
            });
        }

        return languageOptions.sort((left, right) => left.label.localeCompare(right.label));
    }

    /**
     * Checks whether an export looks like a language stopword list.
     */
    private isLanguageExport(exportName: string, value: unknown): value is readonly string[] {
        return (
            !IGNORED_EXPORT_NAMES.has(exportName) &&
            Array.isArray(value) &&
            value.every((item) => typeof item === 'string')
        );
    }

    /**
     * Creates a readable label for a language code.
     */
    private createLanguageLabel(code: string): string {
        const override = LANGUAGE_LABEL_OVERRIDES[code];

        if (override) {
            return `${override} (${code})`;
        }

        const displayName = this.getDisplayName(code);

        if (!displayName) {
            return code;
        }

        return `${displayName} (${code})`;
    }

    /**
     * Tries to convert a language code to a browser-readable language name.
     */
    private getDisplayName(code: string): string | null {
        try {
            const displayNames = new Intl.DisplayNames(['en'], {
                type: 'language',
            });

            return displayNames.of(code) ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Combines all language stopwords into one unique list.
     */
    private mergeStopwords(languageOptions: readonly StopwordLanguageOption[]): string[] {
        return [...new Set(languageOptions.flatMap((option) => option.stopwords))];
    }
}