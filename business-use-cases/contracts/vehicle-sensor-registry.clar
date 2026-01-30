(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var registry-admin principal tx-sender)
(define-data-var next-vehicle-id uint u1)

(define-map vehicles
    uint
    {
        owner: principal,
        vin: (string-ascii 32),
        camera-config: (string-ascii 128),
        registered-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-vehicle (vehicle-id uint))
    (map-get? vehicles vehicle-id)
)

(define-public (register-vehicle (vin (string-ascii 32)) (camera-config (string-ascii 128)))
    (let
        (
            (vehicle-id (var-get next-vehicle-id))
        )
        (map-set vehicles vehicle-id {
            owner: tx-sender,
            vin: vin,
            camera-config: camera-config,
            registered-at: stacks-block-height,
            status: "active"
        })
        (var-set next-vehicle-id (+ vehicle-id u1))
        (ok vehicle-id)
    )
)

(define-public (update-camera-config (vehicle-id uint) (new-config (string-ascii 128)))
    (let
        (
            (vehicle (unwrap! (map-get? vehicles vehicle-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get owner vehicle) tx-sender) ERR_UNAUTHORIZED)
        (map-set vehicles vehicle-id (merge vehicle { camera-config: new-config }))
        (ok true)
    )
)

(define-public (set-registry-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get registry-admin)) ERR_UNAUTHORIZED)
        (var-set registry-admin new-admin)
        (ok true)
    )
)
