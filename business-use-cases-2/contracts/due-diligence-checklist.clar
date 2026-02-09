(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dd-checklists uint {transaction-id: uint, item: (string-ascii 128), completed: bool})
(define-data-var dd-nonce uint u0)

(define-public (add-dd-checklist-item (transaction-id uint) (item (string-ascii 128)))
  (let ((checklist-id (+ (var-get dd-nonce) u1)))
    (map-set dd-checklists checklist-id {transaction-id: transaction-id, item: item, completed: false})
    (var-set dd-nonce checklist-id)
    (ok checklist-id)))

(define-read-only (get-dd-checklist (checklist-id uint))
  (ok (map-get? dd-checklists checklist-id)))
