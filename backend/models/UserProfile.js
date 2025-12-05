const mongoose = require('mongoose');

const LearningPatternSchema = new mongoose.Schema({
  topic: String,
  frequency: { type: Number, default: 1 },
  lastAsked: { type: Date, default: Date.now }
});

const UserProfileSchema = new mongoose.Schema({
  accessCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalConversations: {
    type: Number,
    default: 0
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  learningPatterns: [LearningPatternSchema],
  commonTopics: [{
    topic: String,
    count: Number
  }],
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  metadata: {
    // Can store additional info like grade level, subjects, etc.
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
