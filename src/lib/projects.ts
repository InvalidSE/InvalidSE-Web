import projectsData from './projects.json';

export interface Project {
    title: string;
    description: string;
    tags: string[];
    image: string;
    link?: string;
    externalLink?: string;
    video?: string;
    github?: string;
    highlighted: boolean;
}

export type Projects = Project[];

export const projects: Projects = projectsData as Projects;
