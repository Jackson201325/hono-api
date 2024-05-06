CREATE VIEW event_gifts AS
SELECT
  COALESCE(g.id, og.id) AS id,
  COALESCE(g.name, og.name) AS name,
  COALESCE(g.description, og.description) AS description,
  COALESCE(g.price, og.price) AS price,
  COALESCE(g.image_url, og.image_url) AS image_url,
  COALESCE(g.is_default, og.is_default) AS is_default,
  COALESCE(g.category_id, og.category_id) AS category_id,
  COALESCE(g.event_id, og.event_id) AS event_id,
  COALESCE(g.giftlist_id, og.giftlist_id) AS giftlist_id,
  COALESCE(g.source_gift_id, og.source_gift_id) AS source_gift_id,
  COALESCE(g.wishlist_id, og.wishlist_id) AS wishlist_id
FROM
  gifts g
  LEFT JOIN gifts og ON g.source_gift_id = og.id
  JOIN events e ON g.event_id = e.id;
