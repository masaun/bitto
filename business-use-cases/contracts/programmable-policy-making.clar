(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-policy-not-found (err u102))
(define-constant err-condition-not-met (err u103))

(define-map policies uint {
  name: (string-ascii 100),
  conditions: (string-ascii 500),
  actions: (string-ascii 500),
  active: bool,
  execution-count: uint
})

(define-map policy-triggers {policy-id: uint, trigger-type: (string-ascii 50)} {
  threshold: uint,
  current-value: uint
})

(define-data-var policy-nonce uint u0)
(define-map policy-admins principal bool)

(define-read-only (get-policy (policy-id uint))
  (ok (map-get? policies policy-id)))

(define-read-only (get-trigger (policy-id uint) (trigger-type (string-ascii 50)))
  (ok (map-get? policy-triggers {policy-id: policy-id, trigger-type: trigger-type})))

(define-read-only (is-policy-admin (account principal))
  (default-to false (map-get? policy-admins account)))

(define-public (create-policy (name (string-ascii 100)) (conditions (string-ascii 500)) (actions (string-ascii 500)))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (asserts! (or (is-eq tx-sender contract-owner) (is-policy-admin tx-sender)) err-owner-only)
    (map-set policies policy-id {
      name: name,
      conditions: conditions,
      actions: actions,
      active: true,
      execution-count: u0
    })
    (var-set policy-nonce policy-id)
    (ok policy-id)))

(define-public (set-trigger (policy-id uint) (trigger-type (string-ascii 50)) (threshold uint))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-policy-admin tx-sender)) err-owner-only)
    (ok (map-set policy-triggers {policy-id: policy-id, trigger-type: trigger-type} {
      threshold: threshold,
      current-value: u0
    }))))

(define-public (update-trigger-value (policy-id uint) (trigger-type (string-ascii 50)) (value uint))
  (let ((trigger (unwrap! (map-get? policy-triggers {policy-id: policy-id, trigger-type: trigger-type}) err-policy-not-found)))
    (asserts! (or (is-eq tx-sender contract-owner) (is-policy-admin tx-sender)) err-owner-only)
    (ok (map-set policy-triggers {policy-id: policy-id, trigger-type: trigger-type} 
      (merge trigger {current-value: value})))))

(define-public (execute-policy (policy-id uint))
  (let ((policy (unwrap! (map-get? policies policy-id) err-policy-not-found)))
    (asserts! (get active policy) err-not-authorized)
    (ok (map-set policies policy-id 
      (merge policy {execution-count: (+ (get execution-count policy) u1)})))))

(define-public (toggle-policy (policy-id uint))
  (let ((policy (unwrap! (map-get? policies policy-id) err-policy-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set policies policy-id 
      (merge policy {active: (not (get active policy))})))))

(define-public (add-policy-admin (admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set policy-admins admin true))))

(define-public (remove-policy-admin (admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete policy-admins admin))))
