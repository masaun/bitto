(define-constant contract-owner tx-sender)

(define-map claims uint {claimant: principal, claim-type: (string-ascii 32), amount: uint, status: (string-ascii 20), filed-at: uint})
(define-data-var claim-nonce uint u0)

(define-public (file-claim (claim-type (string-ascii 32)) (amount uint))
  (let ((id (var-get claim-nonce)))
    (map-set claims id {claimant: tx-sender, claim-type: claim-type, amount: amount, status: "pending", filed-at: stacks-block-height})
    (var-set claim-nonce (+ id u1))
    (ok id)))

(define-public (process-claim (claim-id uint) (status (string-ascii 20)))
  (let ((claim (unwrap! (map-get? claims claim-id) (err u101))))
    (ok (map-set claims claim-id (merge claim {status: status})))))

(define-read-only (get-claim (claim-id uint))
  (ok (map-get? claims claim-id)))
