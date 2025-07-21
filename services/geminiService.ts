import { GoogleGenAI, Type } from "@google/genai";
import { Dock, TimelineAppointment, ReportData, DashboardData, ExtractedDocumentInfo, DocumentStatus } from '../types.ts';

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

export const findOptimalDock = async (
  appointment: TimelineAppointment,
  availableDocks: Dock[]
): Promise<{ dockId: string; reason: string } | null> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error('AI suggestion failed: API Key is not configured.');
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are a logistics coordinator AI. A vehicle has arrived, but its assigned dock is busy. Your task is to find the best alternative dock from a list of available docks.
  - Analyze the vehicle's requirements from the appointment data (e.g., isRefrigerated).
  - Prioritize docks in the same bay/location as the originally assigned dock if possible.
  - You MUST return a JSON object with "dockId" (the ID of your recommended dock) and "reason" (a brief explanation for your choice).
  - If no suitable dock is found, you MUST return null.`;

  const contents = `
    Appointment Data:
    ---
    ${JSON.stringify(appointment, null, 2)}
    ---
    
    Available Docks:
    ---
    ${JSON.stringify(availableDocks, null, 2)}
    ---
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dockId: { type: Type.STRING, description: 'The ID of the recommended dock.' },
            reason: { type: Type.STRING, description: 'A brief explanation for the recommendation.' }
          },
          required: ['dockId', 'reason']
        }
      }
    });
    
    const text = response.text.trim();
    if (text.toLowerCase() === 'null') return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Error calling findOptimalDock API:", error);
    let reason = 'An unexpected error occurred during AI dock suggestion.';
    if (error instanceof Error) {
      reason = `AI suggestion failed: ${error.message}`;
    }
    throw new Error(reason);
  }
};


export const extractInfoFromDocument = async (
  documentText: string
): Promise<ExtractedDocumentInfo> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error('AI extraction failed: API Key is not configured.');
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are an expert data extraction AI for logistics. Analyze the provided text from a shipping document (like a Bill of Lading) and extract the required information.
  
  You must extract:
  1. vehicleId: The vehicle's license plate or ID number.
  2. carrier: The name of the shipping/trucking company.
  3. companyName: The name of the vendor or shipper.
  
  You must also provide:
  4. confidence: A numerical score from 0.0 to 1.0 indicating your confidence in the extraction.
  5. notes: A brief note on any ambiguities or assumptions you made.
  
  Return the result as a single JSON object.`;

  const contents = `
    Document Text to Analyze:
    ---
    ${documentText}
    ---
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vehicleId: { type: Type.STRING },
            carrier: { type: Type.STRING },
            companyName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            notes: { type: Type.STRING }
          },
          required: ['vehicleId', 'carrier', 'companyName', 'confidence', 'notes']
        }
      }
    });
    
    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error calling extractInfoFromDocument API:", error);
    throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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


export const verifyDocumentWithAI = async (
  documentText: string,
  appointment: TimelineAppointment
): Promise<{ status: DocumentStatus; reason: string; }> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error('AI verification failed: API Key is not configured.');
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are an AI logistics document verifier. Your task is to compare the extracted text from a shipping document with the official appointment data. 
  
  Based on your comparison, you must decide if the document should be 'Verified', 'Rejected', or remain 'Pending'.
  - 'Verified': All key information (Vehicle ID, Carrier/Transporter name, Company Name) matches perfectly.
  - 'Rejected': There is a clear and significant mismatch in key information.
  - 'Pending Review': The information is ambiguous, partially matching, or key details are missing from the document text.

  You MUST return a single JSON object with two fields:
  1. "status": One of "Verified", "Rejected", or "Pending Review".
  2. "reason": A brief, clear explanation for your decision. For example, "Vehicle ID mismatch: document says ABC-123, appointment has XYZ-789." or "All key details match appointment data."`;

  const contents = `
    Extracted Document Text:
    ---
    ${documentText}
    ---
    
    Official Appointment Data:
    ---
    ${JSON.stringify({
        vehicleNumber: appointment.vehicleNumber,
        transporter: appointment.transporter,
        companyName: appointment.companyName
    }, null, 2)}
    ---
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: 'The verification status: "Verified", "Rejected", or "Pending Review".' },
            reason: { type: Type.STRING, description: 'A brief explanation for the decision.' }
          },
          required: ['status', 'reason']
        }
      }
    });
    
    const result = JSON.parse(response.text);
    const validStatuses = Object.values(DocumentStatus);
    if (validStatuses.includes(result.status as DocumentStatus)) {
        return result as { status: DocumentStatus; reason: string; };
    } else {
        return { status: DocumentStatus.Pending, reason: `AI returned an invalid status '${result.status}'. Original reason: ${result.reason}` };
    }

  } catch (error) {
    console.error("Error calling verifyDocumentWithAI API:", error);
    let reason = 'An unexpected error occurred during AI document verification.';
    if (error instanceof Error) {
      reason = `AI verification failed: ${error.message}`;
    }
    return { status: DocumentStatus.Pending, reason };
  }
};
