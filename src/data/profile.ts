import content from './profile.json';

export interface SocialLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  wordmark: string;
  role: string;
  headline: string;
  intro: string;
  availability: string;
  email: string;
  github: string;
  socialLinks: SocialLink[];
  isExample: boolean;
}

export interface SkillGroup {
  title: string;
  description: string;
  tools: string[];
  projectSlugs: string[];
}

export interface ExperienceItem {
  period: string;
  organization: string;
  role: string;
  contribution: string;
}

export interface ProfileContent {
  profile: Profile;
  skills: SkillGroup[];
  experience: ExperienceItem[];
}

const data: ProfileContent = content;

export const { profile, skills, experience } = data;
