(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map esg-entities uint {
  entity-name: (string-ascii 100),
  entity-type: (string-ascii 50),
  owner: principal,
  registered-at: uint
})

(define-map esg-metrics uint {
  entity-id: uint,
  reporting-period: (string-ascii 50),
  environmental-score: uint,
  social-score: uint,
  governance-score: uint,
  overall-rating: (string-ascii 10),
  data-sources: uint,
  submitted-at: uint,
  auto-verified: bool
})

(define-data-var entity-nonce uint u0)
(define-data-var metrics-nonce uint u0)

(define-public (register-esg-entity (name (string-ascii 100)) (etype (string-ascii 50)))
  (let ((id (+ (var-get entity-nonce) u1)))
    (map-set esg-entities id {
      entity-name: name,
      entity-type: etype,
      owner: tx-sender,
      registered-at: block-height
    })
    (var-set entity-nonce id)
    (ok id)))

(define-public (submit-esg-metrics (entity-id uint) (period (string-ascii 50)) (env uint) (soc uint) (gov uint) (sources uint))
  (let ((entity (unwrap! (map-get? esg-entities entity-id) err-not-found))
        (id (+ (var-get metrics-nonce) u1))
        (avg-score (/ (+ (+ env soc) gov) u3))
        (rating (if (>= avg-score u80) "A" 
                   (if (>= avg-score u60) "B" 
                      (if (>= avg-score u40) "C" "D")))))
    (asserts! (is-eq tx-sender (get owner entity)) err-unauthorized)
    (map-set esg-metrics id {
      entity-id: entity-id,
      reporting-period: period,
      environmental-score: env,
      social-score: soc,
      governance-score: gov,
      overall-rating: rating,
      data-sources: sources,
      submitted-at: block-height,
      auto-verified: (>= sources u3)
    })
    (var-set metrics-nonce id)
    (ok id)))

(define-read-only (get-entity (id uint))
  (ok (map-get? esg-entities id)))

(define-read-only (get-metrics (id uint))
  (ok (map-get? esg-metrics id)))
