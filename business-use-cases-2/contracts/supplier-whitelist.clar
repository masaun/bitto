(define-map whitelist principal {approved-by: principal, approved-at: uint, category: (string-ascii 64)})
(define-read-only (get-whitelist-entry (supplier principal)) (map-get? whitelist supplier))
(define-public (add-to-whitelist (supplier principal) (category (string-ascii 64)))
  (begin
    (map-set whitelist supplier {approved-by: tx-sender, approved-at: stacks-block-height, category: category})
    (ok true)))