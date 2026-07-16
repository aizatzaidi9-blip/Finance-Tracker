create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  currency text not null default 'MYR',
  timezone text not null default 'Asia/Kuala_Lumpur',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  daily_balance numeric(14,2) not null default 0 check (daily_balance >= 0),
  savings_balance numeric(14,2) not null default 0 check (savings_balance >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  icon text not null,
  colour text not null,
  is_default boolean not null default false,
  is_favourite boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  destination text not null check (destination in ('daily','savings','split')),
  total_amount numeric(14,2) not null check (total_amount > 0),
  daily_amount numeric(14,2) not null default 0 check (daily_amount >= 0),
  savings_amount numeric(14,2) not null default 0 check (savings_amount >= 0),
  category_id uuid references public.categories(id),
  note text check (char_length(note) <= 200),
  transaction_date date not null,
  transaction_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint split_amounts_match check (
    (type = 'income' and destination = 'split' and daily_amount + savings_amount = total_amount)
    or (type = 'income' and destination = 'daily' and daily_amount = total_amount and savings_amount = 0)
    or (type = 'income' and destination = 'savings' and savings_amount = total_amount and daily_amount = 0)
    or (type = 'expense' and destination in ('daily','savings') and daily_amount + savings_amount = total_amount)
  ),
  constraint no_expense_split check (not (type = 'expense' and destination = 'split'))
);

create index if not exists profiles_id_idx on public.profiles(id);
create index if not exists balances_user_id_idx on public.balances(user_id);
create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_transaction_date_idx on public.transactions(transaction_date);
create index if not exists transactions_type_idx on public.transactions(type);
create index if not exists transactions_category_id_idx on public.transactions(category_id);

alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

create policy "balances_select_own" on public.balances for select using (auth.uid() = user_id);
create policy "balances_insert_own" on public.balances for insert with check (auth.uid() = user_id);
create policy "balances_update_own" on public.balances for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "balances_delete_own" on public.balances for delete using (auth.uid() = user_id);

create policy "categories_select_own_or_default" on public.categories for select using (user_id is null or auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.balances (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.ensure_own_category(p_category_id uuid, p_type text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.categories
    where id = p_category_id
      and type = p_type
      and is_archived = false
      and (user_id is null or user_id = auth.uid())
  );
$$;

create or replace function public.create_finance_transaction(
  p_type text,
  p_destination text,
  p_total_amount numeric,
  p_daily_amount numeric,
  p_savings_amount numeric,
  p_category_id uuid,
  p_note text,
  p_transaction_date date,
  p_transaction_time time
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction_id uuid;
  v_daily numeric(14,2);
  v_savings numeric(14,2);
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_type not in ('income', 'expense') then
    raise exception 'Invalid transaction type';
  end if;

  if p_destination not in ('daily', 'savings', 'split') then
    raise exception 'Invalid destination';
  end if;

  if p_type = 'expense' and p_destination = 'split' then
    raise exception 'Duit Keluar cannot use split destination';
  end if;

  if p_total_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  if not public.ensure_own_category(p_category_id, p_type) then
    raise exception 'Invalid category';
  end if;

  select daily_balance, savings_balance
  into v_daily, v_savings
  from public.balances
  where user_id = v_user_id
  for update;

  if not found then
    insert into public.balances (user_id) values (v_user_id)
    returning daily_balance, savings_balance into v_daily, v_savings;
  end if;

  if p_type = 'income' then
    if p_destination = 'daily' then
      p_daily_amount := p_total_amount;
      p_savings_amount := 0;
    elsif p_destination = 'savings' then
      p_daily_amount := 0;
      p_savings_amount := p_total_amount;
    elsif round(p_daily_amount + p_savings_amount, 2) <> round(p_total_amount, 2) then
      raise exception 'Split amounts must equal total';
    end if;

    update public.balances
    set daily_balance = daily_balance + p_daily_amount,
        savings_balance = savings_balance + p_savings_amount,
        updated_at = now()
    where user_id = v_user_id;
  else
    if p_destination = 'daily' then
      if v_daily < p_total_amount then raise exception 'Baki Harian tidak mencukupi'; end if;
      p_daily_amount := p_total_amount;
      p_savings_amount := 0;
      update public.balances set daily_balance = daily_balance - p_total_amount, updated_at = now() where user_id = v_user_id;
    else
      if v_savings < p_total_amount then raise exception 'Baki Simpanan tidak mencukupi'; end if;
      p_daily_amount := 0;
      p_savings_amount := p_total_amount;
      update public.balances set savings_balance = savings_balance - p_total_amount, updated_at = now() where user_id = v_user_id;
    end if;
  end if;

  insert into public.transactions (
    user_id, type, destination, total_amount, daily_amount, savings_amount,
    category_id, note, transaction_date, transaction_time
  )
  values (
    v_user_id, p_type, p_destination, p_total_amount, p_daily_amount, p_savings_amount,
    p_category_id, p_note, p_transaction_date, p_transaction_time
  )
  returning id into v_transaction_id;

  return v_transaction_id;
end;
$$;

create or replace function public.delete_finance_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.transactions%rowtype;
begin
  select * into v_tx from public.transactions where id = p_transaction_id and user_id = auth.uid() for update;
  if not found then raise exception 'Transaction not found'; end if;

  if v_tx.type = 'income' then
    update public.balances
    set daily_balance = daily_balance - v_tx.daily_amount,
        savings_balance = savings_balance - v_tx.savings_amount,
        updated_at = now()
    where user_id = auth.uid()
      and daily_balance >= v_tx.daily_amount
      and savings_balance >= v_tx.savings_amount;
  elsif v_tx.destination = 'daily' then
    update public.balances set daily_balance = daily_balance + v_tx.total_amount, updated_at = now() where user_id = auth.uid();
  else
    update public.balances set savings_balance = savings_balance + v_tx.total_amount, updated_at = now() where user_id = auth.uid();
  end if;

  delete from public.transactions where id = p_transaction_id and user_id = auth.uid();
end;
$$;
