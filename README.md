# Text Frequency Analyzer

A small web application built with **Vite**, **TypeScript** and **Chart.js** for analyzing word frequency in text documents.

The application allows users to upload a `.txt` file or paste text manually, removes common stop words, and displays the most frequent meaningful words using a chart and a statistics table.

## Features

- Upload `.txt` files
- Paste text manually
- Select document language from the available stopword lists
- Remove common linking words such as articles, prepositions and conjunctions
- Display total, analyzed, ignored and unique word counters
- Show top frequent words in a chart
- Show complete word statistics in a table

## Technologies

- Vite
- TypeScript
- Chart.js
- stopword

## Project Structure

```txt
src/
├─ features/
│  └─ word-analyzer/
│     ├─ config/
│     ├─ services/
│     ├─ types/
│     ├─ ui/
│     ├─ index.ts
│     └─ wordAnalyzerPage.ts
├─ shared/
├─ main.ts
└─ style.css