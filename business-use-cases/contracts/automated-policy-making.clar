(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-policy-not-found (err u102))

(define-map policies uint {
  name: (string-ascii 100),
  trigger-conditions: (string-ascii 500),
  actions: (string-ascii 500),
  auto-execute: bool,
  execution-count: uint
})

(define-map policy-data {policy-id: uint, data-key: (string-ascii 50)} uint)

(define-data-var policy-nonce uint u0)
(define-map automation-operators principal bool)

(define-read-only (get-policy (policy-id uint))
  (ok (map-get? policies policy-id)))

(define-read-only (get-policy-data (policy-id uint) (data-key (string-ascii 50)))
  (ok (map-get? policy-data {policy-id: policy-id, data-key: data-key})))

(define-read-only (is-operator (account principal))
  (default-to false (map-get? automation-operators account)))

(define-public (create-policy (name (string-ascii 100)) (trigger-conditions (string-ascii 500)) (actions (string-ascii 500)) (auto-execute bool))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set policies policy-id {
      name: name,
      trigger-conditions: trigger-conditions,
      actions: actions,
      auto-execute: auto-execute,
      execution-count: u0
    })
    (var-set policy-nonce policy-id)
    (ok policy-id)))

(define-public (set-policy-data (policy-id uint) (data-key (string-ascii 50)) (value uint))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-operator tx-sender)) err-owner-only)
    (ok (map-set policy-data {policy-id: policy-id, data-key: data-key} value))))

(define-public (execute-policy (policy-id uint))
  (let ((policy (unwrap! (map-get? policies policy-id) err-policy-not-found)))
    (asserts! (or (is-eq tx-sender contract-owner) (is-operator tx-sender)) err-owner-only)
    (ok (map-set policies policy-id 
      (merge policy {execution-count: (+ (get execution-count policy) u1)})))))

(define-public (add-operator (operator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set automation-operators operator true))))

(define-public (remove-operator (operator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete automation-operators operator))))
