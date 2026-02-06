(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map carbon-projects uint {
  project-name: (string-ascii 100),
  owner: principal,
  project-type: (string-ascii 50),
  baseline-emissions: uint,
  status: (string-ascii 20),
  registered-at: uint
})

(define-map mrv-data uint {
  project-id: uint,
  measured-emissions: uint,
  reduced-emissions: uint,
  verification-method: (string-ascii 100),
  verified-by: principal,
  timestamp: uint,
  credits-issued: uint
})

(define-data-var project-nonce uint u0)
(define-data-var mrv-nonce uint u0)

(define-public (register-carbon-project (name (string-ascii 100)) (ptype (string-ascii 50)) (baseline uint))
  (let ((id (+ (var-get project-nonce) u1)))
    (map-set carbon-projects id {
      project-name: name,
      owner: tx-sender,
      project-type: ptype,
      baseline-emissions: baseline,
      status: "active",
      registered-at: block-height
    })
    (var-set project-nonce id)
    (ok id)))

(define-public (submit-mrv-report (project-id uint) (measured uint) (method (string-ascii 100)))
  (let ((project (unwrap! (map-get? carbon-projects project-id) err-not-found))
        (id (+ (var-get mrv-nonce) u1))
        (reduced (if (> (get baseline-emissions project) measured)
                     (- (get baseline-emissions project) measured)
                     u0))
        (credits (/ reduced u1000)))
    (asserts! (is-eq tx-sender (get owner project)) err-unauthorized)
    (map-set mrv-data id {
      project-id: project-id,
      measured-emissions: measured,
      reduced-emissions: reduced,
      verification-method: method,
      verified-by: tx-sender,
      timestamp: block-height,
      credits-issued: credits
    })
    (var-set mrv-nonce id)
    (ok credits)))

(define-public (update-project-status (project-id uint) (status (string-ascii 20)))
  (let ((project (unwrap! (map-get? carbon-projects project-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set carbon-projects project-id (merge project {status: status}))
    (ok true)))

(define-read-only (get-project (id uint))
  (ok (map-get? carbon-projects id)))

(define-read-only (get-mrv-data (id uint))
  (ok (map-get? mrv-data id)))
