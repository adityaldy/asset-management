import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI - will be initialized lazily
let genAI = null;

const getGenAI = () => {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("Initializing Gemini with API key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
};

// Database schema context for Gemini
const DATABASE_SCHEMA = `
Database Schema untuk IT Asset Management System (MySQL dengan Sequelize):

=== TABLES ===

1. users (Pengguna sistem)
   - id: INTEGER PRIMARY KEY AUTO_INCREMENT
   - uuid: UUID UNIQUE
   - name: VARCHAR(100) NOT NULL
   - email: VARCHAR(100) UNIQUE NOT NULL
   - password: VARCHAR(255) (null untuk employee)
   - role: ENUM('admin', 'staff', 'employee') DEFAULT 'employee'
   - department: VARCHAR(100)
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

2. categories (Kategori aset)
   - id: INTEGER PRIMARY KEY AUTO_INCREMENT
   - uuid: UUID UNIQUE
   - name: VARCHAR(100) UNIQUE NOT NULL
   - description: TEXT
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

3. locations (Lokasi aset)
   - id: INTEGER PRIMARY KEY AUTO_INCREMENT
   - uuid: UUID UNIQUE
   - name: VARCHAR(100) UNIQUE NOT NULL
   - address: TEXT
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

4. assets (Data aset IT)
   - id: INTEGER PRIMARY KEY AUTO_INCREMENT
   - uuid: UUID UNIQUE
   - name: VARCHAR(150) NOT NULL
   - asset_tag: VARCHAR(50) UNIQUE NOT NULL (contoh: AST-001)
   - serial_number: VARCHAR(100) UNIQUE NOT NULL
   - category_id: INTEGER FOREIGN KEY -> categories.id
   - location_id: INTEGER FOREIGN KEY -> locations.id
   - current_holder_id: INTEGER FOREIGN KEY -> users.id (nullable)
   - status: ENUM('available', 'assigned', 'repair', 'retired', 'missing')
   - purchase_date: DATE NOT NULL
   - price: DECIMAL(15,2) DEFAULT 0.00
   - specifications: JSON (contoh: {"RAM": "16GB", "Storage": "512GB"})
   - notes: TEXT
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

5. transactions (Riwayat transaksi aset)
   - id: INTEGER PRIMARY KEY AUTO_INCREMENT
   - uuid: UUID UNIQUE
   - asset_id: INTEGER FOREIGN KEY -> assets.id
   - user_id: INTEGER FOREIGN KEY -> users.id (nullable, employee)
   - admin_id: INTEGER FOREIGN KEY -> users.id (admin yang memproses)
   - action_type: ENUM('checkout', 'checkin', 'repair', 'complete_repair', 'dispose', 'lost', 'found')
   - transaction_date: DATETIME DEFAULT NOW()
   - condition_status: VARCHAR(50) (Good, Damaged, Lost, dll)
   - notes: TEXT
   - created_at: TIMESTAMP

=== RELASI ===
- categories.id -> assets.category_id (ONE to MANY)
- locations.id -> assets.location_id (ONE to MANY)
- users.id -> assets.current_holder_id (ONE to MANY)
- assets.id -> transactions.asset_id (ONE to MANY)
- users.id -> transactions.user_id (ONE to MANY, employee)
- users.id -> transactions.admin_id (ONE to MANY, admin)

=== CONTOH QUERY UMUM ===
- Hitung total aset: SELECT COUNT(*) FROM assets
- Aset per status: SELECT status, COUNT(*) as count FROM assets GROUP BY status
- Aset per kategori: SELECT c.name, COUNT(a.id) as count FROM categories c LEFT JOIN assets a ON c.id = a.category_id GROUP BY c.id
- Total nilai aset: SELECT SUM(price) FROM assets
- Aset yang di-assign ke user: SELECT a.*, u.name as holder_name FROM assets a JOIN users u ON a.current_holder_id = u.id WHERE a.status = 'assigned'
`;

// System instruction for Gemini
const SYSTEM_INSTRUCTION = `
Kamu adalah Asisten AI yang ramah untuk IT Asset Management System. Nama kamu "Asset Buddy".

ATURAN FORMAT RESPONSE - SANGAT PENTING:
- SELALU jawab HANYA dengan JSON murni, tanpa teks tambahan apapun
- JANGAN bungkus JSON dengan markdown code block
- Response harus langsung dimulai dengan { dan diakhiri dengan }

KEPRIBADIAN:
- Gunakan bahasa casual, friendly, dan mudah dipahami
- Boleh pakai emoji sesekali 😊
- Variasikan cara menjelaskan

ATURAN QUERY:
1. HANYA jawab pertanyaan seputar IT Asset Management (aset, kategori, lokasi, user, transaksi)
2. Untuk pertanyaan yang butuh data, buatkan SQL SELECT query yang aman
3. JANGAN PERNAH buat query INSERT, UPDATE, DELETE, DROP, TRUNCATE, ALTER, CREATE
4. Gunakan alias kolom yang mudah dibaca
5. Batasi hasil dengan LIMIT 100 kalau tidak diminta spesifik
6. Kalau pertanyaan di luar konteks aset, tolak dengan ramah

FORMAT RESPONSE (pilih salah satu):

Untuk query database - PENTING: field "answer" harus berisi TEMPLATE jawaban dengan placeholder {{hasil}} yang akan diisi dengan data dari query:
{"type":"query","sql":"SELECT COUNT(*) as total FROM assets","answer":"Total aset yang tercatat saat ini ada {{hasil}} unit! 📦"}

Contoh lain:
- Pertanyaan: "aset paling mahal apa?"
  {"type":"query","sql":"SELECT name, price FROM assets ORDER BY price DESC LIMIT 1","answer":"Aset paling mahal adalah {{name}} dengan harga {{price}}! 💰"}

- Pertanyaan: "ada berapa laptop?"
  {"type":"query","sql":"SELECT COUNT(*) as jumlah FROM assets a JOIN categories c ON a.category_id = c.id WHERE c.name LIKE '%laptop%'","answer":"Jumlah laptop yang tercatat ada {{jumlah}} unit! 💻"}

- Pertanyaan: "siapa yang pegang aset terbanyak?"
  {"type":"query","sql":"SELECT u.name, COUNT(a.id) as total FROM users u JOIN assets a ON u.id = a.current_holder_id GROUP BY u.id ORDER BY total DESC LIMIT 1","answer":"{{name}} memegang aset terbanyak yaitu {{total}} unit! 🏆"}

Untuk sapaan/terima kasih/pertanyaan umum sistem:
{"type":"text","message":"Jawaban casual dan ramah 👋"}

Untuk pertanyaan di luar konteks:
{"type":"error","message":"Penolakan ramah, arahkan ke topik aset 😅"}

INGAT: 
- Response HARUS JSON murni tanpa teks tambahan!
- Untuk type "query", WAJIB ada field "answer" dengan template jawaban yang menggunakan placeholder sesuai alias kolom di SQL
`;

/**
 * Generate response from Gemini AI
 * @param {string} userMessage - User's question in natural language
 * @returns {Promise<object>} - AI response with type and content
 */
export const generateChatResponse = async (userMessage) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("GEMINI_API_KEY available:", !!apiKey);
        
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const ai = getGenAI();
        const model = ai.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.5,      // Balance antara kreatif dan patuh format
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        });

        const prompt = `
${DATABASE_SCHEMA}

Pertanyaan User: ${userMessage}

Berikan response dalam format JSON sesuai aturan yang telah ditentukan.
`;

        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response received:", text.substring(0, 100) + "...");

        // Parse JSON response
        try {
            // Clean the response (remove markdown code blocks if any)
            let cleanedText = text.trim();
            if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText.slice(7);
            }
            if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.slice(3);
            }
            if (cleanedText.endsWith("```")) {
                cleanedText = cleanedText.slice(0, -3);
            }
            cleanedText = cleanedText.trim();

            const parsedResponse = JSON.parse(cleanedText);
            return parsedResponse;
        } catch (parseError) {
            // If JSON parsing fails, return as text response
            return {
                type: "text",
                message: text
            };
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

/**
 * Validate SQL query for safety
 * @param {string} sql - SQL query to validate
 * @returns {object} - Validation result
 */
export const validateSQLQuery = (sql) => {
    const forbiddenKeywords = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 
        'ALTER', 'CREATE', 'GRANT', 'REVOKE', 'EXEC',
        'EXECUTE', 'UNION', '--', ';--', '/*', '*/',
        'xp_', 'sp_', 'INTO OUTFILE', 'LOAD_FILE'
    ];

    const upperSQL = sql.toUpperCase();
    
    // Check for forbidden keywords
    for (const keyword of forbiddenKeywords) {
        if (upperSQL.includes(keyword)) {
            // Allow UNION in SELECT context (but not UNION-based injection)
            if (keyword === 'UNION' && !upperSQL.includes('UNION SELECT')) {
                continue;
            }
            return {
                isValid: false,
                reason: `Query contains forbidden keyword: ${keyword}`
            };
        }
    }

    // Must start with SELECT
    const trimmedSQL = sql.trim().toUpperCase();
    if (!trimmedSQL.startsWith('SELECT')) {
        return {
            isValid: false,
            reason: "Only SELECT queries are allowed"
        };
    }

    // Check for multiple statements
    const statementCount = sql.split(';').filter(s => s.trim().length > 0).length;
    if (statementCount > 1) {
        return {
            isValid: false,
            reason: "Multiple statements are not allowed"
        };
    }

    return {
        isValid: true,
        reason: null
    };
};

export default {
    generateChatResponse,
    validateSQLQuery
};
