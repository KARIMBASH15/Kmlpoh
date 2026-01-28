
import { GoogleGenAI, Type } from "@google/genai";
import { MaterialReport } from "../types";

// Fixed: Following SDK guidelines by initializing GoogleGenAI directly with process.env.API_KEY inside the function
export const getInventoryAnalysis = async (reports: MaterialReport[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = reports.map(r => ({
    name: r.name,
    stock: r.currentStock,
    unit: r.unit,
    in: r.totalIn,
    out: r.totalOut
  }));

  const prompt = `بصفتك خبير في إدارة المخازن، حلل بيانات المخزون التالية وقدم توصيات مختصرة باللغة العربية:
  ${JSON.stringify(dataSummary)}
  ركز على المواد التي قاربت على النفاد، المواد الراكدة، واقتراحات لتحسين الكفاءة.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    // Fixed: Property .text is used directly as per guidelines (not .text())
    return response.text || "لم يتم استلام رد من الذكاء الاصطناعي.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};
