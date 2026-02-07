(define-map default-events uint {
  defaulting-party: principal,
  contract-id: uint,
  default-type: (string-ascii 50),
  default-date: uint,
  amount: uint,
  resolution: (string-ascii 20)
})

(define-data-var default-counter uint u0)

(define-read-only (get-default-event (default-id uint))
  (map-get? default-events default-id))

(define-public (record-default (defaulting-party principal) (contract-id uint) (default-type (string-ascii 50)) (amount uint))
  (let ((new-id (+ (var-get default-counter) u1)))
    (map-set default-events new-id {
      defaulting-party: defaulting-party,
      contract-id: contract-id,
      default-type: default-type,
      default-date: stacks-block-height,
      amount: amount,
      resolution: "pending"
    })
    (var-set default-counter new-id)
    (ok new-id)))

(define-public (resolve-default (default-id uint) (resolution (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? default-events default-id)) (err u1))
    (ok (map-set default-events default-id (merge (unwrap-panic (map-get? default-events default-id)) { resolution: resolution })))))
