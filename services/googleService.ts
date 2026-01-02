import { SCOPES, DISCOVERY_DOCS } from '../constants';
import { FullTripData } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let isGapiInitialized = false;

export const initGoogleApi = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!clientId) {
        reject("Client ID missing");
        return;
    }

    if (window.gapi && isGapiInitialized) {
        resolve();
        return;
    }

    const start = () => {
      window.gapi.client.init({
        clientId: clientId,
        discoveryDocs: DISCOVERY_DOCS,
      }).then(() => {
        isGapiInitialized = true;
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: '', 
        });
        resolve();
      }).catch((err: any) => reject(err));
    };

    if (window.gapi) {
        window.gapi.load('client', start);
    } else {
        setTimeout(() => {
             if (window.gapi) window.gapi.load('client', start);
             else reject("Google API script not loaded");
        }, 1000);
    }
  });
};

export const requestAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
        reject("Google API not initialized. Please set Client ID in settings.");
        return;
    }
    
    tokenClient.callback = (resp: any) => {
      if (resp.error) reject(resp);
      resolve(resp.access_token);
    };
    
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const ensureTravelAppFolder = async (): Promise<string> => {
  try {
    // 1. Check if folder exists
    const response = await window.gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and name='TravelApp' and trashed=false",
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // 2. Create if not exists
    const fileMetadata = {
      'name': 'TravelApp',
      'mimeType': 'application/vnd.google-apps.folder'
    };
    const createResponse = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });
    return createResponse.result.id;
  } catch (error) {
    console.error("Error ensuring TravelApp folder", error);
    throw error;
  }
};

export const createSpreadsheet = async (title: string): Promise<string> => {
    try {
        const folderId = await ensureTravelAppFolder();
        const response = await window.gapi.client.sheets.spreadsheets.create({
            properties: { title },
        });
        const spreadsheetId = response.result.spreadsheetId;

        // Move file to TravelApp folder (Drive API separate call usually needed, 
        // but creates usually happen in root. We need to move it or create it inside.
        // Sheets API create doesn't support 'parents'. We must use Drive API to move.)
        
        // 1. Get current parents (usually 'root')
        const file = await window.gapi.client.drive.files.get({
            fileId: spreadsheetId,
            fields: 'parents'
        });
        const previousParents = file.result.parents.join(',');

        // 2. Add to TravelApp folder, remove from root
        await window.gapi.client.drive.files.update({
            fileId: spreadsheetId,
            addParents: folderId,
            removeParents: previousParents,
            fields: 'id, parents'
        });

        return spreadsheetId;
    } catch (error) {
        console.error("Error creating sheet", error);
        throw error;
    }
};

export const createDriveFolder = async (name: string): Promise<string> => {
  // Legacy function, might be replaced by specific logic if needed
    try {
        const fileMetadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        const response = await window.gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        return response.result.id;
    } catch (error) {
        console.error("Error creating folder", error);
        throw error;
    }
}

const ensureSheetsExist = async (spreadsheetId: string, sheetTitles: string[]) => {
    // 1. Get current sheets
    const metadata = await window.gapi.client.sheets.spreadsheets.get({ spreadsheetId });
    const existingTitles = metadata.result.sheets.map((s: any) => s.properties.title);

    // 2. Add missing sheets
    const requests = [];
    for (const title of sheetTitles) {
        if (!existingTitles.includes(title)) {
            requests.push({ addSheet: { properties: { title } } });
        }
    }

    if (requests.length > 0) {
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests }
        });
    }
};

export const syncTripToSheet = async (trip: FullTripData, accessToken: string): Promise<string> => {
    if (!accessToken) throw new Error("No access token");

    let spreadsheetId = trip.googleDriveFileId;
    if (!spreadsheetId) {
        spreadsheetId = await createSpreadsheet(`TripSync: ${trip.tripSettings.title}`);
    }

    const sheets = ['Overview', 'Itinerary', 'Expenses', 'Packing', 'Shopping', 'Food', 'Sightseeing'];
    await ensureSheetsExist(spreadsheetId, sheets);

    // --- Prepare Data ---

    // 1. Overview
    const overviewValues = [
        ['Property', 'Value'],
        ['Title', trip.tripSettings.title],
        ['Destination', trip.tripSettings.destination],
        ['Start Date', trip.tripSettings.startDate],
        ['End Date', trip.tripSettings.endDate],
        ['Days', trip.tripSettings.days],
        ['Theme', trip.themeId],
        ['Currency', trip.currencySettings.selectedCountry.currency],
        ['Exchange Rate', trip.currencySettings.exchangeRate],
        ['Companions', trip.companions.map(c => c.name).join(', ')]
    ];

    // 2. Itinerary
    const itineraryValues = [['Day', 'Date', 'Time', 'Activity', 'Location', 'Cost', 'Category', 'Notes']];
    trip.itinerary.forEach(day => {
        day.activities.forEach(act => {
            itineraryValues.push([
                `Day ${day.dayNumber}`,
                day.date,
                act.time,
                act.description,
                act.location,
                act.cost.toString(),
                act.category || '',
                act.notes || ''
            ]);
        });
    });

    // 3. Expenses
    const expenseValues = [['Date', 'Item', 'Amount', 'Currency', 'Category', 'Payer', 'Targets']];
    trip.expenses.forEach(exp => {
        expenseValues.push([
            exp.date,
            exp.description,
            exp.amount.toString(),
            exp.currency,
            exp.category,
            trip.companions.find(c => c.id === exp.payerId)?.name || exp.payerId,
            exp.targets.length === trip.companions.length ? 'ALL' : exp.targets.join(',')
        ]);
    });

    // 4. Lists helpers
    const formatList = (items: any[]) => {
        const rows = [['Item', 'Completed', 'Cost', 'Notes/Link']];
        items.forEach(i => rows.push([i.text, i.completed ? 'YES' : 'NO', i.cost || '', i.link || '']));
        return rows;
    };

    // --- Batch Update Values ---
    const data = [
        { range: 'Overview!A1', values: overviewValues },
        { range: 'Itinerary!A1', values: itineraryValues },
        { range: 'Expenses!A1', values: expenseValues },
        { range: 'Packing!A1', values: formatList(trip.packingList) },
        { range: 'Shopping!A1', values: formatList(trip.shoppingList) },
        { range: 'Food!A1', values: formatList(trip.foodList) },
        { range: 'Sightseeing!A1', values: formatList(trip.sightseeingList) },
    ];

    await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
            valueInputOption: 'RAW',
            data: data
        }
    });

    return spreadsheetId;
};

// --- New Features ---

export const addCollaborator = async (fileId: string, email: string): Promise<void> => {
    try {
        await window.gapi.client.drive.permissions.create({
            fileId: fileId,
            resource: {
                role: 'writer',
                type: 'user',
                emailAddress: email
            }
        });
    } catch (error) {
        console.error("Failed to add collaborator", error);
        throw error;
    }
};

export const searchTripFiles = async (): Promise<any[]> => {
    try {
        // Find spreadsheets created by TripSync
        const response = await window.gapi.client.drive.files.list({
            q: "name contains 'TripSync:' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
            fields: 'files(id, name, modifiedTime)',
            spaces: 'drive'
        });
        return response.result.files || [];
    } catch (error) {
        console.error("Failed to search files", error);
        throw error;
    }
};