(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var dispatch-admin principal tx-sender)
(define-data-var next-task-id uint u1)

(define-map wfm-tasks
    uint
    {
        dataset-id: uint,
        task-type: (string-ascii 32),
        assigned-to: principal,
        status: (string-ascii 10),
        created-at: uint
    }
)

(define-read-only (get-wfm-task (task-id uint))
    (map-get? wfm-tasks task-id)
)

(define-public (dispatch-task (dataset-id uint) (task-type (string-ascii 32)) (worker principal))
    (let
        (
            (task-id (var-get next-task-id))
        )
        (map-set wfm-tasks task-id {
            dataset-id: dataset-id,
            task-type: task-type,
            assigned-to: worker,
            status: "assigned",
            created-at: stacks-block-height
        })
        (var-set next-task-id (+ task-id u1))
        (ok task-id)
    )
)

(define-public (complete-task (task-id uint))
    (let
        (
            (task (unwrap! (map-get? wfm-tasks task-id) (err u101)))
        )
        (asserts! (is-eq (get assigned-to task) tx-sender) ERR_UNAUTHORIZED)
        (map-set wfm-tasks task-id (merge task { status: "completed" }))
        (ok true)
    )
)

(define-public (set-dispatch-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get dispatch-admin)) ERR_UNAUTHORIZED)
        (var-set dispatch-admin new-admin)
        (ok true)
    )
)
