ALTER TABLE gifts
ADD CONSTRAINT chk_is_default_source_gift_id CHECK (
  (
    is_default = false
    AND source_gift_id IS NOT NULL
  )
  OR (
    is_default = true
    AND source_gift_id IS NULL
  )
);
