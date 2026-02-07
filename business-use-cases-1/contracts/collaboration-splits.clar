(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PERCENTAGE (err u102))
(define-constant ERR_SPLIT_EXISTS (err u103))

(define-data-var contract-owner principal tx-sender)

(define-map splits
  { work-id: uint, collaborator: principal }
  {
    percentage: uint,
    role: (string-ascii 30),
    active: bool
  }
)

(define-map split-totals
  uint
  { total-percentage: uint, locked: bool }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-split (work-id uint) (collaborator principal))
  (ok (map-get? splits { work-id: work-id, collaborator: collaborator }))
)

(define-read-only (get-split-total (work-id uint))
  (ok (map-get? split-totals work-id))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (define-split
  (work-id uint)
  (collaborator principal)
  (percentage uint)
  (role (string-ascii 30))
)
  (let 
    (
      (current-total (default-to { total-percentage: u0, locked: false } (map-get? split-totals work-id)))
      (new-total (+ (get total-percentage current-total) percentage))
    )
    (asserts! (not (get locked current-total)) ERR_UNAUTHORIZED)
    (asserts! (<= percentage u10000) ERR_INVALID_PERCENTAGE)
    (asserts! (<= new-total u10000) ERR_INVALID_PERCENTAGE)
    (asserts! (is-none (map-get? splits { work-id: work-id, collaborator: collaborator })) ERR_SPLIT_EXISTS)
    (map-set splits { work-id: work-id, collaborator: collaborator } {
      percentage: percentage,
      role: role,
      active: true
    })
    (ok (map-set split-totals work-id { total-percentage: new-total, locked: false }))
  )
)

(define-public (lock-splits (work-id uint))
  (let ((current-total (unwrap! (map-get? split-totals work-id) ERR_NOT_FOUND)))
    (asserts! (is-eq (get total-percentage current-total) u10000) ERR_INVALID_PERCENTAGE)
    (ok (map-set split-totals work-id (merge current-total { locked: true })))
  )
)

(define-public (deactivate-split (work-id uint) (collaborator principal))
  (let 
    (
      (split (unwrap! (map-get? splits { work-id: work-id, collaborator: collaborator }) ERR_NOT_FOUND))
      (total (unwrap! (map-get? split-totals work-id) ERR_NOT_FOUND))
    )
    (asserts! (not (get locked total)) ERR_UNAUTHORIZED)
    (ok (map-set splits { work-id: work-id, collaborator: collaborator } (merge split { active: false })))
  )
)
