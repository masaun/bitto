(define-map sanctions principal {sanctioned: bool, checked-at: uint, checked-by: principal})
(define-read-only (get-sanction-status (supplier principal)) (map-get? sanctions supplier))
(define-public (check-sanctions (supplier principal) (sanctioned bool))
  (begin
    (map-set sanctions supplier {sanctioned: sanctioned, checked-at: stacks-block-height, checked-by: tx-sender})
    (ok true)))