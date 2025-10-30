# Lead Scoring API

A backend service that scores leads based on product/offer context and prospect data using rule-based logic combined with AI reasoning.

## Features

- ✅ Clean RESTful API design with proper error handling
- ✅ AI-powered lead scoring (OpenAI GPT-4o-mini OR Google Gemini)
- ✅ Rule-based scoring layer (role relevance, industry match, data completeness)
- ✅ CSV file upload and export functionality
- ✅ MongoDB for data persistence
- ✅ Docker support for easy deployment
- ✅ Comprehensive documentation

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB
- **AI**: OpenAI API or Google Gemini API
- **File Processing**: Multer, csv-parse
- **Containerization**: Docker

## Project Structure

```
lead-scoring-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (error handling, etc.)
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (scoring, AI integration)
│   ├── utils/           # Utility functions (logger, CSV parser)
│   └── server.js        # Application entry point
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── README.md           # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or use Docker)
- AI Provider API key (OpenAI or Google Gemini)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Kuvaka_Tech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/lead-scoring
   
   # AI Provider Configuration (use 'gemini' or 'openai')
   AI_PROVIDER=gemini
   
   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google Gemini Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Create Offer
Create a product/offer to use for lead scoring.

**POST** `/offer`

**Request Body:**
```json
{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings", "Automated personalization"],
  "ideal_use_cases": ["B2B SaaS mid-market", "Sales teams", "Marketing agencies"]
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "offer": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "AI Outreach Automation",
      "value_props": ["24/7 outreach", "6x more meetings"],
      "ideal_use_cases": ["B2B SaaS mid-market"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 2. Upload Leads (CSV)
Upload a CSV file with leads for scoring.

**POST** `/leads/upload`

**Request:** Multipart form data
- File field: `leads`

**CSV Format:**
```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS,San Francisco,10+ years in SaaS growth
John Doe,CEO,TechCorp,Technology,New York,Serial entrepreneur with 3 exits
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/leads/upload \
  -F "leads=@leads.csv"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "batchId": "batch_1705315800000_abc123",
    "leadsCount": 2,
    "invalidCount": 0,
    "leads": [...]
  }
}
```

#### 3. Score Leads
Run scoring on uploaded leads.

**POST** `/score`

**Request Body:**
```json
{
  "batchId": "batch_1705315800000_abc123"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{"batchId": "batch_1705315800000_abc123"}'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "batchId": "batch_1705315800000_abc123",
    "leadsCount": 2,
    "leads": [
      {
        "name": "Ava Patel",
        "role": "Head of Growth",
        "company": "FlowMetrics",
        "intent": "High",
        "score": 85,
        "reasoning": "Fits ICP SaaS mid-market and role is decision maker. Rule-based analysis: role relevance (20 pts), industry match (20 pts), data completeness (10 pts)"
      }
    ]
  }
}
```

#### 4. Get Results
Retrieve scoring results for a batch.

**GET** `/results?batchId=batch_1705315800000_abc123`

**Example (cURL):**
```bash
curl http://localhost:3000/api/results?batchId=batch_1705315800000_abc123
```

**Response:**
```json
{
  "status": "success",
  "count": 2,
  "data": {
    "leads": [
      {
        "name": "Ava Patel",
        "role": "Head of Growth",
        "company": "FlowMetrics",
        "intent": "High",
        "score": 85,
        "reasoning": "Fits ICP SaaS mid-market and role is decision maker..."
      }
    ]
  }
}
```

#### 5. Export Results (CSV)
Download results as CSV.

**GET** `/results/export?batchId=batch_1705315800000_abc123`

**Example (cURL):**
```bash
curl http://localhost:3000/api/results/export?batchId=batch_1705315800000_abc123 \
  -o results.csv
```

#### 6. Health Check
Check API health status.

**GET** `/health`

**Example (cURL):**
```bash
curl http://localhost:3000/api/health
```

## Scoring Logic

### Rule-Based Layer (Max 50 points)

1. **Role Relevance** (0, 10, or 20 points)
   - Decision makers (CEO, CTO, Director, Head, etc.): 20 points
   - Influencers (Manager, Lead, Senior, etc.): 10 points
   - Other roles: 0 points

2. **Industry Match** (0, 10, or 20 points)
   - Exact match with ideal use cases: 20 points
   - Adjacent industry match: 10 points
   - No match: 0 points

3. **Data Completeness** (0 or 10 points)
   - All required fields present: 10 points
   - Missing any required field: 0 points

### AI Layer (Max 50 points)

- Uses OpenAI GPT-4o-mini OR Google Gemini to analyze lead context against offer details
- **High** intent: 50 points
- **Medium** intent: 30 points
- **Low** intent: 10 points
- Configure which AI provider to use via `AI_PROVIDER` environment variable

### Final Score Calculation

```
Final Score = Rule Score + AI Score (0-100)
Intent Classification:
- High: 70-100
- Medium: 40-69
- Low: 0-39
```

## AI Prompt Used

The system sends the following prompt to the selected AI provider (OpenAI or Gemini):

```
Analyze this lead for the following product offering:

PRODUCT: [product name]
VALUE PROPOSITIONS: [value props]
IDEAL USE CASES: [ideal use cases]

LEAD INFORMATION:
- Name: [name]
- Role: [role]
- Company: [company]
- Industry: [industry]
- Location: [location]
- LinkedIn Bio: [bio]

Task: Classify the buying intent as High, Medium, or Low and provide a brief reasoning (1-2 sentences).

Respond in this exact format:
INTENT: [High/Medium/Low]
REASONING: [your brief explanation]
```

## Testing the API

### Using cURL

Save the sample CSV as `leads.csv`:

```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS,San Francisco,10+ years in SaaS growth
John Doe,CEO,TechCorp,Technology,New York,Serial entrepreneur with 3 exits
Sarah Smith,Sales Manager,CloudSoft,SaaS,Austin,Texas,Tech sales professional
```

**Complete workflow:**

```bash
# 1. Create offer
curl -X POST http://localhost:3000/api/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'

# 2. Upload leads (note: save response batchId)
curl -X POST http://localhost:3000/api/leads/upload -F "leads=@leads.csv"

# 3. Score leads (use batchId from step 2)
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{"batchId": "YOUR_BATCH_ID"}'

# 4. Get results (use batchId from step 2)
curl "http://localhost:3000/api/results?batchId=YOUR_BATCH_ID"

# 5. Export results as CSV
curl "http://localhost:3000/api/results/export?batchId=YOUR_BATCH_ID" -o results.csv
```

### Using Postman

Import the collection and environment files (if available), or manually create requests for each endpoint.



## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `AI_PROVIDER` | AI provider to use (gemini/openai) | No | gemini |
| `OPENAI_API_KEY` | OpenAI API key | Conditional* | - |
| `GEMINI_API_KEY` | Google Gemini API key | Conditional* | - |
| `CORS_ORIGIN` | Allowed CORS origin | No | * |

\* At least one AI provider API key is required

## Error Handling

The API uses standardized error responses:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error


