(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map aid-pools
  {pool-id: uint}
  {
    total-funds: uint,
    allocated: uint,
    program-count: uint,
    manager: principal,
    pool-type: (string-ascii 64)
  }
)

(define-map allocations
  {allocation-id: uint}
  {
    pool-id: uint,
    program-id: uint,
    amount: uint,
    allocation-criteria: (buff 32),
    timestamp: uint,
    status: (string-ascii 16)
  }
)

(define-data-var pool-nonce uint u0)
(define-data-var allocation-nonce uint u0)

(define-read-only (get-pool (pool-id uint))
  (map-get? aid-pools {pool-id: pool-id})
)

(define-read-only (get-allocation (allocation-id uint))
  (map-get? allocations {allocation-id: allocation-id})
)

(define-public (create-aid-pool
  (total-funds uint)
  (pool-type (string-ascii 64))
)
  (let ((pool-id (var-get pool-nonce)))
    (asserts! (> total-funds u0) err-invalid-params)
    (map-set aid-pools {pool-id: pool-id}
      {
        total-funds: total-funds,
        allocated: u0,
        program-count: u0,
        manager: tx-sender,
        pool-type: pool-type
      }
    )
    (var-set pool-nonce (+ pool-id u1))
    (ok pool-id)
  )
)

(define-public (allocate-funds
  (pool-id uint)
  (program-id uint)
  (amount uint)
  (allocation-criteria (buff 32))
)
  (let (
    (pool (unwrap! (map-get? aid-pools {pool-id: pool-id}) err-not-found))
    (allocation-id (var-get allocation-nonce))
  )
    (asserts! (is-eq tx-sender (get manager pool)) err-unauthorized)
    (asserts! (<= (+ (get allocated pool) amount) (get total-funds pool)) err-invalid-params)
    (map-set allocations {allocation-id: allocation-id}
      {
        pool-id: pool-id,
        program-id: program-id,
        amount: amount,
        allocation-criteria: allocation-criteria,
        timestamp: stacks-block-height,
        status: "allocated"
      }
    )
    (map-set aid-pools {pool-id: pool-id}
      (merge pool {
        allocated: (+ (get allocated pool) amount),
        program-count: (+ (get program-count pool) u1)
      })
    )
    (var-set allocation-nonce (+ allocation-id u1))
    (ok allocation-id)
  )
)
