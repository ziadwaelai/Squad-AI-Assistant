# Ninja Social Media AI Assistant - Project Description

## Project Overview
The Ninja Social Media AI Assistant is a Chrome extension with a client-server architecture designed to enhance social media engagement for Ninja delivery app in Saudi Arabia. The extension allows social media managers to quickly generate on-brand responses for comments, mentions, and direct messages on social platforms (particularly X/Twitter) using OpenAI's GPT-4.1 model.

## Business Value
- **Brand Consistency**: Ensures all social media responses maintain Ninja's Saudi youth-oriented voice and tone
- **Operational Efficiency**: Reduces response time for social media engagement by up to 80%
- **Enhanced Customer Experience**: Delivers quick, culturally relevant responses that resonate with the Saudi audience
- **Productivity Boost**: Social media managers can handle a higher volume of interactions with less effort

## Technical Architecture

### Client Side (Chrome Extension)
- **Frontend Interface**: User-friendly popup with toggles for:
  - Enabling/disabling the assistant
  - Fast Mode for instant text generation
  - DMS Mode to switch between direct message and mentions response styles
- **Content Script**: Monitors text selection on web pages and injects AI trigger button
- **Background Script**: Manages communication between the content scripts and the Flask backend server

### Server Side (Flask API)
- **Flask Application**: RESTful API endpoint that processes text and returns AI-generated responses
- **OpenAI Integration**: Uses GPT-4.1 model to generate contextually relevant responses
- **Response Templates**: Specialized templates for different communication scenarios (mentions vs. direct messages)

### Features
1. **Context-Aware Text Processing**: 
   - Text selected on social media platforms is sent to the AI for processing
   - System detects whether the text needs a DM or mention-style response

2. **Saudi Youth-Oriented Responses**: 
   - All responses are tailored for Saudi youth culture with appropriate slang and expressions
   - Maximum response length of 50 characters for quick, concise engagement
   - Consistent use of blue heart emoji (🩵) as part of brand identity

3. **Operational Modes**:
   - **Standard Mode**: Complete server processing and response generation
   - **Fast Mode**: Optimized for quicker response times with caching
   - **DM/Mentions Modes**: Different templates for direct messages vs. public comments

4. **Error Handling and Resilience**:
   - Robust error detection and reporting
   - Graceful degradation if server is unavailable
   - Clear user feedback for any processing issues

5. **Secure Communication**:
   - API key management through environment variables
   - Cross-Origin Resource Sharing (CORS) configuration for secure client-server interaction

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Flask
- **AI**: OpenAI GPT-4.1
- **Extension Framework**: Chrome Extension Manifest V3
- **Data Exchange**: JSON over HTTP
- **Security**: Environment variables for API key management

## Integration Points
- **Chrome Browser**: Extension integrates with active browser tabs
- **Social Media Platforms**: Works on any web-based social media interface
- **OpenAI API**: Server connects to OpenAI for text generation
- **Flask Server**: Hosted at configured endpoint for processing requests

## Deployment Requirements
- Flask server must be running at the configured endpoint (currently set to http://128.140.37.194:5005/process)
- OpenAI API key must be properly configured in environment variables
- Chrome browser with extension installed

## Future Enhancements
- Response analytics and performance tracking
- Additional language and dialect options
- Expanded template library for different social scenarios
- Automated sentiment analysis for more contextually appropriate responses
- Local AI model option for offline processing

This project significantly streamlines social media management for Ninja delivery app by providing instant, on-brand responses that maintain the company's distinct Saudi youth-oriented voice across all customer interactions.