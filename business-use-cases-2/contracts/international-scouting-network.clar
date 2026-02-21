(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-verified (err u102))

(define-map scouts principal {name: (string-ascii 50), region: (string-ascii 40), verified: bool, reports: uint})
(define-map reports {scout: principal, athlete-id: uint} {notes: (string-ascii 100), rating: uint, timestamp: uint})
(define-data-var total-reports uint u0)

(define-read-only (get-scout (scout principal))
  (map-get? scouts scout))

(define-read-only (get-report (scout principal) (athlete-id uint))
  (map-get? reports {scout: scout, athlete-id: athlete-id}))

(define-read-only (get-total-reports)
  (ok (var-get total-reports)))

(define-public (register-scout (name (string-ascii 50)) (region (string-ascii 40)))
  (begin
    (map-set scouts tx-sender {name: name, region: region, verified: false, reports: u0})
    (ok true)))

(define-public (verify-scout (scout principal))
  (let ((scout-data (unwrap! (map-get? scouts scout) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set scouts scout (merge scout-data {verified: true}))
    (ok true)))

(define-public (submit-report (athlete-id uint) (notes (string-ascii 100)) (rating uint))
  (let ((scout-data (unwrap! (map-get? scouts tx-sender) err-not-found)))
    (asserts! (get verified scout-data) err-owner-only)
    (map-set reports {scout: tx-sender, athlete-id: athlete-id} {notes: notes, rating: rating, timestamp: burn-block-height})
    (map-set scouts tx-sender (merge scout-data {reports: (+ (get reports scout-data) u1)}))
    (var-set total-reports (+ (var-get total-reports) u1))
    (ok true)))

(define-public (revoke-scout (scout principal))
  (let ((scout-data (unwrap! (map-get? scouts scout) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set scouts scout (merge scout-data {verified: false}))
    (ok true)))
