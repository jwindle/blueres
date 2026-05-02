// TypeScript types mirroring the org.blueres.resume.resume lexicon.

export interface MediaUrl {
  $type: 'org.blueres.resume.resume#mediaUrl';
  url?: string;
  mediaType?: 'image' | 'video';
  title?: string;
  caption?: string;
}

export interface MediaAtUri {
  $type: 'org.blueres.resume.resume#mediaAtUri';
  atUri?: string;
  title?: string;
  caption?: string;
}

export type Media = MediaUrl | MediaAtUri;

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Profile {
  network?: string;
  username?: string;
  url?: string;
}

export interface Basics {
  $type?: string;
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: Location;
  profiles?: Profile[];
  media?: Media[];
}

export interface Work {
  $type?: string;
  name?: string;
  did?: string;
  location?: string;
  description?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  media?: Media[];
}

export interface Education {
  $type?: string;
  institution?: string;
  did?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
  media?: Media[];
}

export interface Volunteer {
  $type?: string;
  organization?: string;
  did?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  media?: Media[];
}

export interface Award {
  $type?: string;
  title?: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface Certificate {
  $type?: string;
  name?: string;
  date?: string;
  url?: string;
  issuer?: string;
}

export interface Publication {
  $type?: string;
  name?: string;
  did?: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
  media?: Media[];
}

export interface Skill {
  $type?: string;
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface Language {
  $type?: string;
  language?: string;
  fluency?: string;
}

export interface Interest {
  $type?: string;
  name?: string;
  keywords?: string[];
}

export interface Reference {
  $type?: string;
  name?: string;
  did?: string;
  reference?: string;
}

export interface Project {
  $type?: string;
  name?: string;
  did?: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
  media?: Media[];
}

export interface Meta {
  title?: string;
  canonical?: string;
  version?: string;
  lastModified?: string;
  active?: boolean;
}

export interface ResumeData {
  $type?: string;
  basics?: Basics | null;
  work?: Work[];
  education?: Education[];
  volunteer?: Volunteer[];
  awards?: Award[];
  certificates?: Certificate[];
  publications?: Publication[];
  skills?: Skill[];
  languages?: Language[];
  interests?: Interest[];
  references?: Reference[];
  projects?: Project[];
  meta?: Meta;
}

export interface ResumeRecord {
  rkey: string;
  data: ResumeData;
}
