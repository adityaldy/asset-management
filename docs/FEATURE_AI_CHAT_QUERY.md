# Feature Plan: AI Chat Query dengan Gemini 2.0 Flash

## 📋 Overview

Fitur ini memungkinkan user untuk melakukan query ke database asset menggunakan natural language melalui interface chat. Sistem akan menggunakan Gemini 2.0 Flash untuk:
1. Memahami pertanyaan user dalam bahasa natural
2. Mengkonversi pertanyaan menjadi SQL query yang aman
3. Mengeksekusi query dan mengembalikan hasil dalam format yang mudah dipahami

## 🎯 Objectives

- User dapat bertanya tentang data asset menggunakan bahasa natural (Indonesia/English)
- Sistem menghasilkan SQL query yang aman (read-only, parameterized)
- Hasil ditampilkan dalam format yang user-friendly
- Logging untuk audit trail query yang dijalankan

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │   Database      │
│   Chat UI       │────▶│   /api/chat     │────▶│   MySQL         │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Gemini 2.0     │
                        │  Flash API      │
                        └─────────────────┘
```

## 📊 Database Schema Context (untuk Gemini)

```sql
-- Tables yang bisa di-query:
-- 1. assets (id, uuid, name, asset_tag, serial_number, category_id, location_id, 
--           current_holder_id, status, purchase_date, price, specifications)
-- 2. categories (id, uuid, name, description)
-- 3. locations (id, uuid, name, address)
-- 4. users (id, uuid, name, email, role, department)
-- 5. transactions (id, uuid, asset_id, user_id, admin_id, action_type, 
--                  transaction_date, condition_status, notes)

-- Status values: 'available', 'assigned', 'repair', 'retired', 'missing'
-- Action types: 'checkout', 'checkin', 'repair', 'dispose', 'lost', 'found'
-- User roles: 'admin', 'staff', 'employee'
```

## 🔒 Security Considerations

1. **Read-Only Queries**: Hanya SELECT statements yang diizinkan
2. **Query Validation**: Validasi SQL sebelum eksekusi untuk mencegah:
   - INSERT, UPDATE, DELETE, DROP, TRUNCATE, ALTER
   - Multiple statements (;)
   - Comments yang bisa bypass validasi
3. **Rate Limiting**: Batasi jumlah query per user per menit
4. **Query Timeout**: Set timeout untuk mencegah long-running queries
5. **Result Limit**: Batasi jumlah rows yang dikembalikan (max 100)
6. **Audit Log**: Catat semua query yang dijalankan

## 📝 Implementation Tasks

### Phase 1: Backend Setup
- [ ] Install Google AI SDK (`@google/generative-ai`)
- [ ] Buat environment variable `GEMINI_API_KEY`
- [ ] Buat `ChatController.js` dengan endpoint `/api/chat/query`
- [ ] Buat `GeminiService.js` untuk interaksi dengan Gemini API
- [ ] Buat `QueryValidator.js` untuk validasi SQL query
- [ ] Buat `ChatRoute.js` dengan route definitions

### Phase 2: Gemini Integration
- [ ] Design system prompt dengan database schema context
- [ ] Implement natural language to SQL conversion
- [ ] Handle response parsing dan error handling
- [ ] Implement conversation history (optional)

### Phase 3: Query Execution
- [ ] Buat secure query executor dengan Sequelize raw query
- [ ] Implement query validation (whitelist approach)
- [ ] Add query timeout protection
- [ ] Add result formatting

### Phase 4: Frontend Chat UI
- [ ] Buat `ChatWidget.jsx` - floating chat button
- [ ] Buat `ChatWindow.jsx` - chat interface
- [ ] Buat `ChatMessage.jsx` - message bubble component
- [ ] Buat `ChatInput.jsx` - input dengan send button
- [ ] Buat `QueryResult.jsx` - display hasil query dalam tabel
- [ ] Implement chat state management
- [ ] Add loading states dan error handling

### Phase 5: Polish & Testing
- [ ] Unit tests untuk query validator
- [ ] Integration tests untuk chat endpoint
- [ ] E2E tests untuk chat flow
- [ ] Performance optimization
- [ ] Documentation

## 🎨 UI/UX Design

### Chat Widget (Floating Button)
```
┌─────────────────────────────────────────┐
│                                         │
│                        ┌───┐            │
│                        │💬│ ← Floating  │
│                        └───┘   button   │
└─────────────────────────────────────────┘
```

### Chat Window (Expanded)
```
┌─────────────────────────────────────────┐
│ 🤖 AI Asset Assistant              [X]  │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Berapa total asset laptop?       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 Total asset laptop: 3 unit       │ │
│ │                                     │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Name          │ Status          │ │ │
│ │ ├───────────────┼─────────────────┤ │ │
│ │ │ MacBook Pro   │ Available       │ │ │
│ │ │ Dell XPS 15   │ Available       │ │ │
│ │ │ ThinkPad X1   │ Assigned        │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ [Type your question...          ] [➤]   │
└─────────────────────────────────────────┘
```

## 💬 Example Queries

| Natural Language | Generated SQL |
|-----------------|---------------|
| "Berapa total asset?" | `SELECT COUNT(*) as total FROM assets` |
| "Asset apa saja yang statusnya available?" | `SELECT name, asset_tag, status FROM assets WHERE status = 'available'` |
| "Siapa yang sedang meminjam laptop?" | `SELECT u.name, a.name as asset_name FROM assets a JOIN users u ON a.current_holder_id = u.id WHERE a.status = 'assigned' AND a.category_id = (SELECT id FROM categories WHERE name LIKE '%laptop%')` |
| "Total nilai asset per kategori?" | `SELECT c.name as category, SUM(a.price) as total_value FROM assets a JOIN categories c ON a.category_id = c.id GROUP BY c.id` |
| "Asset yang dibeli bulan ini?" | `SELECT name, asset_tag, purchase_date, price FROM assets WHERE MONTH(purchase_date) = MONTH(CURRENT_DATE) AND YEAR(purchase_date) = YEAR(CURRENT_DATE)` |

## 🔧 API Specification

### POST /api/chat/query

**Request:**
```json
{
  "message": "Berapa total asset laptop yang available?",
  "conversationId": "optional-conversation-id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "answer": "Total asset laptop yang available adalah 2 unit.",
    "query": "SELECT COUNT(*) as total FROM assets a JOIN categories c ON a.category_id = c.id WHERE c.name LIKE '%laptop%' AND a.status = 'available'",
    "results": [
      { "total": 2 }
    ],
    "resultType": "count"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Maaf, saya tidak bisa memproses pertanyaan tersebut.",
  "error_code": "INVALID_QUERY"
}
```

## 📁 File Structure

```
backend/
├── controllers/
│   └── ChatController.js       # Chat endpoint handler
├── services/
│   └── GeminiService.js        # Gemini API integration
├── utils/
│   └── queryValidator.js       # SQL query validation
├── routes/
│   └── ChatRoute.js            # /api/chat routes

frontend/
├── components/
│   └── chat/
│       ├── ChatWidget.jsx      # Floating button
│       ├── ChatWindow.jsx      # Main chat container
│       ├── ChatMessage.jsx     # Message bubble
│       ├── ChatInput.jsx       # Input component
│       └── QueryResult.jsx     # Result table display
├── hooks/
│   └── useChat.js              # Chat state management
└── api/
    └── chat.js                 # Chat API calls
```

## ⏱️ Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 1-2 jam | Backend setup, environment |
| Phase 2 | 2-3 jam | Gemini integration, prompt engineering |
| Phase 3 | 1-2 jam | Query execution, validation |
| Phase 4 | 2-3 jam | Frontend chat UI |
| Phase 5 | 1-2 jam | Testing, polish |

**Total: ~8-12 jam**

## ✅ Acceptance Criteria

1. [ ] User dapat membuka chat widget dari halaman manapun
2. [ ] User dapat mengetik pertanyaan dalam bahasa Indonesia atau English
3. [ ] Sistem merespons dengan jawaban yang relevan dalam < 5 detik
4. [ ] Hasil query ditampilkan dalam format tabel jika applicable
5. [ ] Query yang tidak valid ditolak dengan pesan error yang jelas
6. [ ] Tidak ada query yang dapat memodifikasi data (INSERT/UPDATE/DELETE)
7. [ ] Chat history tersimpan selama session aktif

## 🚀 Getting Started

1. Dapatkan API Key dari Google AI Studio: https://aistudio.google.com/
2. Tambahkan ke `.env`: `GEMINI_API_KEY=your_api_key_here`
3. Ikuti implementation tasks secara berurutan

---

**Status: READY FOR IMPLEMENTATION**

Silakan review plan ini sebelum memulai coding.
