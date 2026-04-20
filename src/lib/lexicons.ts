// NSID constants for org.blueres.resume.* lexicons.

export const NSID = {
  // Unified resume record (new schema)
  RESUME: 'org.blueres.resume.resume',

  // Legacy per-section records (kept for migration cleanup only)
  BASICS:       'org.blueres.resume.basics',
  WORK:         'org.blueres.resume.work',
  EDUCATION:    'org.blueres.resume.education',
  VOLUNTEER:    'org.blueres.resume.volunteer',
  AWARDS:       'org.blueres.resume.awards',
  CERTIFICATES: 'org.blueres.resume.certificates',
  PUBLICATIONS: 'org.blueres.resume.publications',
  SKILLS:       'org.blueres.resume.skills',
  LANGUAGES:    'org.blueres.resume.languages',
  INTERESTS:    'org.blueres.resume.interests',
  REFERENCES:   'org.blueres.resume.references',
  PROJECTS:     'org.blueres.resume.projects',
} as const;

// All legacy collection NSIDs, used only for the one-time cleanup action.
export const LEGACY_NSIDS = [
  NSID.BASICS,
  NSID.WORK,
  NSID.EDUCATION,
  NSID.VOLUNTEER,
  NSID.AWARDS,
  NSID.CERTIFICATES,
  NSID.PUBLICATIONS,
  NSID.SKILLS,
  NSID.LANGUAGES,
  NSID.INTERESTS,
  NSID.REFERENCES,
  NSID.PROJECTS,
] as const;
