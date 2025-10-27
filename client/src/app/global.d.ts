declare module '*.css';

declare module 'latex.js' {
  export interface HtmlGeneratorOptions {
    hyphenate?: boolean;
    documentClass?: string;
    styles?: string[];
    languagePatterns?: any;
    precision?: number;
  }

  export class HtmlGenerator {
    constructor(options?: HtmlGeneratorOptions);
    htmlDocument(baseURL?: string): string;
    domFragment(): DocumentFragment;
    reset(): void;
  }

  export function parse(
    input: string,
    options?: { generator: HtmlGenerator }
  ): {
    htmlDocument(): string;
    domFragment(): DocumentFragment;
  };

  export class SyntaxError extends Error {
    constructor(message: string);
    static buildMessage(message: string): string;
  }
}