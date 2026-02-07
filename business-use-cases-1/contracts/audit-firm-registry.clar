(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var registry-admin principal tx-sender)
(define-data-var next-firm-id uint u1)

(define-map audit-firms
    uint
    {
        firm-name: (string-ascii 128),
        admin: principal,
        license-number: (string-ascii 64),
        registered-at: uint,
        status: (string-ascii 10)
    }
)

(define-map auditors
    { firm-id: uint, auditor: principal }
    {
        license: (string-ascii 64),
        verified: bool,
        added-at: uint
    }
)

(define-read-only (get-audit-firm (firm-id uint))
    (map-get? audit-firms firm-id)
)

(define-read-only (get-auditor (firm-id uint) (auditor principal))
    (map-get? auditors { firm-id: firm-id, auditor: auditor })
)

(define-public (register-firm (firm-name (string-ascii 128)) (license-number (string-ascii 64)))
    (let
        (
            (firm-id (var-get next-firm-id))
        )
        (map-set audit-firms firm-id {
            firm-name: firm-name,
            admin: tx-sender,
            license-number: license-number,
            registered-at: stacks-block-height,
            status: "active"
        })
        (var-set next-firm-id (+ firm-id u1))
        (ok firm-id)
    )
)

(define-public (add-auditor (firm-id uint) (auditor principal) (license (string-ascii 64)))
    (let
        (
            (firm (unwrap! (map-get? audit-firms firm-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get admin firm) tx-sender) ERR_UNAUTHORIZED)
        (map-set auditors
            { firm-id: firm-id, auditor: auditor }
            { license: license, verified: true, added-at: stacks-block-height }
        )
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
