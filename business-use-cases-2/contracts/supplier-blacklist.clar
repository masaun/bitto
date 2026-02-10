(define-map blacklist principal {reason: (string-ascii 256), blacklisted-at: uint, blacklisted-by: principal})
(define-read-only (get-blacklist-entry (supplier principal)) (map-get? blacklist supplier))
(define-public (add-to-blacklist (supplier principal) (reason (string-ascii 256)))
  (begin
    (map-set blacklist supplier {reason: reason, blacklisted-at: stacks-block-height, blacklisted-by: tx-sender})
    (ok true)))
(define-read-only (is-blacklisted (supplier principal))
  (ok (is-some (map-get? blacklist supplier))))