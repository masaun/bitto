(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var registry-admin principal tx-sender)
(define-data-var next-dataset-id uint u1)

(define-map annotated-datasets
    uint
    {
        raw-dataset-id: uint,
        annotation-hash: (buff 32),
        annotated-by: principal,
        annotated-at: uint,
        quality-score: uint
    }
)

(define-read-only (get-annotated-dataset (dataset-id uint))
    (map-get? annotated-datasets dataset-id)
)

(define-public (register-annotated-dataset (raw-dataset-id uint) (annotation-hash (buff 32)) (quality-score uint))
    (let
        (
            (dataset-id (var-get next-dataset-id))
        )
        (map-set annotated-datasets dataset-id {
            raw-dataset-id: raw-dataset-id,
            annotation-hash: annotation-hash,
            annotated-by: tx-sender,
            annotated-at: stacks-block-height,
            quality-score: quality-score
        })
        (var-set next-dataset-id (+ dataset-id u1))
        (ok dataset-id)
    )
)

(define-public (set-registry-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get registry-admin)) ERR_UNAUTHORIZED)
        (var-set registry-admin new-admin)
        (ok true)
    )
)
