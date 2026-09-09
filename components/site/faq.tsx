import type { FaqItem } from "@/config/types";
import Link from "next/link";
import { routePath } from "@/lib/urls";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="scroll-mt-24">
      <p className="eyebrow">Common questions</p>
      <h2>Frequently Asked Questions</h2>
      <div className="mt-7 divide-y divide-border overflow-hidden rounded-theme border border-border bg-card/60 shadow-theme">
        {items.map((item) => (
          <article key={item.question} className="p-6 sm:p-7">
            <h3>{item.question}</h3>
            <p>
              {item.answer}
              {item.answerLink ? (
                <> <Link className="font-bold text-primary hover:underline" href={routePath(item.answerLink.slug)}>{item.answerLink.label}</Link></>
              ) : null}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
