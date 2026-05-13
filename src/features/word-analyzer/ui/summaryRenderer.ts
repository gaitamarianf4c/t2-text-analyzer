import { Dom } from '../../../shared/dom.ts';
import type { AnalysisResult } from '../types/analysis.ts';

type MetricCard = {
    readonly label: string;
    readonly value: number;
    readonly progress: number;
    readonly helper: string;
};

/**
 * Renders circular metric counters for an analysis result.
 */
export class SummaryRenderer {
    /**
     * Replaces the current summary content with updated metric cards.
     */
    render(container: HTMLElement, result: AnalysisResult): void {
        Dom.clear(container);

        const metrics = this.createMetrics(result);

        container.append(...metrics.map((metric) => this.createMetricCard(metric)));
    }

    /**
     * Creates the metric definitions displayed in the summary area.
     */
    private createMetrics(result: AnalysisResult): MetricCard[] {
        return [
            {
                label: 'Total words',
                value: result.totalWords,
                progress: 100,
                helper: 'Words detected in text',
            },
            {
                label: 'Analyzed words',
                value: result.analyzedWords,
                progress: this.calculatePercentage(result.analyzedWords, result.totalWords),
                helper: `${this.formatPercentage(result.analyzedWords, result.totalWords)} of total`,
            },
            {
                label: 'Ignored words',
                value: result.ignoredWords,
                progress: this.calculatePercentage(result.ignoredWords, result.totalWords),
                helper: `${this.formatPercentage(result.ignoredWords, result.totalWords)} filtered out`,
            },
            {
                label: 'Unique words',
                value: result.uniqueWords,
                progress: this.calculatePercentage(result.uniqueWords, result.analyzedWords),
                helper: `${this.formatPercentage(result.uniqueWords, result.analyzedWords)} of analyzed`,
            },
        ];
    }

    /**
     * Creates one circular counter card.
     */
    private createMetricCard(metric: MetricCard): HTMLElement {
        const card = document.createElement('article');
        card.className = 'metric-card';

        const ring = document.createElement('div');
        ring.className = 'metric-card-ring';
        ring.style.setProperty('--metric-progress', metric.progress.toString());

        ring.append(Dom.createTextElement('strong', metric.value.toString(), 'metric-card-value'));

        const content = document.createElement('div');
        content.className = 'metric-card-content';

        content.append(
            Dom.createTextElement('span', metric.label, 'metric-card-label'),
            Dom.createTextElement('span', metric.helper, 'metric-card-helper'),
        );

        card.append(ring, content);

        return card;
    }

    /**
     * Calculates a safe percentage value between 0 and 100.
     */
    private calculatePercentage(value: number, total: number): number {
        if (total <= 0) {
            return 0;
        }

        return Math.min((value / total) * 100, 100);
    }

    /**
     * Formats a percentage for display.
     */
    private formatPercentage(value: number, total: number): string {
        return `${this.calculatePercentage(value, total).toFixed(1)}%`;
    }
}