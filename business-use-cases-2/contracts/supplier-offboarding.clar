(define-map offboarded principal {reason: (string-ascii 256), offboarded-at: uint, final-payment: uint})
(define-read-only (get-offboarding (supplier principal)) (map-get? offboarded supplier))
(define-public (offboard-supplier (supplier principal) (reason (string-ascii 256)) (payment uint))
  (begin
    (map-set offboarded supplier {reason: reason, offboarded-at: stacks-block-height, final-payment: payment})
    (ok true)))