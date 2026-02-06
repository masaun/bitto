(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var reporting-admin principal tx-sender)
(define-data-var next-report-id uint u1)

(define-map regulatory-reports
    uint
    {
        engagement-id: uint,
        report-hash: (buff 32),
        regulator: (string-ascii 64),
        submitted-by: principal,
        submitted-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-report (report-id uint))
    (map-get? regulatory-reports report-id)
)

(define-public (submit-report (engagement-id uint) (report-hash (buff 32)) (regulator (string-ascii 64)))
    (let
        (
            (report-id (var-get next-report-id))
        )
        (map-set regulatory-reports report-id {
            engagement-id: engagement-id,
            report-hash: report-hash,
            regulator: regulator,
            submitted-by: tx-sender,
            submitted-at: stacks-block-height,
            status: "submitted"
        })
        (var-set next-report-id (+ report-id u1))
        (ok report-id)
    )
)

(define-public (acknowledge-report (report-id uint))
    (let
        (
            (report (unwrap! (map-get? regulatory-reports report-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get reporting-admin)) ERR_UNAUTHORIZED)
        (map-set regulatory-reports report-id (merge report { status: "acked" }))
        (ok true)
    )
)

(define-public (set-reporting-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get reporting-admin)) ERR_UNAUTHORIZED)
        (var-set reporting-admin new-admin)
        (ok true)
    )
)
