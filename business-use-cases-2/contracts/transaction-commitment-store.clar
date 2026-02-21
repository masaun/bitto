(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map commitments
  { commitment-hash: (buff 32) }
  {
    data: (buff 512),
    revealed: bool,
    creator: principal,
    timestamp: uint
  }
)

(define-data-var commitment-count uint u0)

(define-read-only (get-commitment (commitment-hash (buff 32)))
  (map-get? commitments { commitment-hash: commitment-hash })
)

(define-read-only (get-count)
  (ok (var-get commitment-count))
)

(define-public (store-commitment (commitment-hash (buff 32)) (data (buff 512)))
  (begin
    (map-set commitments
      { commitment-hash: commitment-hash }
      {
        data: data,
        revealed: false,
        creator: tx-sender,
        timestamp: stacks-block-height
      }
    )
    (var-set commitment-count (+ (var-get commitment-count) u1))
    (ok true)
  )
)

(define-public (reveal-commitment (commitment-hash (buff 32)))
  (let ((commitment-data (unwrap! (map-get? commitments { commitment-hash: commitment-hash }) err-not-found)))
    (asserts! (is-eq (get creator commitment-data) tx-sender) err-owner-only)
    (map-set commitments
      { commitment-hash: commitment-hash }
      (merge commitment-data { revealed: true })
    )
    (ok true)
  )
)
