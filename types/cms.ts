
import { Timestamp } from 'firebase/firestore';

export type ComponentType = 'hero' | 'text' | 'features' | 'cta' | 'contact';

export interface CMSComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
}

export interface CMSPage {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  components: CMSComponent[];
  updatedAt?: Timestamp;
  published: boolean;
}

export interface GlobalSettings {
  siteName: string;
  contactPhone: string;
  contactEmail: string;
  themeMode: 'light' | 'dark';
  heroEnabled: boolean;
  copyrightText?: string; // Added for Footer
}

export interface MediaItem {
  id: string;
  fileName: string;
  fileURL: string;
  fileType: string;
  fileSize: number;
  createdAt: Timestamp;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
}

// --- New Types for Home Page Editor ---

export interface CertificateItem {
  title: string;
  issuer: string;
  image: string;
  date?: string;
}

export interface HomeConfig {
  sectionOrder?: string[]; // New field for ordering sections
  hero: {
    role: string;
    title: string;
    subtitle: string;
    image: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    title: string;
    bio: string;
    showIcon: boolean;
  };
  services: {
    title: string;
    subtitle: string;
    image: string;
    list: string[]; // List of cases treated
  };
  why: {
    title: string;
    items: { title: string; desc: string }[];
  };
  certificates: {
    title: string;
    subtitle: string;
    items: CertificateItem[];
  };
  contact: {
    desc: string;
    buttonText: string;
  };
}
