import { Fragment } from 'react';
import { useAppStore } from '../state/useAppStore';
import type { GuideSection } from '../types';
import './GuideHub.css';

function GuideHub() {
  const chapters = useAppStore(state => state.guideChapters);
  const resources = useAppStore(state => state.guideResources);

  return (
    <div className="guide-hub">
      <header className="guide-hub__hero">
        <span className="guide-hub__eyebrow">Car Audio &amp; AV Bible</span>
        <h2>Field Guide for Builders, Tuners, and Installers</h2>
        <p>
          Explore condensed lessons from the Car Audio &amp; AV Bible. Each chapter highlights what to know, what to do next,
          and where to dive deeper before you turn a wrench.
        </p>
      </header>

      <div className="guide-hub__layout">
        <nav className="guide-hub__toc" aria-label="Guide navigation">
          <h3>Chapters</h3>
          <ul>
            {chapters.map(chapter => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`}>{chapter.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="guide-hub__content">
          {chapters.map((chapter) => (
            <section key={chapter.id} id={chapter.id} className="guide-chapter">
              <h3>{chapter.title}</h3>
              <p className="guide-chapter__summary">{chapter.summary}</p>
              <div className="guide-chapter__sections">
                {chapter.sections.map(section => (
                  <GuideSectionCard key={section.id} section={section} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <footer className="guide-hub__resources">
        <h3>Additional Resources</h3>
        <div className="guide-resources">
          {resources.map(resource => (
            <a key={resource.id} className="guide-resource" href={resource.href} target={resource.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              <strong>{resource.title}</strong>
              <p>{resource.description}</p>
              <span className="guide-resource__cta">Open</span>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function GuideSectionCard({ section }: { section: GuideSection }) {
  return (
    <article className="guide-section" id={section.id}>
      <header className="guide-section__header">
        <h4>{section.title}</h4>
        <p>{section.focus}</p>
      </header>
      <div className="guide-section__grid">
        <div>
          <h5>Key Takeaways</h5>
          <ul>
            {section.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Action Checklist</h5>
          <ul>
            {section.actionSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="guide-section__references">
        {section.references.map((reference, index) => (
          <Fragment key={index}>
            <span>{reference}</span>
            {index < section.references.length - 1 && <span aria-hidden="true">·</span>}
          </Fragment>
        ))}
      </div>
    </article>
  );
}

export default GuideHub;
