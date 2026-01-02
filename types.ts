export type CategoryType = 'food' | 'transport' | 'activity' | 'lodging' | 'shopping' | 'other';

export interface Activity {
  id: string;
  time: string;
  description: string;
  location: string;
  cost: number;
  currency?: string;
  notes?: string;
  category?: string; // Changed to string to support dynamic categories
  payerId?: string;
  splitMethod?: 'equal' | 'exact' | 'shares';
}

export interface DayPlan {
  id: string;
  date: string;
  dayNumber: number;
  activities: Activity[];
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  cost?: number;
  link?: string;
}

export interface Checklists {
  luggage: ChecklistItem[];
  shopping: ChecklistItem[];
  food: ChecklistItem[];
  sightseeing: ChecklistItem[];
}

export interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  payerId: string;
  targets: string[];
}

// Summary object for the Dashboard
export interface TripProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination: string;
  lastModified: number;
  sheetId?: string;
  driveFolderId?: string;
  coverImage?: string;
  members: Member[];
  currency: string;
  exchangeRate: number;
}

// Data Architecture Components
export interface TripSettings {
  title: string;
  startDate: string;
  endDate: string;
  days: number;
  destination: string;
}

export interface CurrencySettings {
  selectedCountry: {
    code: string;
    currency: string;
    name: string;
  };
  exchangeRate: number;
}

export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Categories {
  itinerary: CategoryDef[];
  expense: CategoryDef[];
}

// The Core Data Object
export interface FullTripData {
  id: string;
  themeId: string;
  tripSettings: TripSettings;
  companions: Member[];
  currencySettings: CurrencySettings;
  categories: Categories;
  itinerary: DayPlan[]; // Keeping array for ease of use in React, mapped to object for JSON if needed
  expenses: ExpenseRecord[];
  
  // Lists as separate arrays
  packingList: ChecklistItem[];
  shoppingList: ChecklistItem[];
  foodList: ChecklistItem[];
  sightseeingList: ChecklistItem[];

  googleDriveFileId?: string; // Spreadsheet ID
  driveFolderId?: string;
  coverImage?: string;
  lastModified: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRIP_DETAIL = 'TRIP_DETAIL',
}

// Theme Types
export type HouseId = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

export interface HouseTheme {
  id: HouseId;
  name: string;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    cardBg: string;
    cardBorder: string;
  };
  icon: string;
  traits: string;
}

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}