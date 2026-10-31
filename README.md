# DEY WII ME — Visual Journal

A mobile-first, dark editorial photo journal. Visitors can browse; only an allowlisted admin can publish, edit or delete posts.

## What is included
- Public homepage with masonry and magazine layout switches
- Search and category filters
- Post detail overlay with narrative
- Admin sign-in, image upload, publish and delete
- Supabase database, storage and row-level security setup

## Setup (phone-friendly)

You will need free accounts on GitHub, Supabase and Vercel. Use your phone browser in desktop mode if a dashboard is difficult to navigate.

### 1. Create Supabase project
1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run all of `supabase/schema.sql`.
3. Open **Project Settings → API**. Copy the Project URL and anon/public key.
4. Open **Authentication → Users** and create your admin user with your email and a strong password.
5. Open that user and copy its UUID. In SQL Editor run:
   `insert into public.admin_users (user_id) values ('PASTE-USER-UUID-HERE');`

Do not put a service-role key in the website. Only use the anon/public key in the browser.

### 2. Put the code on GitHub
1. Create a new empty GitHub repository named `dey-wii-me`.
2. Upload the files and folders from this project, keeping the folder structure.
3. Make sure `.env.example` is not renamed to `.env.local`.

### 3. Deploy on Vercel
1. Sign in at https://vercel.com using GitHub.
2. Import your `dey-wii-me` repository.
3. Add these Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon/public key
4. Deploy. Vercel will provide a public website address.

### 4. Use the website
- Public site: open your Vercel URL.
- Admin: open `YOUR-VERCEL-URL/admin`.
- Sign in with the admin email/password you created.
- Choose a photo, add a title, category and narrative, then publish.

## Important security notes
- Public visitors can read posts and images.
- Only user IDs inserted into `public.admin_users` can publish or delete.
- Never share your admin password or Supabase service-role key.
- If you want to remove an admin later, delete their row from `public.admin_users`.

## Current first-build notes
- Sample photos are placeholders until you publish your own.
- This starter uses a public image bucket because posts are meant to be visible to everyone.
- Deleting a post removes its database record; the image file remains in storage for now. You can clean up unused images from Supabase Storage.
- For a production launch, add image size limits, stronger upload validation, and a custom domain.
