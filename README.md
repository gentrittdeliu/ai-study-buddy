# AI Study Buddy

AI Study Buddy is a web application built with Next.js and Supabase.  
The app helps students generate explanations, summaries, quizzes, and flashcards using AI.

## Features

- User signup
- User login
- User logout
- Protected routes
- AI response generation
- Explain mode
- Summary mode
- Quiz mode
- Flashcards mode
- Chat history saved in Supabase
- Conversations table
- Messages table
- Row Level Security policies
- OpenAI integration
- Fallback AI response when OpenAI quota or billing is not active
- Loading state
- Error handling
- Offline detection
- Retry button
- Timeout handling

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Database
- OpenAI API

## Project Structure

```txt
src/app/page.tsx
src/app/auth/page.tsx
src/app/api/chat/route.ts
lib/supabaseClient.ts
lib/database.ts
README.md