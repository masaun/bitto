(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map dock-yards uint {
  yard-name: (string-ascii 100),
  location: (string-ascii 100),
  operator: principal,
  capacity: uint,
  certifications: (string-ascii 200),
  active: bool,
  registered-at: uint
})

(define-map yard-capabilities uint {
  yard-id: uint,
  capability-type: (string-ascii 100),
  max-vessel-size: uint,
  equipment: (string-ascii 200)
})

(define-data-var yard-nonce uint u0)
(define-data-var capability-nonce uint u0)

(define-public (register-dock-yard (name (string-ascii 100)) (location (string-ascii 100)) (capacity uint) (certs (string-ascii 200)))
  (let ((id (+ (var-get yard-nonce) u1)))
    (map-set dock-yards id {
      yard-name: name,
      location: location,
      operator: tx-sender,
      capacity: capacity,
      certifications: certs,
      active: true,
      registered-at: block-height
    })
    (var-set yard-nonce id)
    (ok id)))

(define-public (add-capability (yard-id uint) (capability (string-ascii 100)) (max-size uint) (equipment (string-ascii 200)))
  (let ((yard (unwrap! (map-get? dock-yards yard-id) err-not-found))
        (id (+ (var-get capability-nonce) u1)))
    (asserts! (is-eq tx-sender (get operator yard)) err-unauthorized)
    (map-set yard-capabilities id {
      yard-id: yard-id,
      capability-type: capability,
      max-vessel-size: max-size,
      equipment: equipment
    })
    (var-set capability-nonce id)
    (ok id)))

(define-public (update-yard-status (yard-id uint) (active bool))
  (let ((yard (unwrap! (map-get? dock-yards yard-id) err-not-found)))
    (asserts! (is-eq tx-sender (get operator yard)) err-unauthorized)
    (map-set dock-yards yard-id (merge yard {active: active}))
    (ok true)))

(define-read-only (get-yard (id uint))
  (ok (map-get? dock-yards id)))

(define-read-only (get-capability (id uint))
  (ok (map-get? yard-capabilities id)))
