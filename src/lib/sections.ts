import { NSID } from './lexicons';

export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'date-partial' | 'array-lines' | 'did' | 'media';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  rows?: number; // for textarea
}

export interface SectionConfig {
  slug: string;
  nsid: string;
  label: string;
  description: string;
  fields: Field[];
  /** Field used as the primary title in the list view. */
  titleField: string;
  /** Field used as a subtitle in the list view. */
  subtitleField?: string;
}

export const SECTIONS: SectionConfig[] = [
  {
    slug: 'work',
    nsid: NSID.WORK,
    label: 'Work Experience',
    description: 'Your work history, one entry per job.',
    titleField: 'name',
    subtitleField: 'position',
    fields: [
      { key: 'name',        label: 'Company Name',        type: 'text',         placeholder: 'e.g. Facebook' },
      { key: 'position',    label: 'Position',             type: 'text',         placeholder: 'e.g. Software Engineer' },
      { key: 'location',    label: 'Location',             type: 'text',         placeholder: 'e.g. Menlo Park, CA' },
      { key: 'url',         label: 'Company URL',          type: 'url',          placeholder: 'https://' },
      { key: 'startDate',   label: 'Start Date',           type: 'date-partial', placeholder: 'e.g. 2020-01' },
      { key: 'endDate',     label: 'End Date',             type: 'date-partial', placeholder: 'Leave blank if current' },
      { key: 'description', label: 'Company Description',  type: 'text',         placeholder: 'e.g. Social Media Company' },
      { key: 'summary',     label: 'Summary',              type: 'textarea',     placeholder: 'Overview of your responsibilities', rows: 3 },
      { key: 'highlights',  label: 'Highlights',           type: 'array-lines',  description: "Start each highlight with '- ' on a new line", rows: 4 },
      { key: 'did',         label: 'Bluesky Account',      type: 'did',          placeholder: '@company.bsky.social' },
      { key: 'media',       label: 'Media',                type: 'media' },
    ],
  },
  {
    slug: 'education',
    nsid: NSID.EDUCATION,
    label: 'Education',
    description: 'Your educational background, one entry per institution.',
    titleField: 'institution',
    subtitleField: 'studyType',
    fields: [
      { key: 'institution', label: 'Institution', type: 'text',         placeholder: 'e.g. MIT' },
      { key: 'area',        label: 'Area of Study', type: 'text',       placeholder: 'e.g. Computer Science' },
      { key: 'studyType',   label: 'Degree Type',   type: 'text',       placeholder: 'e.g. Bachelor' },
      { key: 'url',         label: 'Institution URL', type: 'url',      placeholder: 'https://' },
      { key: 'startDate',   label: 'Start Date',    type: 'date-partial', placeholder: 'e.g. 2016-09' },
      { key: 'endDate',     label: 'End Date',      type: 'date-partial', placeholder: 'Leave blank if current' },
      { key: 'score',       label: 'Score / GPA',   type: 'text',       placeholder: 'e.g. 3.67/4.0' },
      { key: 'courses',     label: 'Notable Courses', type: 'array-lines', description: "Start each course with '- ' on a new line", rows: 4 },
      { key: 'did',         label: 'Bluesky Account', type: 'did',         placeholder: '@university.edu' },
      { key: 'media',       label: 'Media',           type: 'media' },
    ],
  },
  {
    slug: 'volunteer',
    nsid: NSID.VOLUNTEER,
    label: 'Volunteer',
    description: 'Volunteer experience.',
    titleField: 'organization',
    subtitleField: 'position',
    fields: [
      { key: 'organization', label: 'Organization', type: 'text',         placeholder: 'e.g. Red Cross' },
      { key: 'position',     label: 'Position',     type: 'text',         placeholder: 'e.g. Coordinator' },
      { key: 'url',          label: 'URL',          type: 'url',          placeholder: 'https://' },
      { key: 'startDate',    label: 'Start Date',   type: 'date-partial', placeholder: 'e.g. 2018-03' },
      { key: 'endDate',      label: 'End Date',     type: 'date-partial', placeholder: 'Leave blank if ongoing' },
      { key: 'summary',      label: 'Summary',      type: 'textarea',     rows: 3 },
      { key: 'highlights',   label: 'Highlights',   type: 'array-lines',  description: "Start each highlight with '- ' on a new line", rows: 4 },
      { key: 'did',          label: 'Bluesky Account', type: 'did',        placeholder: '@org.bsky.social' },
      { key: 'media',        label: 'Media',           type: 'media' },
    ],
  },
  {
    slug: 'awards',
    nsid: NSID.AWARDS,
    label: 'Awards',
    description: 'Awards and recognitions.',
    titleField: 'title',
    subtitleField: 'awarder',
    fields: [
      { key: 'title',   label: 'Award Title', type: 'text',         placeholder: 'e.g. Employee of the Year' },
      { key: 'awarder', label: 'Awarder',     type: 'text',         placeholder: 'e.g. Time Magazine' },
      { key: 'date',    label: 'Date',        type: 'date-partial', placeholder: 'e.g. 2019-06' },
      { key: 'summary', label: 'Summary',     type: 'textarea',     rows: 3 },
    ],
  },
  {
    slug: 'certificates',
    nsid: NSID.CERTIFICATES,
    label: 'Certificates',
    description: 'Professional certificates.',
    titleField: 'name',
    subtitleField: 'issuer',
    fields: [
      { key: 'name',   label: 'Certificate Name', type: 'text',         placeholder: 'e.g. Certified Kubernetes Administrator' },
      { key: 'issuer', label: 'Issuer',           type: 'text',         placeholder: 'e.g. CNCF' },
      { key: 'date',   label: 'Date',             type: 'date-partial', placeholder: 'e.g. 2022-04' },
      { key: 'url',    label: 'Certificate URL',  type: 'url',          placeholder: 'https://' },
    ],
  },
  {
    slug: 'publications',
    nsid: NSID.PUBLICATIONS,
    label: 'Publications',
    description: 'Published works.',
    titleField: 'name',
    subtitleField: 'publisher',
    fields: [
      { key: 'name',        label: 'Title',       type: 'text',         placeholder: 'e.g. The World Wide Web' },
      { key: 'publisher',   label: 'Publisher',   type: 'text',         placeholder: 'e.g. IEEE' },
      { key: 'releaseDate', label: 'Release Date', type: 'date-partial', placeholder: 'e.g. 1996-10' },
      { key: 'url',         label: 'URL',         type: 'url',          placeholder: 'https://' },
      { key: 'summary',     label: 'Summary',     type: 'textarea',     rows: 3 },
      { key: 'did',         label: 'Bluesky Account', type: 'did',      placeholder: '@publisher.bsky.social' },
      { key: 'media',       label: 'Media',           type: 'media' },
    ],
  },
  {
    slug: 'skills',
    nsid: NSID.SKILLS,
    label: 'Skills',
    description: 'Professional skills and competencies.',
    titleField: 'name',
    subtitleField: 'level',
    fields: [
      { key: 'name',     label: 'Skill Name', type: 'text',        placeholder: 'e.g. Web Development' },
      { key: 'level',    label: 'Level',      type: 'text',        placeholder: 'e.g. Expert, Intermediate' },
      { key: 'keywords', label: 'Keywords',   type: 'array-lines', description: "Start each keyword with '- ' on a new line", rows: 4 },
    ],
  },
  {
    slug: 'languages',
    nsid: NSID.LANGUAGES,
    label: 'Languages',
    description: 'Languages you speak.',
    titleField: 'language',
    subtitleField: 'fluency',
    fields: [
      { key: 'language', label: 'Language', type: 'text', placeholder: 'e.g. Spanish' },
      { key: 'fluency',  label: 'Fluency',  type: 'text', placeholder: 'e.g. Fluent, Native, Beginner' },
    ],
  },
  {
    slug: 'interests',
    nsid: NSID.INTERESTS,
    label: 'Interests',
    description: 'Personal interests and hobbies.',
    titleField: 'name',
    fields: [
      { key: 'name',     label: 'Interest',  type: 'text',        placeholder: 'e.g. Philosophy' },
      { key: 'keywords', label: 'Keywords',  type: 'array-lines', description: "Start each keyword with '- ' on a new line", rows: 3 },
    ],
  },
  {
    slug: 'references',
    nsid: NSID.REFERENCES,
    label: 'References',
    description: 'Professional references.',
    titleField: 'name',
    fields: [
      { key: 'name',      label: 'Name',      type: 'text',     placeholder: 'e.g. Jane Smith' },
      { key: 'reference', label: 'Reference', type: 'textarea', rows: 4 },
      { key: 'did',       label: 'Bluesky Account', type: 'did', placeholder: '@person.bsky.social' },
    ],
  },
  {
    slug: 'projects',
    nsid: NSID.PROJECTS,
    label: 'Projects',
    description: 'Career projects.',
    titleField: 'name',
    subtitleField: 'entity',
    fields: [
      { key: 'name',        label: 'Project Name',  type: 'text',         placeholder: 'e.g. Personal Portfolio' },
      { key: 'description', label: 'Description',   type: 'textarea',     rows: 2 },
      { key: 'entity',      label: 'Entity / Org',  type: 'text',         placeholder: 'e.g. Greenpeace' },
      { key: 'type',        label: 'Type',          type: 'text',         placeholder: 'e.g. application, talk, conference' },
      { key: 'url',         label: 'URL',           type: 'url',          placeholder: 'https://' },
      { key: 'startDate',   label: 'Start Date',    type: 'date-partial', placeholder: 'e.g. 2021-06' },
      { key: 'endDate',     label: 'End Date',      type: 'date-partial', placeholder: 'Leave blank if ongoing' },
      { key: 'roles',       label: 'Roles',         type: 'array-lines',  description: "Start each role with '- ' on a new line (e.g. - Team Lead)", rows: 3 },
      { key: 'highlights',  label: 'Highlights',    type: 'array-lines',  description: "Start each highlight with '- ' on a new line", rows: 3 },
      { key: 'keywords',    label: 'Keywords',      type: 'array-lines',  description: "Start each keyword with '- ' on a new line", rows: 3 },
      { key: 'did',         label: 'Bluesky Account', type: 'did',        placeholder: '@entity.bsky.social' },
      { key: 'media',       label: 'Media',           type: 'media' },
    ],
  },
];

export const SECTION_BY_SLUG = Object.fromEntries(SECTIONS.map(s => [s.slug, s]));

