(define-constant contract-owner tx-sender)

(define-map payments uint {sender: principal, receiver: principal, amount: uint, status: (string-ascii 20), created-at: uint})
(define-data-var payment-nonce uint u0)

(define-public (initiate-payment (receiver principal) (amount uint))
  (let ((id (var-get payment-nonce)))
    (map-set payments id {sender: tx-sender, receiver: receiver, amount: amount, status: "pending", created-at: stacks-block-height})
    (var-set payment-nonce (+ id u1))
    (ok id)))

(define-public (settle-payment (payment-id uint))
  (let ((payment (unwrap! (map-get? payments payment-id) (err u101))))
    (ok (map-set payments payment-id (merge payment {status: "settled"})))))

(define-read-only (get-payment (payment-id uint))
  (ok (map-get? payments payment-id)))
