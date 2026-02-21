(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-registered (err u102))

(define-map volunteers principal {name: (string-ascii 50), role: (string-ascii 40), hours: uint, certified: bool})
(define-map assignments {volunteer: principal, event-id: uint} {location: (string-ascii 50), timestamp: uint})
(define-data-var volunteer-count uint u0)
(define-data-var total-hours uint u0)

(define-read-only (get-volunteer (volunteer principal))
  (map-get? volunteers volunteer))

(define-read-only (get-assignment (volunteer principal) (event-id uint))
  (map-get? assignments {volunteer: volunteer, event-id: event-id}))

(define-read-only (get-stats)
  (ok {volunteers: (var-get volunteer-count), hours: (var-get total-hours)}))

(define-public (register-volunteer (name (string-ascii 50)) (role (string-ascii 40)))
  (begin
    (asserts! (is-none (map-get? volunteers tx-sender)) err-already-registered)
    (map-set volunteers tx-sender {name: name, role: role, hours: u0, certified: false})
    (var-set volunteer-count (+ (var-get volunteer-count) u1))
    (ok true)))

(define-public (assign-to-event (volunteer principal) (event-id uint) (location (string-ascii 50)))
  (let ((vol-data (unwrap! (map-get? volunteers volunteer) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set assignments {volunteer: volunteer, event-id: event-id} {location: location, timestamp: burn-block-height})
    (ok true)))

(define-public (log-hours (volunteer principal) (hours uint))
  (let ((vol-data (unwrap! (map-get? volunteers volunteer) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set volunteers volunteer (merge vol-data {hours: (+ (get hours vol-data) hours)}))
    (var-set total-hours (+ (var-get total-hours) hours))
    (ok true)))

(define-public (certify-volunteer (volunteer principal))
  (let ((vol-data (unwrap! (map-get? volunteers volunteer) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set volunteers volunteer (merge vol-data {certified: true}))
    (ok true)))
