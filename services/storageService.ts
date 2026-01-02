import { TripProject, FullTripData } from '../types';
import { STORAGE_KEYS } from '../constants';

export const getProjects = (): TripProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load projects', error);
    return [];
  }
};

export const saveProjects = (projects: TripProject[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getTripData = (projectId: string): FullTripData | null => {
  try {
    const allDataRaw = localStorage.getItem(STORAGE_KEYS.ALL_DATA);
    if (!allDataRaw) return null;
    const allData = JSON.parse(allDataRaw);
    return allData[projectId] || null;
  } catch (error) {
    console.error('Failed to load trip data', error);
    return null;
  }
};

export const saveTripData = (data: FullTripData): void => {
  try {
    const allDataRaw = localStorage.getItem(STORAGE_KEYS.ALL_DATA);
    const allData = allDataRaw ? JSON.parse(allDataRaw) : {};
    allData[data.id] = data;
    localStorage.setItem(STORAGE_KEYS.ALL_DATA, JSON.stringify(allData));
    
    // Create summary for the project list
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === data.id);
    
    const meta: TripProject = {
        id: data.id,
        name: data.tripSettings.title,
        startDate: data.tripSettings.startDate,
        endDate: data.tripSettings.endDate,
        destination: data.tripSettings.destination,
        lastModified: Date.now(),
        sheetId: data.googleDriveFileId,
        driveFolderId: data.driveFolderId,
        coverImage: data.coverImage,
        members: data.companions,
        currency: data.currencySettings.selectedCountry.currency,
        exchangeRate: data.currencySettings.exchangeRate
    };
    
    if (idx >= 0) {
      projects[idx] = meta;
    } else {
      projects.push(meta);
    }
    saveProjects(projects);
  } catch (error) {
    console.error('Failed to save trip data', error);
  }
};

export const deleteProject = (projectId: string): void => {
    const projects = getProjects().filter(p => p.id !== projectId);
    saveProjects(projects);
    
    const allDataRaw = localStorage.getItem(STORAGE_KEYS.ALL_DATA);
    if (allDataRaw) {
        const allData = JSON.parse(allDataRaw);
        delete allData[projectId];
        localStorage.setItem(STORAGE_KEYS.ALL_DATA, JSON.stringify(allData));
    }
}