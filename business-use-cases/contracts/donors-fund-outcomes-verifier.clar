(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map funding-programs
  {program-id: uint}
  {
    donor: principal,
    total-funding: uint,
    outcomes-required: (list 10 (string-ascii 128)),
    verification-criteria: (buff 32),
    disbursed: uint,
    status: (string-ascii 16)
  }
)

(define-map outcomes
  {outcome-id: uint}
  {
    program-id: uint,
    outcome-type: (string-ascii 128),
    evidence-hash: (buff 32),
    verified: bool,
    verifier: (optional principal),
    timestamp: uint
  }
)

(define-data-var program-nonce uint u0)
(define-data-var outcome-nonce uint u0)

(define-read-only (get-program (program-id uint))
  (map-get? funding-programs {program-id: program-id})
)

(define-read-only (get-outcome (outcome-id uint))
  (map-get? outcomes {outcome-id: outcome-id})
)

(define-public (create-funding-program
  (total-funding uint)
  (outcomes-required (list 10 (string-ascii 128)))
  (verification-criteria (buff 32))
)
  (let ((program-id (var-get program-nonce)))
    (asserts! (> total-funding u0) err-invalid-params)
    (map-set funding-programs {program-id: program-id}
      {
        donor: tx-sender,
        total-funding: total-funding,
        outcomes-required: outcomes-required,
        verification-criteria: verification-criteria,
        disbursed: u0,
        status: "active"
      }
    )
    (var-set program-nonce (+ program-id u1))
    (ok program-id)
  )
)

(define-public (submit-outcome
  (program-id uint)
  (outcome-type (string-ascii 128))
  (evidence-hash (buff 32))
)
  (let (
    (program (unwrap! (map-get? funding-programs {program-id: program-id}) err-not-found))
    (outcome-id (var-get outcome-nonce))
  )
    (asserts! (is-eq (get status program) "active") err-invalid-params)
    (map-set outcomes {outcome-id: outcome-id}
      {
        program-id: program-id,
        outcome-type: outcome-type,
        evidence-hash: evidence-hash,
        verified: false,
        verifier: none,
        timestamp: stacks-block-height
      }
    )
    (var-set outcome-nonce (+ outcome-id u1))
    (ok outcome-id)
  )
)

(define-public (verify-outcome (outcome-id uint))
  (let ((outcome (unwrap! (map-get? outcomes {outcome-id: outcome-id}) err-not-found)))
    (ok (map-set outcomes {outcome-id: outcome-id}
      (merge outcome {verified: true, verifier: (some tx-sender)})
    ))
  )
)
