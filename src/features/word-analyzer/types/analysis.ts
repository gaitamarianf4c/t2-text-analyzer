export type DocumentLanguage = string;

export type StopwordLanguageOption = {
    readonly code: string;
    readonly label: string;
    readonly stopwords: readonly string[];
};

export type AnalysisOptions = {
    readonly documentLanguage: DocumentLanguage;
};

export type WordStat = {
    readonly word: string;
    readonly count: number;
    readonly percentage: number;
};

export type AnalysisResult = {
    readonly totalWords: number;
    readonly analyzedWords: number;
    readonly ignoredWords: number;
    readonly uniqueWords: number;
    readonly words: readonly WordStat[];
};