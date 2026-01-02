import { HouseTheme, Checklists, Member } from "./types";

export const STORAGE_KEYS = {
  PROJECTS: 'tripPlanner_projects',
  ALL_DATA: 'tripPlanner_allData',
  GOOGLE_TOKEN: 'tripPlanner_google_token',
  CLIENT_ID: 'tripPlanner_client_id',
};

export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

export const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

export const HOUSE_THEMES: Record<string, HouseTheme> = {
  gryffindor: {
    id: 'gryffindor',
    name: 'Gryffindor',
    label: '葛來分多',
    colors: {
      primary: 'bg-red-900',
      secondary: 'bg-red-950',
      accent: 'text-amber-400',
      text: 'text-red-50',
      background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-red-950 to-slate-900',
      cardBg: 'bg-[#f5e6d3]', // Parchment
      cardBorder: 'border-[#740001]',
    },
    icon: '🦁',
    traits: '勇敢、膽識、騎士精神'
  },
  slytherin: {
    id: 'slytherin',
    name: 'Slytherin',
    label: '史萊哲林',
    colors: {
      primary: 'bg-green-900',
      secondary: 'bg-green-950',
      accent: 'text-zinc-300', // Silver
      text: 'text-green-50',
      background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-slate-900',
      cardBg: 'bg-[#eaeff2]', // Cold Parchment
      cardBorder: 'border-[#1a472a]',
    },
    icon: '🐍',
    traits: '野心、精明、純粹血統'
  },
  ravenclaw: {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    label: '雷文克勞',
    colors: {
      primary: 'bg-blue-900',
      secondary: 'bg-blue-950',
      accent: 'text-amber-200', // Bronze
      text: 'text-blue-50',
      background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-blue-950 to-slate-900',
      cardBg: 'bg-[#e0e4f2]', // Airy Parchment
      cardBorder: 'border-[#0e1a40]',
    },
    icon: '🦅',
    traits: '智慧、學習、機智'
  },
  hufflepuff: {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    label: '赫夫帕夫',
    colors: {
      primary: 'bg-yellow-600',
      secondary: 'bg-yellow-900',
      accent: 'text-stone-900',
      text: 'text-yellow-50',
      background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-700 via-yellow-900 to-slate-900',
      cardBg: 'bg-[#fff4bd]', // Warm Parchment
      cardBorder: 'border-[#ecb939]',
    },
    icon: '🦡',
    traits: '忠誠、勤奮、正直'
  }
};

export const DEFAULT_CHECKLISTS: Checklists = {
  luggage: [
    { id: '1', text: '護照', completed: false },
    { id: '2', text: '魔杖 (充電器)', completed: false },
  ],
  shopping: [],
  food: [],
  sightseeing: []
};

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'me', name: '我', avatar: '🧙‍♂️' }
];