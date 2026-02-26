(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PROOF (err u102))

(define-data-var proof-admin principal tx-sender)
(define-data-var next-proof-id uint u1)

(define-map proofs
    uint
    {
        data-hash: (buff 32),
        proof-hash: (buff 32),
        verifier: principal,
        verified-at: uint,
        status: (string-ascii 10)
    }
)

(define-map data-proofs
    (buff 32)
    (list 50 uint)
)

(define-read-only (get-proof (proof-id uint))
    (map-get? proofs proof-id)
)

(define-read-only (get-data-proofs (data-hash (buff 32)))
    (default-to (list) (map-get? data-proofs data-hash))
)

(define-read-only (is-proof-valid (proof-id uint))
    (match (map-get? proofs proof-id)
        proof (is-eq (get status proof) "verified")
        false
    )
)

(define-public (submit-proof (data-hash (buff 32)) (proof-hash (buff 32)))
    (let
        (
            (proof-id (var-get next-proof-id))
            (existing-proofs (default-to (list) (map-get? data-proofs data-hash)))
        )
        (map-set proofs proof-id {
            data-hash: data-hash,
            proof-hash: proof-hash,
            verifier: tx-sender,
            verified-at: stacks-block-height,
            status: "pending"
        })
        (map-set data-proofs data-hash (unwrap-panic (as-max-len? (append existing-proofs proof-id) u50)))
        (var-set next-proof-id (+ proof-id u1))
        (ok proof-id)
    )
)

(define-public (verify-proof (proof-id uint))
    (let
        (
            (proof (unwrap! (map-get? proofs proof-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get proof-admin)) ERR_UNAUTHORIZED)
        (map-set proofs proof-id (merge proof { status: "verified" }))
        (ok true)
    )
)

(define-public (invalidate-proof (proof-id uint))
    (let
        (
            (proof (unwrap! (map-get? proofs proof-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get proof-admin)) ERR_UNAUTHORIZED)
        (map-set proofs proof-id (merge proof { status: "invalid" }))
        (ok true)
    )
)

(define-public (set-proof-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get proof-admin)) ERR_UNAUTHORIZED)
        (var-set proof-admin new-admin)
        (ok true)
    )
)
