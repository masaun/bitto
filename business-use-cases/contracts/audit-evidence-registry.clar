(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var evidence-admin principal tx-sender)
(define-data-var next-evidence-id uint u1)

(define-map audit-evidence
    uint
    {
        engagement-id: uint,
        evidence-hash: (buff 32),
        evidence-type: (string-ascii 64),
        uploaded-by: principal,
        uploaded-at: uint,
        verified: bool
    }
)

(define-read-only (get-evidence (evidence-id uint))
    (map-get? audit-evidence evidence-id)
)

(define-public (register-evidence (engagement-id uint) (evidence-hash (buff 32)) (evidence-type (string-ascii 64)))
    (let
        (
            (evidence-id (var-get next-evidence-id))
        )
        (map-set audit-evidence evidence-id {
            engagement-id: engagement-id,
            evidence-hash: evidence-hash,
            evidence-type: evidence-type,
            uploaded-by: tx-sender,
            uploaded-at: stacks-block-height,
            verified: false
        })
        (var-set next-evidence-id (+ evidence-id u1))
        (ok evidence-id)
    )
)

(define-public (verify-evidence (evidence-id uint))
    (let
        (
            (evidence (unwrap! (map-get? audit-evidence evidence-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get evidence-admin)) ERR_UNAUTHORIZED)
        (map-set audit-evidence evidence-id (merge evidence { verified: true }))
        (ok true)
    )
)

(define-public (set-evidence-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get evidence-admin)) ERR_UNAUTHORIZED)
        (var-set evidence-admin new-admin)
        (ok true)
    )
)
