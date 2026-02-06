(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var capture-admin principal tx-sender)
(define-data-var next-capture-id uint u1)

(define-map capture-events
    uint
    {
        vehicle-id: uint,
        timestamp: uint,
        location-hash: (buff 32),
        data-hash: (buff 32),
        captured-at: uint
    }
)

(define-read-only (get-capture-event (capture-id uint))
    (map-get? capture-events capture-id)
)

(define-public (log-capture (vehicle-id uint) (timestamp uint) (location-hash (buff 32)) (data-hash (buff 32)))
    (let
        (
            (capture-id (var-get next-capture-id))
        )
        (map-set capture-events capture-id {
            vehicle-id: vehicle-id,
            timestamp: timestamp,
            location-hash: location-hash,
            data-hash: data-hash,
            captured-at: stacks-block-height
        })
        (var-set next-capture-id (+ capture-id u1))
        (ok capture-id)
    )
)

(define-public (set-capture-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get capture-admin)) ERR_UNAUTHORIZED)
        (var-set capture-admin new-admin)
        (ok true)
    )
)
