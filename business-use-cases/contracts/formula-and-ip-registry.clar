(define-map formulas
  { formula-id: uint }
  {
    name: (string-ascii 100),
    formula-hash: (buff 32),
    owner: principal,
    patent-number: (optional (string-ascii 50)),
    registered-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var formula-nonce uint u0)

(define-public (register-formula (name (string-ascii 100)) (formula-hash (buff 32)) (patent (optional (string-ascii 50))))
  (let ((formula-id (+ (var-get formula-nonce) u1)))
    (map-set formulas
      { formula-id: formula-id }
      {
        name: name,
        formula-hash: formula-hash,
        owner: tx-sender,
        patent-number: patent,
        registered-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set formula-nonce formula-id)
    (ok formula-id)
  )
)

(define-read-only (get-formula (formula-id uint))
  (map-get? formulas { formula-id: formula-id })
)
