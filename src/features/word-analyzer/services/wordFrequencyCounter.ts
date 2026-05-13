import type { WordStat } from '../types/analysis.ts';

/**
 * Counts word occurrences and converts them to percentage statistics.
 *
 * Responsibility:
 * - count repeated words
 * - calculate percentage for each word
 * - sort results by relevance
 */
export class WordFrequencyCounter {
    /**
     * Builds sorted word statistics from a list of already-filtered words.
     */
    calculate(words: readonly string[]): WordStat[] {
        const wordCounts = this.countWords(words);

        return this.buildWordStats(wordCounts, words.length);
    }

    /**
     * Counts how many times each word appears.
     */
    private countWords(words: readonly string[]): Map<string, number> {
        const counts = new Map<string, number>();

        for (const word of words) {
            counts.set(word, (counts.get(word) ?? 0) + 1);
        }

        return counts;
    }

    /**
     * Converts raw counts into percentages and sorts them.
     */
    private buildWordStats(
        wordCounts: ReadonlyMap<string, number>,
        totalWords: number,
    ): WordStat[] {
        return [...wordCounts.entries()]
            .map(([word, count]) => ({
                word,
                count,
                percentage: totalWords === 0 ? 0 : (count / totalWords) * 100,
            }))
            .sort((left, right) => {
                const countDifference = right.count - left.count;

                if (countDifference !== 0) {
                    return countDifference;
                }

                return left.word.localeCompare(right.word, 'ro-RO');
            });
    }
}