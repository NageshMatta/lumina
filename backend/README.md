# Lumina Backend

Express.js server that handles Claude API communication for the Lumina extension.

## Quick Deploy to Railway

1. Fork/push this repo to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repo
5. Add environment variables:

```
CLAUDE_API_KEY=sk-ant-api03-your-key-here
ACCESS_CODES=LUMINA2024,CODE2,CODE3
```

6. Deploy! Railway will give you a URL like `https://lumina-production.up.railway.app`

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

## API Endpoints

### `GET /`
Health check. Returns server status.

### `POST /api/verify`
Verify an access code.
```json
{
  "accessCode": "LUMINA2024"
}
```

### `POST /api/chat`
Send a message to Lumina.
```
Authorization: Bearer ACCESS_CODE
```
```json
{
  "message": "How do I solve 2x + 5 = 13?",
  "sessionId": "unique-session-id",
  "context": "optional highlighted text"
}
```

### `POST /api/clear`
Clear conversation history.
```
Authorization: Bearer ACCESS_CODE
```
```json
{
  "sessionId": "unique-session-id"
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_API_KEY` | Yes | Your Anthropic API key |
| `ACCESS_CODES` | Yes | Comma-separated list of valid codes |
| `PORT` | No | Server port (default: 3000) |

## Rate Limiting

- 60 requests per minute per IP address
- Returns 429 error when exceeded

## Security Features

- Helmet.js for HTTP headers
- CORS enabled
- Rate limiting
- Access code validation
- No API key exposed to clients

## Customizing the Tutor

Edit the `SYSTEM_PROMPT` constant in `server.js` to customize:
- Tutoring style
- Subject expertise
- Response length
- Age-appropriate language

## Production Checklist

- [ ] Set strong, unique access codes
- [ ] Monitor API usage in Anthropic console
- [ ] Set up error alerting
- [ ] Consider adding a database for conversation persistence
- [ ] Add logging for debugging
