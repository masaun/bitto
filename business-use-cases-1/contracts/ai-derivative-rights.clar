(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var derivative-admin principal tx-sender)
(define-data-var next-derivative-id uint u1)

(define-map derivatives
    uint
    {
        parent-id: uint,
        creator: principal,
        derivative-type: (string-ascii 20),
        metadata-uri: (string-ascii 256),
        created-at: uint,
        royalty-to-parent: uint
    }
)

(define-map derivative-permissions
    { parent-id: uint, creator: principal }
    bool
)

(define-read-only (get-derivative (derivative-id uint))
    (map-get? derivatives derivative-id)
)

(define-read-only (has-derivative-permission (parent-id uint) (creator principal))
    (default-to false (map-get? derivative-permissions { parent-id: parent-id, creator: creator }))
)

(define-public (grant-derivative-permission (parent-id uint) (creator principal))
    (begin
        (map-set derivative-permissions { parent-id: parent-id, creator: creator } true)
        (ok true)
    )
)

(define-public (revoke-derivative-permission (parent-id uint) (creator principal))
    (begin
        (map-delete derivative-permissions { parent-id: parent-id, creator: creator })
        (ok true)
    )
)

(define-public (register-derivative (parent-id uint) (derivative-type (string-ascii 20)) (metadata-uri (string-ascii 256)) (royalty-to-parent uint))
    (let
        (
            (derivative-id (var-get next-derivative-id))
        )
        (asserts! (has-derivative-permission parent-id tx-sender) ERR_UNAUTHORIZED)
        (asserts! (<= royalty-to-parent u10000) ERR_INVALID_PARAMS)
        (map-set derivatives derivative-id {
            parent-id: parent-id,
            creator: tx-sender,
            derivative-type: derivative-type,
            metadata-uri: metadata-uri,
            created-at: stacks-block-height,
            royalty-to-parent: royalty-to-parent
        })
        (var-set next-derivative-id (+ derivative-id u1))
        (ok derivative-id)
    )
)

(define-public (set-derivative-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get derivative-admin)) ERR_UNAUTHORIZED)
        (var-set derivative-admin new-admin)
        (ok true)
    )
)
