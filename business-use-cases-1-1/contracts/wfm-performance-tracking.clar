(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var tracking-admin principal tx-sender)

(define-map worker-performance
    principal
    {
        tasks-completed: uint,
        accuracy-score: uint,
        total-earnings: uint,
        last-updated: uint
    }
)

(define-read-only (get-worker-performance (worker principal))
    (default-to
        { tasks-completed: u0, accuracy-score: u0, total-earnings: u0, last-updated: u0 }
        (map-get? worker-performance worker)
    )
)

(define-public (update-performance (worker principal) (tasks-completed uint) (accuracy-score uint) (earnings uint))
    (let
        (
            (current (get-worker-performance worker))
        )
        (map-set worker-performance worker {
            tasks-completed: (+ (get tasks-completed current) tasks-completed),
            accuracy-score: accuracy-score,
            total-earnings: (+ (get total-earnings current) earnings),
            last-updated: stacks-block-height
        })
        (ok true)
    )
)

(define-public (set-tracking-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get tracking-admin)) ERR_UNAUTHORIZED)
        (var-set tracking-admin new-admin)
        (ok true)
    )
)
