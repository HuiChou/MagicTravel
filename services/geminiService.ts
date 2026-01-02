import { GoogleGenAI, Type } from "@google/genai";
import { FullTripData, DayPlan, Activity } from "../types";
import { DEFAULT_MEMBERS } from "../constants";

const generateId = () => Math.random().toString(36).substring(2, 9);

export const generateTripItinerary = async (
  destination: string, 
  days: number, 
  budget: string, 
  interests: string
): Promise<FullTripData> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Create a detailed ${days}-day trip itinerary for ${destination}. 
  Budget level: ${budget}. Interests: ${interests}.
  Return the response in JSON format.
  Include 3-5 activities per day. Costs should be estimated in USD.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tripName: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayNumber: { type: Type.INTEGER },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      description: { type: Type.STRING },
                      location: { type: Type.STRING },
                      cost: { type: Type.NUMBER },
                      notes: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ['food', 'transport', 'activity', 'lodging', 'shopping', 'other'] }
                    },
                    required: ["time", "description", "location", "cost", "category"]
                  }
                }
              },
              required: ["dayNumber", "activities"]
            }
          }
        },
        required: ["tripName", "days"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  const result = JSON.parse(text);

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + days);

  const tripData: FullTripData = {
    id: generateId(),
    themeId: 'gryffindor',
    tripSettings: {
        title: result.tripName,
        destination: destination,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: days
    },
    currencySettings: {
        selectedCountry: { code: 'US', currency: 'USD', name: 'United States' },
        exchangeRate: 1
    },
    companions: JSON.parse(JSON.stringify(DEFAULT_MEMBERS)),
    categories: { itinerary: [], expense: [] },
    itinerary: result.days.map((d: any) => ({
      id: generateId(),
      dayNumber: d.dayNumber,
      date: new Date(Date.now() + (d.dayNumber - 1) * 86400000).toISOString().split('T')[0],
      activities: d.activities.map((a: any) => ({
        id: generateId(),
        time: a.time,
        description: a.description,
        location: a.location,
        cost: a.cost,
        notes: a.notes || '',
        category: a.category || 'other'
      }))
    })),
    expenses: [],
    packingList: [
        { id: '1', text: '護照', completed: false },
        { id: '2', text: '魔杖 (充電器)', completed: false }
    ],
    shoppingList: [],
    foodList: [],
    sightseeingList: [],
    lastModified: Date.now(),
  };

  return tripData;
};