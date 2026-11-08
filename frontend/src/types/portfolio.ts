// frontend/src/types/portfolio.ts

export interface HeroData {
  title: string;
  description: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  description: string;
  start_date: string;
  end_date: string | null;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface PortfolioData {
  hero: HeroData;
  experiences: Experience[];
  skills: Skill[];
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface HeroFormState {
  title: string;
  description: string;
}

export interface CreateExperiencePayload {
  role: string;
  company: string;
  description: string;
  start_date: string;
  end_date: string | null;
}

export interface ExperienceFormErrors {
  role?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  general?: string;
}

export interface CreateSkillPayload {
  name: string;
  category: string;
}