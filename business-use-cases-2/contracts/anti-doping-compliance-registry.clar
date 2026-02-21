(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-registered (err u102))
(define-constant err-test-failed (err u103))

(define-map athletes principal {name: (string-ascii 50), sport: (string-ascii 30), tests-passed: uint, compliant: bool})
(define-map test-records {athlete: principal, test-id: uint} {date: uint, result: bool, tester: principal})
(define-data-var test-counter uint u0)
(define-data-var total-tests uint u0)

(define-read-only (get-athlete-record (athlete principal))
  (map-get? athletes athlete))

(define-read-only (get-test-record (athlete principal) (test-id uint))
  (map-get? test-records {athlete: athlete, test-id: test-id}))

(define-read-only (get-total-tests)
  (ok (var-get total-tests)))

(define-public (register-athlete (name (string-ascii 50)) (sport (string-ascii 30)))
  (begin
    (asserts! (is-none (map-get? athletes tx-sender)) err-already-registered)
    (map-set athletes tx-sender {name: name, sport: sport, tests-passed: u0, compliant: true})
    (ok true)))

(define-public (record-test (athlete principal) (result bool))
  (let ((athlete-data (unwrap! (map-get? athletes athlete) err-not-found))
        (test-id (+ (var-get test-counter) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set test-records {athlete: athlete, test-id: test-id} {date: burn-block-height, result: result, tester: tx-sender})
    (if result
      (map-set athletes athlete (merge athlete-data {tests-passed: (+ (get tests-passed athlete-data) u1)}))
      (map-set athletes athlete (merge athlete-data {compliant: false})))
    (var-set test-counter test-id)
    (var-set total-tests (+ (var-get total-tests) u1))
    (ok test-id)))

(define-public (restore-compliance (athlete principal))
  (let ((athlete-data (unwrap! (map-get? athletes athlete) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set athletes athlete (merge athlete-data {compliant: true}))
    (ok true)))
