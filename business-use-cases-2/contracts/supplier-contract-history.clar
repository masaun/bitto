(define-map contract-history {supplier: principal, contract-id: uint} {value: uint, completed: bool, completion-date: uint})
(define-read-only (get-contract-history (supplier principal) (contract-id uint))
  (map-get? contract-history {supplier: supplier, contract-id: contract-id}))
(define-public (record-contract (supplier principal) (contract-id uint) (value uint))
  (begin
    (map-set contract-history {supplier: supplier, contract-id: contract-id} {value: value, completed: false, completion-date: u0})
    (ok true)))