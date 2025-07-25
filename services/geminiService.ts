import { GoogleGenAI, Type } from "@google/genai";
import { ReportData, DashboardData, TimelineAppointment, Dock } from '../types.ts';

export const getAIInsights = async (contextData: any, query: string, systemInstruction: string): Promise<string> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return "API Key not configured. The AI assistant is currently unavailable. Please contact an administrator.";
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";
  
  const contents = `CONTEXT: Here is the current data in JSON format:\n${JSON.stringify(contextData, null, 2)}\n\nQUESTION: ${query}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while fetching insights: ${error.message}`;
    }
    return "An unexpected error occurred while fetching insights.";
  }
};

export const getReportSummary = async (
  reportData: ReportData,
): Promise<string> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return "**AI Summary Generation Failed**\n- API Key is not configured in the environment.\n- Please contact an administrator to enable this feature.";
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";
  const systemInstruction = `You are a logistics operations analyst. Based on the provided JSON data, generate a concise, professional summary for a manager. Highlight key trends, top/bottom performers, and any potential issues. Format the response with a bold title (e.g., **Operational Report Summary**) and bullet points for readability.`;
  const contents = `Here is the operations report data:\n${JSON.stringify(reportData, null, 2)}\n\nPlease provide a summary.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for report summary:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getDashboardSummary = async (data: DashboardData): Promise<string> => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set. Please enable it to use AI features.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const kpiText = data.kpis.map(kpi => `- ${kpi.title}: ${kpi.value} (${kpi.subtext})`).join('\n');
    const activityText = data.dockActivities.map(act => `- Dock ${act.dockName}: ${act.carrier} (${act.vehicleNumber}) is ${act.status}.`).join('\n');

    const prompt = `
    You are a logistics operations analyst for a busy warehouse. Based on the following data for today, provide a concise summary of the key operational highlights.

    Your summary should be structured with:
    1. A main title in bold (e.g., **Today's Operational Snapshot**).
    2. A brief, one-sentence overview.
    3. A few bullet points for key insights (both positive and negative), using '*' for bullets.
    4. A concluding sentence with a recommendation or forward-looking statement.

    Use a professional but clear tone.

    Here is the data:

    **Key Performance Indicators:**
    ${kpiText}

    **Recent Dock Activities:**
    ${activityText}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (e) {
        console.error("Error generating dashboard summary", e);
        if (e instanceof Error) {
            throw new Error(`Failed to generate summary: ${e.message}`);
        }
        throw new Error("An unknown error occurred while generating the summary.");
    }
};

export const findOptimalDock = async (
  appointment: TimelineAppointment,
  availableDocks: Dock[]
): Promise<{ dockId: string; reason: string }> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API Key not configured.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    Based on the incoming appointment and the list of currently available docks, suggest the best dock for reassignment.
    
    Appointment Details:
    - Vehicle: ${appointment.vehicleNumber}
    - Carrier: ${appointment.transporter}
    - Requires Refrigerated Dock: ${appointment.vehicleRequirements?.isRefrigerated ? 'Yes' : 'No'}
    - Original Dock: ${appointment.dockId}
    
    Available Docks (JSON):
    ${JSON.stringify(availableDocks.map(d => ({id: d.id, name: d.name, safetyComplianceTags: d.safetyComplianceTags, location: d.location})), null, 2)}
    
    Your task is to return a JSON object with the optimal dockId and a brief reason for the choice. 
    Prioritize docks in the same bay if possible. If the vehicle requires refrigeration, only suggest docks with 'Cold Storage' tag.
    The reason should be concise and helpful for a logistics operator.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      dockId: { type: Type.STRING, description: "The ID of the suggested optimal dock." },
      reason: { type: Type.STRING, description: "A concise reason for suggesting this dock." },
    },
    required: ["dockId", "reason"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
          responseMimeType: "application/json",
          responseSchema
      },
    });
    
    const jsonStr = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
    const result = JSON.parse(jsonStr);
    
    if (result.dockId && result.reason && availableDocks.some(d => d.id === result.dockId)) {
        return result;
    } else {
        throw new Error("AI response was invalid or suggested a non-existent dock.");
    }

  } catch (error) {
    console.error("Error calling Gemini API for optimal dock:", error);
    // Fallback logic in case of AI failure
    const originalBay = appointment.dockId ? availableDocks.find(d => d.id === appointment.dockId)?.location : null;
    
    const filterAndSortDocks = (docksToSort: Dock[]) => {
        return docksToSort.sort((a, b) => {
            // Prioritize same bay
            if (originalBay) {
                if (a.location === originalBay && b.location !== originalBay) return -1;
                if (a.location !== originalBay && b.location === originalBay) return 1;
            }
            // Then sort by name
            return a.name.localeCompare(b.name);
        });
    };

    let suitableDocks: Dock[];
    if (appointment.vehicleRequirements?.isRefrigerated) {
        suitableDocks = filterAndSortDocks(availableDocks.filter(d => d.safetyComplianceTags.includes('Cold Storage')));
    } else {
        suitableDocks = filterAndSortDocks(availableDocks);
    }
    
    const suggestedDock = suitableDocks[0];
    
    if (suggestedDock) {
        return {
            dockId: suggestedDock.id!,
            reason: 'AI fallback: Selected the first available compatible dock.'
        };
    }
    throw new Error(`Failed to find an optimal dock. Error: ${error instanceof Error ? error.message : 'Unknown AI error'}`);
  }
};