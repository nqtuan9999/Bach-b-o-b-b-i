import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, AppSettings } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model constants
const FLASH_MODEL = 'gemini-2.5-flash';

const getSystemInstruction = (settings: AppSettings, context: string) => {
  // Instruction for Language
  const langInstruction = `LUÔN LUÔN trả lời bằng ngôn ngữ: ${settings.language}.`;
  
  // Knowledge Base Updates (Context Injection)
  const knowledgeBase = `
    CẬP NHẬT KIẾN THỨC MỚI NHẤT VỀ BẾN THÀNH (2024-2025):
    1. Tuyến Metro số 1 (Bến Thành - Suối Tiên): Ga ngầm Bến Thành là ga trung tâm quan trọng nhất, kiến trúc giếng trời lấy sáng tự nhiên (Toplight) hình hoa sen rất đẹp.
    2. Đường Lê Lợi: Đã tháo dỡ rào chắn, trở thành đại lộ khang trang, kết nối chợ Bến Thành và Nhà hát lớn. Sự đối lập giữa hàng rong vỉa hè (bánh tráng trộn, cà phê bệt) và các cửa hàng hiệu xa xỉ (Gucci, Chanel) ở các tòa nhà gần đó.
    3. Kinh tế đêm: Nhấn mạnh vào Chợ đêm Bến Thành và khu phố ẩm thực, quán bar/pub xung quanh khu vực Lý Tự Trọng, Pasteur.
    4. Giá trị lịch sử: Chợ Bến Thành không chỉ là nơi buôn bán mà là chứng nhân lịch sử, từng chứng kiến nhiều cuộc biểu tình và thay đổi chế độ.
    5. So sánh giá cả: Ngày xưa 1 đồng mua được tô phở, giờ 50.000 - 100.000 VNĐ.
  `;

  // Persona "Chú Ba Bến Thành"
  const persona = `
    Bạn là "Chú Ba Bến Thành" - một người dân gốc Sài Gòn, sống ở phường Bến Thành hơn 60 năm.
    - Tính cách: Hào sảng, vui vẻ, hay kể chuyện ngày xưa ("Hồi đó...", "Chú nhớ là...").
    - Kiến thức: Am hiểu tường tận từ hẻm nhỏ đến đại lộ, từ bà bán xôi đến giám đốc ngân hàng.
    - Phong cách: Dùng từ ngữ thân thiện, đậm chất Nam Bộ nhưng vẫn lịch sự. 
    ${context}
  `;

  return `${persona} ${knowledgeBase} ${langInstruction}`;
};

// Generate detailed info about a topic
export const generateTopicContent = async (topicName: string, settings: AppSettings): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Hãy kể cho cháu nghe về "${topicName}" đi chú Ba.
      Cấu trúc: 
      1. Lời chào của chú Ba.
      2. Kể về ngày xưa (Lịch sử/Ký ức).
      3. So sánh với bây giờ (Kinh tế/Hiện đại).
      4. Một bí mật nhỏ hoặc lời khuyên khi đến đây.
      Giới hạn 250 từ. Định dạng Markdown đẹp mắt.`,
      config: {
        systemInstruction: getSystemInstruction(settings, "Bạn là Chú Ba Bến Thành đang kể chuyện cho con cháu."),
      }
    });
    return response.text || "Chú đang nhớ lại chút, mạng hơi lag con đợi xíu nha...";
  } catch (error) {
    console.error("Error generating content:", error);
    return "Mạng mẽo chán quá con ơi, chú không tải được hình ảnh ký ức rồi.";
  }
};

// Generate a quiz based on a topic
export const generateQuizForTopic = async (topicName: string, settings: AppSettings): Promise<QuizQuestion[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: `Câu hỏi trắc nghiệm dưới giọng văn của Chú Ba.` },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: `Danh sách 4 lựa chọn.` 
        },
        correctAnswer: { type: Type.INTEGER, description: "Chỉ số của câu trả lời đúng (0-3)" },
        explanation: { type: Type.STRING, description: `Chú Ba giải thích tại sao đúng, kèm theo một mẩu chuyện vui.` }
      },
      required: ["question", "options", "correctAnswer", "explanation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Đố vui về "${topicName}" (Phường Bến Thành). Tạo 3 câu hỏi.
      1. Một câu về lịch sử (Ngày xưa nó ra sao?).
      2. Một câu về kinh tế/đời sống (Giá đất, buôn bán, món ăn).
      3. Một câu tình huống (Ví dụ: Nếu con đi lạc ở cửa Bắc...).
      Độ khó: Lớp ${settings.gradeLevel}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getSystemInstruction(settings, "Bạn là Chú Ba Bến Thành thích đố vui."),
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

// Chat with the guide
export const chatWithGuideStream = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  settings: AppSettings
) => {
  const chat = ai.chats.create({
    model: FLASH_MODEL,
    history: history,
    config: {
      systemInstruction: getSystemInstruction(settings, "Bạn là Chú Ba Bến Thành."),
    }
  });

  return await chat.sendMessageStream({ message });
};