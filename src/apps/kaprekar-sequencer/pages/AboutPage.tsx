export function AboutPage() {
  return (
    <section className="about-panel">
      <p className="eyebrow">About</p>
      <h1>Kaprekar Composition Tool</h1>
      <p>
        This tool explores the Kaprekar routine in different bases, highlighting
        how the same pattern can surface in both decimal and duodecimal systems.
      </p>

      <div className="about-grid">
        <article>
          <h2>What is a Kaprekar routine?</h2>
          <p>
            A Kaprekar process rearranges the digits of a number, subtracts the
            smaller value from the larger one, and repeats the cycle until a
            constant emerges.
          </p>
          <a
            href="https://en.wikipedia.org/wiki/Kaprekar%27s_routine"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Kaprekar's routine
          </a>
        </article>

        <article>
          <h2>Why base matters</h2>
          <p>
            To reach the 'terminating' constant, called the Kaprekar constant, a
            specific number of digits is needed depending on the base.
          </p>
          <p>
            base 10 is the standard base (terminating with 4 digit numbers).
            However music uses base 12 (12 distinct notes in music).
          </p>
        </article>
      </div>

      <div className="about-callout">
        <h2>Use this app</h2>
        <p>
          Select a base, enter an initial sequence, and watch the calculation
          unfold step by step. The tool is designed as an interactive way to
          investigate how repeatable constants emerge across numeral systems.
        </p>
      </div>
    </section>
  );
}
