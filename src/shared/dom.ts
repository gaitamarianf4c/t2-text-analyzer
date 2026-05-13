type ElementConstructor<T extends Element> = {
    new (): T;
};

/**
 * Small DOM utility class used to keep DOM access safe and reusable.
 *
 * This avoids repeated nullable checks in feature/page code and keeps
 * element lookup errors explicit.
 */
export class Dom {
    /**
     * Finds an element and validates its runtime type.
     *
     * @throws Error when the element is missing or has another type.
     */
    static getRequiredElement<T extends Element>(
        selector: string,
        constructor: ElementConstructor<T>,
    ): T {
        const element = document.querySelector(selector);

        if (!(element instanceof constructor)) {
            throw new Error(`Required element not found or invalid type: ${selector}`);
        }

        return element;
    }

    /**
     * Clears all children from the given element.
     */
    static clear(element: Element): void {
        element.replaceChildren();
    }

    /**
     * Creates a text-only HTML element.
     *
     * Using textContent prevents accidental HTML injection.
     */
    static createTextElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        text: string,
        className?: string,
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName);
        element.textContent = text;

        if (className) {
            element.className = className;
        }

        return element;
    }
}