(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map aid-programs
  {program-id: uint}
  {
    name: (string-ascii 128),
    manager: principal,
    total-allocated: uint,
    total-distributed: uint,
    beneficiary-count: uint,
    status: (string-ascii 16),
    created-at: uint
  }
)

(define-map distributions
  {distribution-id: uint}
  {
    program-id: uint,
    beneficiary-did: (string-ascii 128),
    amount: uint,
    distribution-type: (string-ascii 64),
    timestamp: uint,
    proof-hash: (buff 32),
    status: (string-ascii 16)
  }
)

(define-data-var program-nonce uint u0)
(define-data-var distribution-nonce uint u0)

(define-read-only (get-program (program-id uint))
  (map-get? aid-programs {program-id: program-id})
)

(define-read-only (get-distribution (distribution-id uint))
  (map-get? distributions {distribution-id: distribution-id})
)

(define-public (create-program
  (name (string-ascii 128))
  (total-allocated uint)
)
  (let ((program-id (var-get program-nonce)))
    (asserts! (> total-allocated u0) err-invalid-params)
    (map-set aid-programs {program-id: program-id}
      {
        name: name,
        manager: tx-sender,
        total-allocated: total-allocated,
        total-distributed: u0,
        beneficiary-count: u0,
        status: "active",
        created-at: stacks-block-height
      }
    )
    (var-set program-nonce (+ program-id u1))
    (ok program-id)
  )
)

(define-public (distribute-aid
  (program-id uint)
  (beneficiary-did (string-ascii 128))
  (amount uint)
  (distribution-type (string-ascii 64))
  (proof-hash (buff 32))
)
  (let (
    (program (unwrap! (map-get? aid-programs {program-id: program-id}) err-not-found))
    (distribution-id (var-get distribution-nonce))
  )
    (asserts! (is-eq tx-sender (get manager program)) err-unauthorized)
    (asserts! (is-eq (get status program) "active") err-invalid-params)
    (asserts! (<= (+ (get total-distributed program) amount) (get total-allocated program)) err-invalid-params)
    (map-set distributions {distribution-id: distribution-id}
      {
        program-id: program-id,
        beneficiary-did: beneficiary-did,
        amount: amount,
        distribution-type: distribution-type,
        timestamp: stacks-block-height,
        proof-hash: proof-hash,
        status: "completed"
      }
    )
    (map-set aid-programs {program-id: program-id}
      (merge program {
        total-distributed: (+ (get total-distributed program) amount),
        beneficiary-count: (+ (get beneficiary-count program) u1)
      })
    )
    (var-set distribution-nonce (+ distribution-id u1))
    (ok distribution-id)
  )
)
