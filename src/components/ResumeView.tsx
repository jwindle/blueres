import type { ResumeData, Work, Education, Volunteer, Award, Certificate, Publication, Skill, Language, Interest, Reference, Project } from '@/lib/types';
import { MediaCarousel } from '@/components/MediaCarousel';

interface Props {
  resume: ResumeData;
  handle: string;
  rkey: string;
  isOwner?: boolean;
  didHandles?: Map<string, string>;
}

export function ResumeView({ resume, handle, rkey, isOwner = false, didHandles = new Map() }: Props) {
  const { basics } = resume;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-3xl px-6 py-12 print:py-0">

        {/* Header */}
        {basics && (
          <header className="mb-10 border-b border-line pb-8">
            <div className="flex items-start gap-6">
              {basics.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={basics.image} alt={basics.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <h1 className="text-3xl font-bold">{basics.name ?? handle}</h1>
                  <div className="flex items-center gap-3">
                    {isOwner && (
                      <a href={`/edit/${rkey}`} className="text-xs text-fg-muted hover:text-blue-600 px-2 py-0.5 rounded border border-line">Edit</a>
                    )}
                    <a href={`/json/${handle}/${rkey}`} className="text-xs text-fg-muted hover:text-blue-600" title="Export JSON Resume">JSON</a>
                  </div>
                </div>
                {basics.label && <p className="mt-1 text-lg text-fg-soft">{basics.label}</p>}
                {basics.summary && <p className="mt-3 text-fg-soft leading-relaxed">{basics.summary}</p>}

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
                  {basics.location && (
                    <span>{[basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).join(', ')}</span>
                  )}
                  {basics.email && <a href={`mailto:${basics.email}`} className="hover:text-blue-600">{basics.email}</a>}
                  {basics.phone && <span>{basics.phone}</span>}
                  {basics.url && (
                    <a href={basics.url} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                      ({displayUrl(basics.url)})
                    </a>
                  )}
                </div>

                {basics.profiles && basics.profiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {basics.profiles.map((p, i) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {p.network}{p.username ? ` / ${p.username}` : ''}
                      </a>
                    ))}
                  </div>
                )}
                <MediaCarousel items={basics.media ?? []} />
              </div>
            </div>
          </header>
        )}

        {/* Work */}
        {!!resume.work?.length && (
          <Section title="Work Experience">
            {resume.work.map((w, i) => <WorkEntry key={i} w={w} didHandles={didHandles} />)}
          </Section>
        )}

        {/* Education */}
        {!!resume.education?.length && (
          <Section title="Education">
            {resume.education.map((e, i) => <EducationEntry key={i} e={e} didHandles={didHandles} />)}
          </Section>
        )}

        {/* Skills */}
        {!!resume.skills?.length && (
          <Section title="Skills">
            <div className="space-y-2">
              {resume.skills.map((s, i) => <SkillEntry key={i} s={s} />)}
            </div>
          </Section>
        )}

        {/* Projects */}
        {!!resume.projects?.length && (
          <Section title="Projects">
            {resume.projects.map((p, i) => <ProjectEntry key={i} p={p} didHandles={didHandles} />)}
          </Section>
        )}

        {/* Volunteer */}
        {!!resume.volunteer?.length && (
          <Section title="Volunteer">
            {resume.volunteer.map((v, i) => <VolunteerEntry key={i} v={v} didHandles={didHandles} />)}
          </Section>
        )}

        {/* Awards */}
        {!!resume.awards?.length && (
          <Section title="Awards">
            {resume.awards.map((a, i) => <AwardEntry key={i} a={a} />)}
          </Section>
        )}

        {/* Certificates */}
        {!!resume.certificates?.length && (
          <Section title="Certificates">
            {resume.certificates.map((c, i) => <CertificateEntry key={i} c={c} />)}
          </Section>
        )}

        {/* Publications */}
        {!!resume.publications?.length && (
          <Section title="Publications">
            {resume.publications.map((p, i) => <PublicationEntry key={i} p={p} didHandles={didHandles} />)}
          </Section>
        )}

        {/* Languages */}
        {!!resume.languages?.length && (
          <Section title="Languages">
            <div className="flex flex-wrap gap-4">
              {resume.languages.map((l, i) => <LanguageEntry key={i} l={l} />)}
            </div>
          </Section>
        )}

        {/* Interests */}
        {!!resume.interests?.length && (
          <Section title="Interests">
            <div className="flex flex-wrap gap-4">
              {resume.interests.map((item, i) => <InterestEntry key={i} item={item} />)}
            </div>
          </Section>
        )}

        {/* References */}
        {!!resume.references?.length && (
          <Section title="References">
            {resume.references.map((r, i) => <ReferenceEntry key={i} r={r} didHandles={didHandles} />)}
          </Section>
        )}

        <footer className="mt-12 border-t border-line pt-4 text-xs text-fg-muted flex justify-between">
          <span>@{handle} on Bluesky</span>
          <span>Powered by BlueRes / AT Protocol</span>
        </footer>
      </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold uppercase tracking-widest text-fg-muted text-sm border-b border-line pb-1">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

// ─── Entry components ────────────────────────────────────────────────────────

type DH = Map<string, string>;

function BlueskyLink({ did, didHandles }: { did?: string; didHandles: DH }) {
  if (!did) return null;
  const handle = didHandles.get(did);
  if (!handle) return null;
  return (
    <a
      href={`https://bsky.app/profile/${did}`}
      target="_blank"
      rel="noreferrer"
      className="text-sky-500 hover:underline text-sm"
    >
      @{handle}
    </a>
  );
}

function WorkEntry({ w, didHandles }: { w: Work; didHandles: DH }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="font-semibold">{w.position}</span>
          {w.name && (
            <>
              {' · '}
              {w.url ? (
                <a href={w.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{w.name}</a>
              ) : (
                <span>{w.name}</span>
              )}
            </>
          )}
          {w.location && <span className="text-fg-muted text-sm"> — {w.location}</span>}
        </div>
        <DateRange start={w.startDate} end={w.endDate} />
      </div>
      {w.description && <p className="text-sm text-fg-muted mt-0.5">{w.description}</p>}
      <BlueskyLink did={w.did} didHandles={didHandles} />
      {w.summary && <p className="mt-1 text-fg-soft text-sm">{w.summary}</p>}
      {w.highlights && w.highlights.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-0.5 text-sm text-fg-soft">
          {w.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      <MediaCarousel items={w.media ?? []} />
    </div>
  );
}

function EducationEntry({ e, didHandles }: { e: Education; didHandles: DH }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          {e.url ? (
            <a href={e.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{e.institution}</a>
          ) : (
            <span className="font-semibold">{e.institution}</span>
          )}
          {e.studyType && e.area && <span className="text-fg-soft"> — {e.studyType}, {e.area}</span>}
          {e.score && <span className="text-fg-muted text-sm"> · {e.score}</span>}
        </div>
        <DateRange start={e.startDate} end={e.endDate} />
      </div>
      <BlueskyLink did={e.did} didHandles={didHandles} />
      {e.courses && e.courses.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-0.5 text-sm text-fg-muted">
          {e.courses.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      )}
      <MediaCarousel items={e.media ?? []} />
    </div>
  );
}

function VolunteerEntry({ v, didHandles }: { v: Volunteer; didHandles: DH }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="font-semibold">{v.position}</span>
          {v.organization && (
            <>
              {' · '}
              {v.url ? (
                <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{v.organization}</a>
              ) : (
                <span>{v.organization}</span>
              )}
            </>
          )}
        </div>
        <DateRange start={v.startDate} end={v.endDate} />
      </div>
      <BlueskyLink did={v.did} didHandles={didHandles} />
      {v.summary && <p className="mt-1 text-sm text-fg-soft">{v.summary}</p>}
      {v.highlights && v.highlights.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-0.5 text-sm text-fg-soft">
          {v.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      <MediaCarousel items={v.media ?? []} />
    </div>
  );
}

function AwardEntry({ a }: { a: Award }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-semibold">{a.title}</span>
        {a.date && <span className="text-sm text-fg-muted shrink-0">{a.date}</span>}
      </div>
      {a.awarder && <p className="text-sm text-fg-muted">{a.awarder}</p>}
      {a.summary && <p className="mt-1 text-sm text-fg-soft">{a.summary}</p>}
    </div>
  );
}

function CertificateEntry({ c }: { c: Certificate }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          {c.url ? (
            <a href={c.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{c.name}</a>
          ) : (
            <span className="font-semibold">{c.name}</span>
          )}
          {c.issuer && <span className="text-fg-muted text-sm"> · {c.issuer}</span>}
        </div>
        {c.date && <span className="text-sm text-fg-muted shrink-0">{c.date}</span>}
      </div>
    </div>
  );
}

function PublicationEntry({ p, didHandles }: { p: Publication; didHandles: DH }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{p.name}</a>
          ) : (
            <span className="font-semibold">{p.name}</span>
          )}
          {p.publisher && <span className="text-fg-muted text-sm"> · {p.publisher}</span>}
        </div>
        {p.releaseDate && <span className="text-sm text-fg-muted shrink-0">{p.releaseDate}</span>}
      </div>
      <BlueskyLink did={p.did} didHandles={didHandles} />
      {p.summary && <p className="mt-1 text-sm text-fg-soft">{p.summary}</p>}
      <MediaCarousel items={p.media ?? []} />
    </div>
  );
}

function SkillEntry({ s }: { s: Skill }) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-[8rem]">
        <span className="font-medium">{s.name}</span>
        {s.level && <span className="text-sm text-fg-muted"> · {s.level}</span>}
      </div>
      {s.keywords && s.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {s.keywords.map((k, i) => (
            <span key={i} className="rounded-full bg-raised px-2.5 py-0.5 text-xs text-fg-soft">{k}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageEntry({ l }: { l: Language }) {
  return (
    <div className="text-sm">
      <span className="font-medium">{l.language}</span>
      {l.fluency && <span className="text-fg-muted"> — {l.fluency}</span>}
    </div>
  );
}

function InterestEntry({ item }: { item: Interest }) {
  return (
    <div className="text-sm">
      <span className="font-medium">{item.name}</span>
      {item.keywords && item.keywords.length > 0 && (
        <span className="text-fg-muted"> — {item.keywords.join(', ')}</span>
      )}
    </div>
  );
}

function ReferenceEntry({ r, didHandles }: { r: Reference; didHandles: DH }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="font-semibold">{r.name}</p>
        <BlueskyLink did={r.did} didHandles={didHandles} />
      </div>
      {r.reference && <p className="mt-1 text-sm text-fg-soft italic">&ldquo;{r.reference}&rdquo;</p>}
    </div>
  );
}

function ProjectEntry({ p, didHandles }: { p: Project; didHandles: DH }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{p.name}</a>
          ) : (
            <span className="font-semibold">{p.name}</span>
          )}
          {p.entity && <span className="text-fg-muted text-sm"> · {p.entity}</span>}
          {p.type && <span className="text-fg-muted text-xs"> ({p.type})</span>}
        </div>
        <DateRange start={p.startDate} end={p.endDate} />
      </div>
      <BlueskyLink did={p.did} didHandles={didHandles} />
      {p.description && <p className="mt-1 text-sm text-fg-soft">{p.description}</p>}
      {p.roles && p.roles.length > 0 && (
        <p className="text-sm text-fg-muted mt-0.5">Roles: {p.roles.join(', ')}</p>
      )}
      {p.highlights && p.highlights.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-0.5 text-sm text-fg-soft">
          {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      {p.keywords && p.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.keywords.map((k, i) => (
            <span key={i} className="rounded-full bg-raised px-2.5 py-0.5 text-xs text-fg-soft">{k}</span>
          ))}
        </div>
      )}
      <MediaCarousel items={p.media ?? []} />
    </div>
  );
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function DateRange({ start, end }: { start?: string; end?: string }) {
  if (!start && !end) return null;
  return (
    <span className="text-sm text-fg-muted shrink-0 whitespace-nowrap">
      {start ?? ''}
      {start && (end || !end) ? ' – ' : ''}
      {end ?? 'Present'}
    </span>
  );
}

function displayUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
