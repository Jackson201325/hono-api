CREATE MATERIALIZED VIEW event_gifts AS
SELECT
  g.id AS gift_id,
  g.name AS gift_name,
  g.description AS gift_description,
  og.id AS original_gift_id,
  og.name AS original_gift_name,
  og.description AS original_gift_description,
  e.id AS event_id,
  e.primary_user_id,
  e.secondary_user_id
FROM
  gifts g
  LEFT JOIN gifts og ON g.source_gift_id = og.id
  JOIN events e ON g.event_id = e.id;

create
or replace function refresh_event_gifts_view_on_specific_gifts () returns trigger as $$
BEGIN
  IF NEW.is_default = false THEN
    REFRESH MATERIALIZED VIEW event_gifts;
  END IF;
  RETURN NULL;
END;
$$ language plpgsql;

CREATE TRIGGER refresh_event_gifts_on_insert_on_specific_gifts
AFTER INSERT ON gifts FOR EACH ROW
EXECUTE FUNCTION refresh_event_gifts_view_on_specific_gifts ();

CREATE TRIGGER refresh_event_gifts_on_update_on_specific_gifts
AFTER
UPDATE ON gifts FOR EACH ROW
EXECUTE FUNCTION refresh_event_gifts_view_on_specific_gifts ();
