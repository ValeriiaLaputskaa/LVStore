import { useEffect, useState } from "react";

const PRODUCT_SEARCH_TYPEWRITER_PHRASES = [
  "Пошук за назвою товару…",
  "Знайти за штрихкодом EAN-13…",
  "Фільтр за категорією…",
  "Наприклад: Молоко 2.5%…",
] as const;


export const PRODUCT_SEARCH_INPUT_PLACEHOLDER =
  "Пошук за назвою, штрихкодом або категорією…";

export function useProductSearchTypewriter(active: boolean): string {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }

    let cancelled = false;
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const phrases = PRODUCT_SEARCH_TYPEWRITER_PHRASES;

    const run = () => {
      if (cancelled) return;
      const phrase = phrases[phraseIdx % phrases.length];
      if (!deleting) {
        if (charIdx < phrase.length) {
          charIdx += 1;
          setText(phrase.slice(0, charIdx));
          timer = setTimeout(run, 72);
        } else {
          timer = setTimeout(() => {
            deleting = true;
            run();
          }, 1600);
        }
      } else if (charIdx > 0) {
        charIdx -= 1;
        setText(phrase.slice(0, charIdx));
        timer = setTimeout(run, 32);
      } else {
        deleting = false;
        phraseIdx += 1;
        timer = setTimeout(run, 450);
      }
    };

    timer = setTimeout(run, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);

  return text;
}
