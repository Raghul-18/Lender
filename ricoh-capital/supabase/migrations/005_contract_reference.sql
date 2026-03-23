-- Auto-generate contract reference numbers (e.g. CON-2026-A3F9K2)
create or replace function generate_contract_reference()
returns trigger language plpgsql as $$
begin
  if new.reference_number is null or new.reference_number = '' then
    new.reference_number :=
      'CON-' || to_char(now(), 'YYYY') || '-' ||
      upper(substring(md5(gen_random_uuid()::text) from 1 for 6));
  end if;
  return new;
end;
$$;

drop trigger if exists set_contract_reference on public.contracts;
create trigger set_contract_reference
  before insert on public.contracts
  for each row
  execute function generate_contract_reference();
