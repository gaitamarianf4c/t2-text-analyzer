const WORD_PATTERN = /\p{L}+/gu;

/**
 * Converts plain text into normalized word tokens.
 *
 * Responsibility:
 * - lowercases text
 * - normalizes Unicode characters
 * - extracts only letter-based words
 */
export class TextTokenizer {
    /**
     * Tokenizes a text into words.
     */
    tokenize(text: string): string[] {
        return text
            .toLocaleLowerCase('ro-RO')
            .normalize('NFC')
            .match(WORD_PATTERN) ?? [];
    }
}