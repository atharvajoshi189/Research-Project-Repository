import { supabase } from './supabaseClient';

export interface AIProjectMetadata {
    id: string;
    title: string;
    abstract: string | null;
    tech_stack: string[] | null;
    authors: string[] | null;
    guide_name: string | null;
    academic_year: string | null;
}

export const getProjectMetadataForAI = async (): Promise<string> => {
    try {
        // Limit to 50 most recent projects to respect token limits
        const { data, error } = await supabase
            .from('projects')
            .select('id, title, abstract, tech_stack, authors, guide_name, academic_year')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching project metadata for AI:', error);
            return '';
        }

        if (!data || data.length === 0) {
            return 'No approved projects found.';
        }

        const formattedData = data.map((project: any) => {
            // Truncate abstract to save tokens
            const abstract = project.abstract
                ? (project.abstract.length > 200 ? project.abstract.substring(0, 200) + '...' : project.abstract)
                : 'No abstract available';

            const parts = [
                `ID: ${project.id}`,
                `Title: ${project.title}`,
                `Tech: ${Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : project.tech_stack || 'N/A'}`,
                `Authors: ${Array.isArray(project.authors) ? project.authors.slice(0, 2).join(', ') : project.authors || 'N/A'}`, // Limit authors
                `Summary: ${abstract}`,
            ];
            return parts.join(' | ');
        }).join('\n\n');

        return formattedData;
    } catch (err) {
        console.error('Unexpected error in getProjectMetadataForAI:', err);
        return '';
    }
};
