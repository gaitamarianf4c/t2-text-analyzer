import { ALL_LANGUAGES_VALUE } from '../config/analysisConfig.ts';
import type { DocumentLanguage, StopwordLanguageOption } from '../types/analysis.ts';
import { StopwordLanguageCatalog } from './stopwordLanguageCatalog.ts';

/**
 * Provides stopword filtering based on the selected document language.
 *
 * The comparison is diacritic-insensitive, so words like "și" can match
 * stopwords written as "si" in the external stopword list.
 */
export class StopwordProvider {
    private readonly languageOptions: readonly StopwordLanguageOption[];

    constructor(languageCatalog = new StopwordLanguageCatalog()) {
        this.languageOptions = languageCatalog.getLanguageOptions();
    }

    /**
     * Removes common linking words from a list of tokens.
     */
    removeStopwords(words: readonly string[], documentLanguage: DocumentLanguage): string[] {
        const stopwords = this.createStopwordSet(documentLanguage);

        return words.filter((word) => !stopwords.has(this.normalizeForComparison(word)));
    }

    /**
     * Creates a normalized stopword set for fast lookup.
     */
    private createStopwordSet(documentLanguage: DocumentLanguage): ReadonlySet<string> {
        return new Set(
            this.getStopwords(documentLanguage).map((word) => this.normalizeForComparison(word)),
        );
    }

    /**
     * Returns the stopword list for the selected document language.
     */
    private getStopwords(documentLanguage: DocumentLanguage): readonly string[] {
        const selectedLanguage = this.languageOptions.find(
            (option) => option.code === documentLanguage,
        );

        if (selectedLanguage) {
            return selectedLanguage.stopwords;
        }

        return this.getAllStopwords();
    }

    /**
     * Returns the combined stopword list.
     */
    private getAllStopwords(): readonly string[] {
        const allLanguages = this.languageOptions.find(
            (option) => option.code === ALL_LANGUAGES_VALUE,
        );

        return allLanguages?.stopwords ?? [];
    }

    /**
     * Normalizes words only for comparison.
     *
     * It removes diacritics and lowercases the word, but the original word
     * is still preserved in the final statistics.
     */
    private normalizeForComparison(word: string): string {
        return word
            .toLocaleLowerCase('ro-RO')
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '');
    }
}