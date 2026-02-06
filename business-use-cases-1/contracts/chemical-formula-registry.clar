(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map formulas
  { formula-id: (string-ascii 50) }
  {
    cas-number: (string-ascii 50),
    formula-name: (string-ascii 100),
    molecular-formula: (string-ascii 100),
    molecular-weight: uint,
    registered-by: principal,
    created-at: uint,
    is-active: bool
  }
)

(define-public (register-formula (formula-id (string-ascii 50)) (cas-number (string-ascii 50)) (formula-name (string-ascii 100)) (molecular-formula (string-ascii 100)) (molecular-weight uint))
  (begin
    (asserts! (is-none (map-get? formulas { formula-id: formula-id })) err-already-exists)
    (ok (map-set formulas
      { formula-id: formula-id }
      {
        cas-number: cas-number,
        formula-name: formula-name,
        molecular-formula: molecular-formula,
        molecular-weight: molecular-weight,
        registered-by: tx-sender,
        created-at: stacks-block-height,
        is-active: true
      }
    ))
  )
)

(define-public (update-formula (formula-id (string-ascii 50)) (formula-name (string-ascii 100)) (molecular-weight uint))
  (let ((formula (unwrap! (map-get? formulas { formula-id: formula-id }) err-not-found)))
    (asserts! (is-eq (get registered-by formula) tx-sender) err-unauthorized)
    (ok (map-set formulas
      { formula-id: formula-id }
      (merge formula { formula-name: formula-name, molecular-weight: molecular-weight })
    ))
  )
)

(define-public (deactivate-formula (formula-id (string-ascii 50)))
  (let ((formula (unwrap! (map-get? formulas { formula-id: formula-id }) err-not-found)))
    (asserts! (is-eq (get registered-by formula) tx-sender) err-unauthorized)
    (ok (map-set formulas
      { formula-id: formula-id }
      (merge formula { is-active: false })
    ))
  )
)

(define-read-only (get-formula (formula-id (string-ascii 50)))
  (map-get? formulas { formula-id: formula-id })
)

(define-read-only (is-formula-active (formula-id (string-ascii 50)))
  (match (map-get? formulas { formula-id: formula-id })
    formula (ok (get is-active formula))
    err-not-found
  )
)
