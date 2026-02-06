(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PROOF (err u102))

(define-data-var proof-admin principal tx-sender)
(define-data-var next-proof-id uint u1)

(define-map imagery-proofs
    uint
    {
        imagery-hash: (buff 32),
        proof-hash: (buff 32),
        verifier: principal,
        verified-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-imagery-proof (proof-id uint))
    (map-get? imagery-proofs proof-id)
)

(define-read-only (is-proof-verified (proof-id uint))
    (match (map-get? imagery-proofs proof-id)
        proof (is-eq (get status proof) "verified")
        false
    )
)

(define-public (submit-imagery-proof (imagery-hash (buff 32)) (proof-hash (buff 32)))
    (let
        (
            (proof-id (var-get next-proof-id))
        )
        (map-set imagery-proofs proof-id {
            imagery-hash: imagery-hash,
            proof-hash: proof-hash,
            verifier: tx-sender,
            verified-at: stacks-block-height,
            status: "pending"
        })
        (var-set next-proof-id (+ proof-id u1))
        (ok proof-id)
    )
)

(define-public (verify-imagery-proof (proof-id uint))
    (let
        (
            (proof (unwrap! (map-get? imagery-proofs proof-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get proof-admin)) ERR_UNAUTHORIZED)
        (map-set imagery-proofs proof-id (merge proof { status: "verified" }))
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
