(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var metering-admin principal tx-sender)

(define-map usage-records
    { model-id: uint, user: principal, block-height: uint }
    {
        usage-type: (string-ascii 20),
        quantity: uint,
        cost: uint
    }
)

(define-map total-usage
    { model-id: uint, user: principal }
    {
        total-inferences: uint,
        total-retraining: uint,
        total-finetuning: uint,
        total-cost: uint
    }
)

(define-read-only (get-usage-record (model-id uint) (user principal) (height uint))
    (map-get? usage-records { model-id: model-id, user: user, block-height: height })
)

(define-read-only (get-total-usage (model-id uint) (user principal))
    (default-to
        { total-inferences: u0, total-retraining: u0, total-finetuning: u0, total-cost: u0 }
        (map-get? total-usage { model-id: model-id, user: user })
    )
)

(define-public (record-usage (model-id uint) (usage-type (string-ascii 20)) (quantity uint) (cost uint))
    (let
        (
            (current-total (get-total-usage model-id tx-sender))
        )
        (map-set usage-records
            { model-id: model-id, user: tx-sender, block-height: stacks-block-height }
            { usage-type: usage-type, quantity: quantity, cost: cost }
        )
        (map-set total-usage
            { model-id: model-id, user: tx-sender }
            {
                total-inferences: (if (is-eq usage-type "inference")
                    (+ (get total-inferences current-total) quantity)
                    (get total-inferences current-total)),
                total-retraining: (if (is-eq usage-type "retrain")
                    (+ (get total-retraining current-total) quantity)
                    (get total-retraining current-total)),
                total-finetuning: (if (is-eq usage-type "finetune")
                    (+ (get total-finetuning current-total) quantity)
                    (get total-finetuning current-total)),
                total-cost: (+ (get total-cost current-total) cost)
            }
        )
        (ok true)
    )
)

(define-public (set-metering-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get metering-admin)) ERR_UNAUTHORIZED)
        (var-set metering-admin new-admin)
        (ok true)
    )
)
