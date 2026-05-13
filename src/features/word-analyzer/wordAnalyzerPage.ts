import { Dom } from '../../shared/dom.ts';
import {
    DEFAULT_DOCUMENT_LANGUAGE,
    DEFAULT_TOP_LIMIT,
    MAX_TOP_LIMIT,
    MIN_TOP_LIMIT,
} from './config/analysisConfig.ts';
import { StopwordLanguageCatalog } from './services/stopwordLanguageCatalog.ts';
import { WordAnalyzerService } from './services/wordAnalyzerService.ts';
import type {
    AnalysisResult,
    DocumentLanguage,
    StopwordLanguageOption,
} from './types/analysis.ts';
import { ChartRenderer } from './ui/chartRenderer.ts';
import { SummaryRenderer } from './ui/summaryRenderer.ts';
import { TableRenderer } from './ui/tableRenderer.ts';

type WordAnalyzerPageElements = {
    readonly fileInput: HTMLInputElement;
    readonly textInput: HTMLTextAreaElement;
    readonly analyzeButton: HTMLButtonElement;
    readonly topLimitInput: HTMLInputElement;
    readonly documentLanguageSelect: HTMLSelectElement;
    readonly summaryContainer: HTMLElement;
    readonly chartCanvas: HTMLCanvasElement;
    readonly tableBody: HTMLTableSectionElement;
    readonly statusMessage: HTMLElement;
};

/**
 * Page controller for the Word Analyzer feature.
 *
 * Responsibility:
 * - reads UI state
 * - reacts to user events
 * - calls the analysis service
 * - delegates rendering to renderer classes
 */
class WordAnalyzerPage {
    private currentResult: AnalysisResult | null = null;

    private readonly languageOptions: readonly StopwordLanguageOption[];

    constructor(
        private readonly elements: WordAnalyzerPageElements,
        private readonly analyzerService: WordAnalyzerService,
        private readonly summaryRenderer: SummaryRenderer,
        private readonly tableRenderer: TableRenderer,
        private readonly chartRenderer: ChartRenderer,
        languageCatalog = new StopwordLanguageCatalog(),
    ) {
        this.languageOptions = languageCatalog.getLanguageOptions();
    }

    /**
     * Initializes the page event listeners and initial UI state.
     */
    init(): void {
        this.renderLanguageOptions();

        this.elements.fileInput.addEventListener('change', () => {
            void this.handleFileUpload();
        });

        this.elements.analyzeButton.addEventListener('click', () => {
            this.handleManualAnalyze();
        });

        this.elements.topLimitInput.addEventListener('input', () => {
            this.renderCurrentResult();
        });

        this.elements.documentLanguageSelect.addEventListener('change', () => {
            this.handleLanguageChange();
        });
    }

    /**
     * Reads the uploaded text file and starts the analysis.
     */
    private async handleFileUpload(): Promise<void> {
        const file = this.elements.fileInput.files?.[0];

        if (!file) {
            return;
        }

        if (!this.isTextFile(file)) {
            this.setStatus('Please upload a valid .txt file.');
            return;
        }

        const text = await file.text();
        this.elements.textInput.value = text;

        this.analyzeAndRender(text);
    }

    /**
     * Starts analysis using the manually pasted text.
     */
    private handleManualAnalyze(): void {
        this.analyzeAndRender(this.elements.textInput.value);
    }

    /**
     * Re-runs analysis when the selected document language changes.
     */
    private handleLanguageChange(): void {
        if (!this.elements.textInput.value.trim()) {
            return;
        }

        this.analyzeAndRender(this.elements.textInput.value);
    }

    /**
     * Runs the analyzer service and updates the UI.
     */
    private analyzeAndRender(text: string): void {
        if (!text.trim()) {
            this.setStatus('Add text or upload a .txt file first.');
            return;
        }

        this.currentResult = this.analyzerService.analyze(text, {
            documentLanguage: this.getDocumentLanguage(),
        });

        this.renderCurrentResult();

        if (this.currentResult.analyzedWords === 0) {
            this.setStatus('Analysis completed, but no meaningful words were found.');
            return;
        }

        this.setStatus('Analysis completed successfully.');
    }

    /**
     * Renders the existing analysis result using the current top limit.
     */
    private renderCurrentResult(): void {
        if (!this.currentResult) {
            return;
        }

        const topLimit = this.getTopLimit();
        const topWords = this.currentResult.words.slice(0, topLimit);

        this.summaryRenderer.render(this.elements.summaryContainer, this.currentResult);
        this.chartRenderer.render(this.elements.chartCanvas, topWords);
        this.tableRenderer.render(this.elements.tableBody, this.currentResult.words);
    }

    /**
     * Populates the language selector from the stopword library.
     */
    private renderLanguageOptions(): void {
        Dom.clear(this.elements.documentLanguageSelect);

        const fragment = document.createDocumentFragment();

        for (const language of this.languageOptions) {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = language.label;
            option.selected = language.code === DEFAULT_DOCUMENT_LANGUAGE;

            fragment.append(option);
        }

        this.elements.documentLanguageSelect.append(fragment);
    }

    /**
     * Reads and clamps the top limit input.
     */
    private getTopLimit(): number {
        const value = Number(this.elements.topLimitInput.value);

        if (Number.isNaN(value)) {
            return DEFAULT_TOP_LIMIT;
        }

        return Math.min(Math.max(value, MIN_TOP_LIMIT), MAX_TOP_LIMIT);
    }

    /**
     * Reads the selected document language safely.
     */
    private getDocumentLanguage(): DocumentLanguage {
        const selectedLanguage = this.elements.documentLanguageSelect.value;

        if (this.isSupportedDocumentLanguage(selectedLanguage)) {
            return selectedLanguage;
        }

        return DEFAULT_DOCUMENT_LANGUAGE;
    }

    /**
     * Checks whether a selected file is a text file.
     */
    private isTextFile(file: File): boolean {
        return file.type.includes('text') || file.name.toLocaleLowerCase().endsWith('.txt');
    }

    /**
     * Runtime guard for available language values.
     */
    private isSupportedDocumentLanguage(value: string): boolean {
        return this.languageOptions.some((language) => language.code === value);
    }

    /**
     * Updates the user-facing status message.
     */
    private setStatus(message: string): void {
        this.elements.statusMessage.textContent = message;
    }
}

/**
 * Feature entry point used by main.ts.
 */
export function initWordAnalyzerPage(): void {
    const page = new WordAnalyzerPage(
        {
            fileInput: Dom.getRequiredElement('#fileInput', HTMLInputElement),
            textInput: Dom.getRequiredElement('#textInput', HTMLTextAreaElement),
            analyzeButton: Dom.getRequiredElement('#analyzeButton', HTMLButtonElement),
            topLimitInput: Dom.getRequiredElement('#topLimit', HTMLInputElement),
            documentLanguageSelect: Dom.getRequiredElement('#documentLanguage', HTMLSelectElement),
            summaryContainer: Dom.getRequiredElement('#summary', HTMLElement),
            chartCanvas: Dom.getRequiredElement('#wordChart', HTMLCanvasElement),
            tableBody: Dom.getRequiredElement('#tableBody', HTMLTableSectionElement),
            statusMessage: Dom.getRequiredElement('#statusMessage', HTMLElement),
        },
        new WordAnalyzerService(),
        new SummaryRenderer(),
        new TableRenderer(),
        new ChartRenderer(),
    );

    page.init();
}