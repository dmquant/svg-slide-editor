import { Project, Slide } from '@/types/editor';

/**
 * Saves a project to localStorage
 */
export function saveProjectToLocalStorage(project: Project): void {
  try {
    localStorage.setItem(`svg-editor-project-${project.id}`, JSON.stringify(project));
    
    // Update the list of projects
    const projectsList = getProjectsList();
    if (!projectsList.includes(project.id)) {
      projectsList.push(project.id);
      localStorage.setItem('svg-editor-projects', JSON.stringify(projectsList));
    }
  } catch (error) {
    console.error('Error saving project to localStorage:', error);
  }
}

/**
 * Loads a project from localStorage
 */
export function loadProjectFromLocalStorage(projectId: string): Project | null {
  try {
    const projectJson = localStorage.getItem(`svg-editor-project-${projectId}`);
    if (!projectJson) return null;
    
    return JSON.parse(projectJson);
  } catch (error) {
    console.error('Error loading project from localStorage:', error);
    return null;
  }
}

/**
 * Gets the list of saved project IDs
 */
export function getProjectsList(): string[] {
  try {
    const projectsJson = localStorage.getItem('svg-editor-projects');
    if (!projectsJson) return [];
    
    return JSON.parse(projectsJson);
  } catch (error) {
    console.error('Error getting projects list from localStorage:', error);
    return [];
  }
}

/**
 * Deletes a project from localStorage
 */
export function deleteProjectFromLocalStorage(projectId: string): void {
  try {
    localStorage.removeItem(`svg-editor-project-${projectId}`);
    
    // Update the list of projects
    const projectsList = getProjectsList().filter(id => id !== projectId);
    localStorage.setItem('svg-editor-projects', JSON.stringify(projectsList));
  } catch (error) {
    console.error('Error deleting project from localStorage:', error);
  }
}

/**
 * Exports a project to a JSON file
 */
export function exportProjectToFile(project: Project): void {
  try {
    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${project.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting project to file:', error);
  }
}

/**
 * Imports a project from a JSON file
 */
export function importProjectFromFile(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target?.result as string);
        resolve(projectData);
      } catch (error) {
        reject(new Error('Invalid project file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Exports a slide as an SVG file
 */
export function exportSlideAsSvg(slide: Slide, width = 800, height = 600): void {
  try {
    // Generate SVG code
    let svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Add background if specified
    if (slide.background && slide.background !== 'transparent') {
      svgCode += `<rect width="100%" height="100%" fill="${slide.background}" />`;
    }
    
    // Add elements
    slide.elements.forEach(element => {
      switch (element.type) {
        case 'rect':
          svgCode += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" />`;
          break;
        case 'circle':
          const cx = element.x + (element.width / 2);
          const cy = element.y + (element.height / 2);
          const r = Math.min(element.width, element.height) / 2;
          svgCode += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" />`;
          break;
        case 'path':
          svgCode += `<path d="${element.d || ''}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" />`;
          break;
        case 'text':
          svgCode += `<text x="${element.x}" y="${element.y}" fill="${element.fill}" font-size="${element.fontSize || 16}px" font-family="${element.fontFamily || 'Arial'}">${element.text || 'Text'}</text>`;
          break;
      }
    });
    
    svgCode += '</svg>';
    
    // Create download link
    const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
    const fileName = `slide-${slide.id.slice(0, 8)}.svg`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting slide as SVG:', error);
  }
} 