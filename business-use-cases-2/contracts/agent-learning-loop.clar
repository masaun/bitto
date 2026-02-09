(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map learning-cycles uint {agent: principal, iteration: uint, improvement: uint, status: (string-ascii 20)})
(define-data-var cycle-nonce uint u0)

(define-public (start-cycle (iteration uint))
  (let ((cycle-id (+ (var-get cycle-nonce) u1)))
    (asserts! (> iteration u0) ERR-INVALID-PARAMETER)
    (map-set learning-cycles cycle-id {agent: tx-sender, iteration: iteration, improvement: u0, status: "active"})
    (var-set cycle-nonce cycle-id)
    (ok cycle-id)))

(define-public (complete-cycle (cycle-id uint) (improvement uint))
  (let ((cycle (unwrap! (map-get? learning-cycles cycle-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get agent cycle) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set learning-cycles cycle-id (merge cycle {improvement: improvement, status: "completed"})))))

(define-read-only (get-cycle (cycle-id uint))
  (ok (map-get? learning-cycles cycle-id)))
