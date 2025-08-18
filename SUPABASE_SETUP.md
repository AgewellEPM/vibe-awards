# 🗄️ Supabase Database Setup for Vibe Awards

Follow these steps to connect your free Supabase database to the Vibe Awards platform.

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization (or create one)
4. Project details:
   - **Name**: `vibe-awards`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (includes 50MB database, 100MB storage)

## 🔑 Step 2: Get Your Credentials

After project creation (takes ~2 minutes):

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIs...` (long string)

## ⚙️ Step 3: Configure Your App

1. Open `/js/supabase-config.js`
2. Replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-actual-project-id.supabase.co', // ← Paste your URL here
    anonKey: 'your-actual-anon-key-here', // ← Paste your anon key here
};
```

## 🗃️ Step 4: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the entire `DATABASE_SCHEMA` from `/js/supabase-config.js`
3. Paste it into the SQL Editor
4. Click **Run** to create all tables and sample data

## ✅ Step 5: Test Connection

1. Open your Vibe Awards website
2. Open browser console (F12)
3. You should see: `🚀 Database connected successfully!`
4. Test features:
   - Chat rooms should load real messages
   - Nominations should save to database
   - Team posts should persist

## 🎯 Features Now Available

### 💬 **Live Chat System**
- Real-time chat messages stored in database
- Persistent chat history across sessions
- Multiple chat rooms with separate conversations

### 🏆 **AI Project Showcase**
- Submit and vote on AI projects
- Categorized project listings
- Tech stack tracking

### 📝 **Nomination System**
- Submit award nominations
- Track nomination status
- Admin review capabilities

### 🤝 **Team Collaboration**
- Post collaboration requests
- Skill-based matching
- Project timeline tracking

### 👥 **User Management**
- User profiles and avatars
- Activity tracking
- Reputation system

## 🔒 Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- **Public read access** is configured for demo purposes
- **Insert permissions** allow new submissions
- For production, customize security policies in Supabase

## 📊 Free Tier Limits

- **Database**: 50MB (sufficient for thousands of records)
- **Storage**: 100MB (for avatars and files)
- **API requests**: 50,000/month
- **Bandwidth**: 2GB/month

## 🆘 Troubleshooting

### Database Not Connecting?
1. Check your URL and anon key are correct
2. Ensure Supabase project is fully initialized
3. Check browser console for error messages

### Tables Not Created?
1. Verify SQL ran without errors in Supabase SQL Editor
2. Check **Table Editor** to see if tables exist
3. Re-run the schema if needed

### No Data Showing?
1. Check if sample data was inserted (see `chat_messages` table)
2. Verify RLS policies are correctly configured
3. Test with simple queries in Supabase

## 🚀 Ready to Go!

Once setup is complete, your Vibe Awards platform will have:
- ✅ Persistent data storage
- ✅ Real-time capabilities
- ✅ Scalable architecture
- ✅ Professional database backend

Your Apple-polished platform now has enterprise-grade data persistence! 🏆