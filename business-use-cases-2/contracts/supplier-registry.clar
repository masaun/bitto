(define-map suppliers-reg principal {name: (string-ascii 128), verified: bool, registered-at: uint})
(define-read-only (get-supplier-reg (supplier principal)) (map-get? suppliers-reg supplier))
(define-public (register-supplier-entry (name (string-ascii 128)))
  (begin
    (map-set suppliers-reg tx-sender {name: name, verified: false, registered-at: stacks-block-height})
    (ok true)))