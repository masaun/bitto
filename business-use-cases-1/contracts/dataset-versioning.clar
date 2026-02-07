(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var versioning-admin principal tx-sender)
(define-data-var next-version-id uint u1)

(define-map dataset-versions
    uint
    {
        dataset-id: uint,
        version: uint,
        version-hash: (buff 32),
        changes: (string-ascii 256),
        created-at: uint
    }
)

(define-read-only (get-dataset-version (version-id uint))
    (map-get? dataset-versions version-id)
)

(define-public (create-version (dataset-id uint) (version uint) (version-hash (buff 32)) (changes (string-ascii 256)))
    (let
        (
            (version-id (var-get next-version-id))
        )
        (map-set dataset-versions version-id {
            dataset-id: dataset-id,
            version: version,
            version-hash: version-hash,
            changes: changes,
            created-at: stacks-block-height
        })
        (var-set next-version-id (+ version-id u1))
        (ok version-id)
    )
)

(define-public (set-versioning-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get versioning-admin)) ERR_UNAUTHORIZED)
        (var-set versioning-admin new-admin)
        (ok true)
    )
)
