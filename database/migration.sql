-- Complete SQL migration for scheduling system
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  role text check (role in ('student','mentor')) default 'student',
  google_refresh_token text,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references users(id),
  mentor_id uuid references users(id),
  subject text,
  status text default 'pending',
  chosen_slot_id uuid,
  created_at timestamptz default now()
);

create table if not exists session_slots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  proposer_id uuid references users(id),
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  status text default 'open'
);

create table if not exists session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  google_event_id text,
  hangout_link text,
  created_at timestamptz default now()
);

create table if not exists session_messages (
  id bigserial primary key,
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references users(id),
  content text not null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table session_messages enable row level security;
alter table sessions enable row level security;

create policy "msg_insert_if_participant" on session_messages
  for insert using (
    auth.uid() = user_id and exists (
      select 1 from sessions s where s.id = session_messages.session_id 
      and (s.requester_id::text = auth.uid() or s.mentor_id::text = auth.uid())
    )
  );

create policy "msg_select_if_participant" on session_messages
  for select using (
    exists (
      select 1 from sessions s where s.id = session_messages.session_id
      and (s.requester_id::text = auth.uid() or s.mentor_id::text = auth.uid())
    )
  );

create policy "sessions_select_participant" on sessions
  for select using ((requester_id::text = auth.uid()) or (mentor_id::text = auth.uid()));

create index idx_session_slots_session on session_slots(session_id);
create index idx_messages_session on session_messages(session_id);