import Chart from 'chart.js/auto';
import type { Chart as ChartJs, ChartConfiguration } from 'chart.js';

import type { WordStat } from '../types/analysis.ts';

/**
 * Renders the top word statistics using Chart.js.
 *
 * This renderer owns the Chart.js instance lifecycle, so the page
 * controller does not need to know how charts are created or destroyed.
 */
export class ChartRenderer {
    private chartInstance: ChartJs<'bar', number[], string> | null = null;

    /**
     * Renders a horizontal bar chart.
     */
    render(canvas: HTMLCanvasElement, words: readonly WordStat[]): void {
        this.destroyCurrentChart();

        const config = this.createChartConfig(words);

        this.chartInstance = new Chart(canvas, config);
    }

    /**
     * Destroys the existing chart before creating a new one.
     */
    private destroyCurrentChart(): void {
        this.chartInstance?.destroy();
        this.chartInstance = null;
    }

    /**
     * Builds the Chart.js configuration object.
     */
    private createChartConfig(
        words: readonly WordStat[],
    ): ChartConfiguration<'bar', number[], string> {
        return {
            type: 'bar',
            data: {
                labels: words.map((item) => item.word),
                datasets: [
                    {
                        label: 'Word frequency percentage',
                        data: words.map((item) => Number(item.percentage.toFixed(2))),
                        backgroundColor: 'rgba(37, 99, 235, 0.78)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1,
                        borderRadius: 10,
                        maxBarThickness: 34,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.x}%`,
                        },
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value}%`,
                        },
                    },
                },
            },
        };
    }
}