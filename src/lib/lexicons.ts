// NSID constants for all org.blueres.resume.* lexicons.

export const NSID = {
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

// The singleton rkey used for the basics record.
export const BASICS_RKEY = 'self';

// All collection NSIDs (non-singleton sections).
export const COLLECTION_NSIDS = [
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
