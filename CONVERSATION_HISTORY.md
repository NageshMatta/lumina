# Conversation History & Long-term Memory

Lumina now includes persistent conversation history and user profile tracking to maintain context across sessions and build a learning profile for each student.

## Features

### 1. Persistent Session Management
- Sessions persist across browser restarts
- Conversations maintain full context until "New Chat" is clicked
- Each student gets a unique session that follows them throughout their learning journey

### 2. Long-term Conversation Storage
- All conversations are saved to MongoDB
- History is preserved even after sessions end
- Up to 50 messages kept in context per conversation for better continuity

### 3. User Profiles
- Tracks total conversations and messages per student
- Builds learning patterns over time
- Records first seen and last active timestamps
- Extensible metadata for future enhancements (grade level, subjects, etc.)

## Setup

### MongoDB Configuration

1. **Create a MongoDB Atlas Account** (Free tier available)
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free cluster

2. **Get Your Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Add to Environment Variables**
   - On Railway: Settings → Variables → Add `MONGODB_URI`
   - Locally: Add to `.env` file: `MONGODB_URI=your-connection-string`

4. **Update Connection String**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/lumina?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your credentials

### Optional: Running Without MongoDB

The application works without MongoDB - it will simply use in-memory storage. However, conversations will be lost on server restart.

## API Endpoints

### Get Conversation History
```http
GET /api/history?limit=10&skip=0
Authorization: Bearer YOUR_ACCESS_CODE
```

Response:
```json
{
  "success": true,
  "conversations": [...],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

### Get User Profile
```http
GET /api/profile
Authorization: Bearer YOUR_ACCESS_CODE
```

Response:
```json
{
  "success": true,
  "profile": {
    "totalConversations": 15,
    "totalMessages": 234,
    "firstSeen": "2024-12-01T...",
    "lastActive": "2024-12-05T...",
    "learningPatterns": [],
    "commonTopics": []
  }
}
```

### Get Specific Conversation
```http
GET /api/conversation/:sessionId
Authorization: Bearer YOUR_ACCESS_CODE
```

## Database Schema

### Conversation
- `accessCode`: Student's access code
- `sessionId`: Unique session identifier
- `messages`: Array of {role, content, timestamp}
- `context`: Optional context text
- `startedAt`: When conversation began
- `lastActivity`: Last message timestamp
- `isActive`: Whether conversation is ongoing

### UserProfile
- `accessCode`: Student's access code (unique)
- `totalConversations`: Count of completed conversations
- `totalMessages`: Total messages exchanged
- `learningPatterns`: Array of topics and frequency
- `commonTopics`: Most discussed subjects
- `firstSeen`: When student first used Lumina
- `lastActive`: Most recent activity
- `metadata`: Extensible object for future data

## Future Enhancements

The conversation history system is designed to support:
- LLM training on student interactions
- Personalized tutoring based on learning patterns
- Progress tracking over time
- Topic mastery analysis
- Adaptive difficulty adjustment
- Long-term companion relationship with students

## Privacy & Security

- Conversations are associated with access codes, not personal information
- No personally identifiable information is collected
- Access codes should be kept private
- Consider data retention policies for your use case
- MongoDB connections are encrypted in transit
