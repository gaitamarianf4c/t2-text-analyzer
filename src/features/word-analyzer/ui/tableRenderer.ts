import { Dom } from '../../../shared/dom.ts';
import type { WordStat } from '../types/analysis.ts';

/**
 * Renders the full word statistics table.
 */
export class TableRenderer {
    /**
     * Replaces the table body with the provided word statistics.
     */
    render(tableBody: HTMLTableSectionElement, words: readonly WordStat[]): void {
        Dom.clear(tableBody);

        const fragment = document.createDocumentFragment();

        for (const word of words) {
            fragment.append(this.createRow(word));
        }

        tableBody.append(fragment);
    }

    /**
     * Creates a table row for a single word statistic.
     */
    private createRow(word: WordStat): HTMLTableRowElement {
        const row = document.createElement('tr');

        row.append(
            this.createCell(word.word),
            this.createCell(word.count.toString()),
            this.createCell(`${word.percentage.toFixed(2)}%`),
        );

        return row;
    }

    /**
     * Creates a text-only table cell.
     */
    private createCell(text: string): HTMLTableCellElement {
        const cell = document.createElement('td');
        cell.append(Dom.createTextElement('span', text));

        return cell;
    }
}