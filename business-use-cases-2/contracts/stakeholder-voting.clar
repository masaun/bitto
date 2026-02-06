(define-map stakeholders principal {
  stakeholder-type: (string-ascii 50),
  voting-power: uint,
  registration-date: uint,
  status: (string-ascii 20)
})

(define-map votes { proposal-id: uint, voter: principal } bool)

(define-read-only (get-stakeholder (stakeholder principal))
  (map-get? stakeholders stakeholder))

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (default-to false (map-get? votes { proposal-id: proposal-id, voter: voter })))

(define-public (register-stakeholder (stakeholder-type (string-ascii 50)) (voting-power uint))
  (begin
    (asserts! (is-none (map-get? stakeholders tx-sender)) (err u1))
    (ok (map-set stakeholders tx-sender {
      stakeholder-type: stakeholder-type,
      voting-power: voting-power,
      registration-date: stacks-block-height,
      status: "active"
    }))))

(define-public (cast-vote (proposal-id uint) (support bool))
  (begin
    (asserts! (is-some (map-get? stakeholders tx-sender)) (err u1))
    (asserts! (not (has-voted proposal-id tx-sender)) (err u2))
    (ok (map-set votes { proposal-id: proposal-id, voter: tx-sender } support))))
