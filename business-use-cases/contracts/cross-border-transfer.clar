(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var transfer-admin principal tx-sender)
(define-data-var next-transfer-id uint u1)

(define-map cross-border-transfers
    uint
    {
        dataset-id: uint,
        source-jurisdiction: (string-ascii 32),
        target-jurisdiction: (string-ascii 32),
        approved: bool,
        transferred-at: uint
    }
)

(define-read-only (get-cross-border-transfer (transfer-id uint))
    (map-get? cross-border-transfers transfer-id)
)

(define-public (request-transfer (dataset-id uint) (source-jurisdiction (string-ascii 32)) (target-jurisdiction (string-ascii 32)))
    (let
        (
            (transfer-id (var-get next-transfer-id))
        )
        (map-set cross-border-transfers transfer-id {
            dataset-id: dataset-id,
            source-jurisdiction: source-jurisdiction,
            target-jurisdiction: target-jurisdiction,
            approved: false,
            transferred-at: stacks-block-height
        })
        (var-set next-transfer-id (+ transfer-id u1))
        (ok transfer-id)
    )
)

(define-public (approve-transfer (transfer-id uint))
    (let
        (
            (transfer (unwrap! (map-get? cross-border-transfers transfer-id) (err u101)))
        )
        (asserts! (is-eq tx-sender (var-get transfer-admin)) ERR_UNAUTHORIZED)
        (map-set cross-border-transfers transfer-id (merge transfer { approved: true }))
        (ok true)
    )
)

(define-public (set-transfer-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get transfer-admin)) ERR_UNAUTHORIZED)
        (var-set transfer-admin new-admin)
        (ok true)
    )
)
