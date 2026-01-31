(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map threat-intel
  { intel-id: uint }
  {
    classification: uint,
    shared-with: (list 10 principal),
    created-at: uint
  }
)

(define-data-var intel-nonce uint u0)

(define-public (share-intelligence (classification uint) (recipients (list 10 principal)))
  (let ((intel-id (+ (var-get intel-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set threat-intel { intel-id: intel-id }
      {
        classification: classification,
        shared-with: recipients,
        created-at: stacks-block-height
      }
    )
    (var-set intel-nonce intel-id)
    (ok intel-id)
  )
)

(define-read-only (get-intelligence (intel-id uint))
  (ok (map-get? threat-intel { intel-id: intel-id }))
)

(define-read-only (get-intel-count)
  (ok (var-get intel-nonce))
)
