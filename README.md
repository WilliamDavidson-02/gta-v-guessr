# ![GTAV](./public/gta-v-icon.svg) GTA V Guessr

This is a geo guesser type web game based on the gta 5 map. It as a single and multiplayer game mode with a maximum of 2 people. A game creation menu where the user can pick location (e.g. city, sandy shore or all), difficulty easy, medium or hard which effects locations and point scoring and for multiplayer you can set a name and password for the game.

Users have a settings page where they can upload a profile image and also change username and password

For users with a role of admin they can access a map builder where they can execute CRUD operations for locations.

### Tech

The client side is built with react + vite and typescript and for storing data, images and realtime implementation it uses supabase, last but not least nodejs and express for a small api that hashes and verify's the password set for multiplayer games.

The gta 5 map files are in a format of tiles which allows for 5 levels of zoom and still remain a high resolution of the map then a simple zoomed in image. For this to work it is displayed with [`react leaflet`](https://react-leaflet.js.org/) components which provides bindings between react and [`leaflet.js`](https://leafletjs.com)

### Setup

Install project

```bash
git clone https://github.com/WilliamDavidson-02/gta-v-guessr.git
cd gta-v-guessr
npm i
```

**Supabase** for storage and authentication, please set up a new supabase project and insert the **_key_** and **_url_** in your .env file you could user the `.example.env` for this.

Create tables and create your RLS policy and two public storage buckets named image_views and avatar (upload a image named default-avatar.svg for a default profile image).

```sql
create table profiles (
    id uuid primary key not null,
    username text unique,
    avatar_url text not null default '/avatar-default.svg',
    access_role text not null default 'player',
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint username_length check ((char_length(username) >= 3))
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table locations (
    id uuid primary key not null default gen_random_uuid (),
    lat double precision not null,
    lng double precision not null,
    image_path text not null unique,
    level text not null,
    region text,
);

create view random_location as select * from locations order by random();

create table games (
    id uuid primary key not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    level text not null,
    region text not null,
    is_multiplayer boolean not null default false,
    started_at timestamp with time zone,
    name text,
    password text,
    ended_at timestamp with time zone,
  );

create trigger add_user_on_game_creation
    after insert on games for each row
    execute function handle_user_game ();

create table game_location (
    game_id uuid primary key not null,
    location_id uuid primary key not null,
    created_at timestamp with time zone not null default now(),
    constraint game_location_game_id_fkey foreign key (game_id) references games (id) on delete cascade,
    constraint game_location_location_id_fkey foreign key (location_id) references locations (id) on delete cascade
);

create table user_game (
    user_id uuid primary key not null default auth.uid (),
    game_id uuid primary key not null,
    joined_at timestamp with time zone not null default now(),
    constraint user_game_game_id_fkey foreign key (game_id) references games (id) on delete cascade,
    constraint user_game_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
);

create table guesses (
    id uuid primary key not null default gen_random_uuid (),
    user_id uuid not null default auth.uid (),
    game_id uuid not null,
    location_id uuid not null,
    lat double precision,
    lng double precision,
    points bigint,
    created_at timestamp with time zone not null default now(),
    constraint guesses_game_id_fkey foreign key (game_id) references games (id) on delete cascade,
    constraint guesses_location_id_fkey foreign key (location_id) references locations (id) on delete cascade,
    constraint guesses_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
);

CREATE OR REPLACE FUNCTION public.get_player_users(game_ids uuid[])
RETURNS TABLE(game_id uuid, user_ids uuid[]) AS $$
BEGIN
  RETURN QUERY
  SELECT user_game.game_id, array_agg(user_game.user_id)
  FROM user_game
  WHERE user_game.game_id = ANY(game_ids)
  GROUP BY user_game.game_id;
END; $$
LANGUAGE plpgsql;
```
