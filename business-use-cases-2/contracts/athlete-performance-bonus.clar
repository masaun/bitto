(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-paid (err u102))
(define-constant err-invalid-amount (err u103))

(define-map athletes principal {name: (string-ascii 50), team: (string-ascii 40), base-salary: uint})
(define-map bonuses {athlete: principal, event-id: uint} {metric: (string-ascii 40), bonus: uint, paid: bool})
(define-data-var total-bonuses-paid uint u0)

(define-read-only (get-athlete (athlete principal))
  (map-get? athletes athlete))

(define-read-only (get-bonus (athlete principal) (event-id uint))
  (map-get? bonuses {athlete: athlete, event-id: event-id}))

(define-read-only (get-total-bonuses-paid)
  (ok (var-get total-bonuses-paid)))

(define-public (register-athlete (name (string-ascii 50)) (team (string-ascii 40)) (base-salary uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set athletes tx-sender {name: name, team: team, base-salary: base-salary})
    (ok true)))

(define-public (set-bonus (athlete principal) (event-id uint) (metric (string-ascii 40)) (bonus uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set bonuses {athlete: athlete, event-id: event-id} {metric: metric, bonus: bonus, paid: false})
    (ok true)))

(define-public (claim-bonus (event-id uint))
  (let ((bonus (unwrap! (map-get? bonuses {athlete: tx-sender, event-id: event-id}) err-not-found)))
    (asserts! (not (get paid bonus)) err-already-paid)
    (map-set bonuses {athlete: tx-sender, event-id: event-id} (merge bonus {paid: true}))
    (var-set total-bonuses-paid (+ (var-get total-bonuses-paid) (get bonus bonus)))
    (ok (get bonus bonus))))

(define-public (update-athlete-salary (athlete principal) (new-salary uint))
  (let ((athlete-data (unwrap! (map-get? athletes athlete) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set athletes athlete (merge athlete-data {base-salary: new-salary}))
    (ok true)))
