(define-map insurance principal {insured: bool, coverage-amount: uint, verified-at: uint})
(define-read-only (get-insurance (supplier principal)) (map-get? insurance supplier))
(define-public (verify-insurance (supplier principal) (coverage uint))
  (begin
    (map-set insurance supplier {insured: true, coverage-amount: coverage, verified-at: stacks-block-height})
    (ok true)))