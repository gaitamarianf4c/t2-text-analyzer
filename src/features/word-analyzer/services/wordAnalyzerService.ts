import { MIN_WORD_LENGTH } from '../config/analysisConfig.ts';
import type { AnalysisOptions, AnalysisResult } from '../types/analysis.ts';
import { StopwordProvider } from './stopwordProvider.ts';
import { TextTokenizer } from './textTokenizer.ts';
import { WordFrequencyCounter } from './wordFrequencyCounter.ts';

/**
 * Application service responsible for complete text analysis.
 *
 * It coordinates:
 * - tokenization
 * - minimum word length filtering
 * - stopword removal
 * - frequency calculation
 *
 * The class follows SRP by delegating each specialized operation to
 * dedicated collaborators.
 */
export class WordAnalyzerService {
    private readonly tokenizer: TextTokenizer;

    private readonly stopwordProvider: StopwordProvider;

    private readonly frequencyCounter: WordFrequencyCounter;

    constructor(
        tokenizer = new TextTokenizer(),
        stopwordProvider = new StopwordProvider(),
        frequencyCounter = new WordFrequencyCounter(),
    ) {
        this.tokenizer = tokenizer;
        this.stopwordProvider = stopwordProvider;
        this.frequencyCounter = frequencyCounter;
    }

    /**
     * Analyzes text and returns word frequency statistics.
     */
    analyze(text: string, options: AnalysisOptions): AnalysisResult {
        const rawWords = this.tokenizer.tokenize(text);
        const validLengthWords = rawWords.filter((word) => word.length >= MIN_WORD_LENGTH);
        const analyzedWords = this.stopwordProvider.removeStopwords(
            validLengthWords,
            options.documentLanguage,
        );
        const wordStats = this.frequencyCounter.calculate(analyzedWords);

        return {
            totalWords: rawWords.length,
            analyzedWords: analyzedWords.length,
            ignoredWords: rawWords.length - analyzedWords.length,
            uniqueWords: wordStats.length,
            words: wordStats,
        };
    }
}