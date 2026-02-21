(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-assigned (err u102))
(define-constant err-not-certified (err u103))

(define-map referees principal {name: (string-ascii 50), sport: (string-ascii 30), certified: bool, matches-officiated: uint})
(define-map assignments {match-id: uint} {referee: principal, timestamp: uint, validated: bool})
(define-data-var total-matches uint u0)

(define-read-only (get-referee (referee principal))
  (map-get? referees referee))

(define-read-only (get-assignment (match-id uint))
  (map-get? assignments {match-id: match-id}))

(define-read-only (get-total-matches)
  (ok (var-get total-matches)))

(define-public (register-referee (name (string-ascii 50)) (sport (string-ascii 30)))
  (begin
    (map-set referees tx-sender {name: name, sport: sport, certified: false, matches-officiated: u0})
    (ok true)))

(define-public (certify-referee (referee principal))
  (let ((ref-data (unwrap! (map-get? referees referee) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set referees referee (merge ref-data {certified: true}))
    (ok true)))

(define-public (assign-referee (match-id uint) (referee principal))
  (let ((ref-data (unwrap! (map-get? referees referee) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (get certified ref-data) err-not-certified)
    (asserts! (is-none (map-get? assignments {match-id: match-id})) err-already-assigned)
    (map-set assignments {match-id: match-id} {referee: referee, timestamp: burn-block-height, validated: false})
    (map-set referees referee (merge ref-data {matches-officiated: (+ (get matches-officiated ref-data) u1)}))
    (var-set total-matches (+ (var-get total-matches) u1))
    (ok true)))

(define-public (validate-assignment (match-id uint))
  (let ((assignment (unwrap! (map-get? assignments {match-id: match-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set assignments {match-id: match-id} (merge assignment {validated: true}))
    (ok true)))
