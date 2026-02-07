(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-service-not-found (err u102))

(define-map service-requests uint {
  requester: principal,
  service-type: (string-ascii 50),
  priority: uint,
  status: (string-ascii 20),
  assigned-to: (optional principal),
  created-at: uint,
  completed-at: (optional uint)
})

(define-map service-providers principal {
  service-types: (list 10 (string-ascii 50)),
  active: bool,
  rating: uint
})

(define-data-var request-nonce uint u0)

(define-read-only (get-service-request (request-id uint))
  (ok (map-get? service-requests request-id)))

(define-read-only (get-provider (provider principal))
  (ok (map-get? service-providers provider)))

(define-public (register-provider (service-types (list 10 (string-ascii 50))))
  (begin
    (ok (map-set service-providers tx-sender {
      service-types: service-types,
      active: true,
      rating: u0
    }))))

(define-public (create-request (service-type (string-ascii 50)) (priority uint))
  (let ((request-id (+ (var-get request-nonce) u1)))
    (map-set service-requests request-id {
      requester: tx-sender,
      service-type: service-type,
      priority: priority,
      status: "pending",
      assigned-to: none,
      created-at: stacks-stacks-block-height,
      completed-at: none
    })
    (var-set request-nonce request-id)
    (ok request-id)))

(define-public (assign-request (request-id uint) (provider principal))
  (let ((request (unwrap! (map-get? service-requests request-id) err-service-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set service-requests request-id 
      (merge request {assigned-to: (some provider), status: "assigned"})))))

(define-public (complete-request (request-id uint))
  (let ((request (unwrap! (map-get? service-requests request-id) err-service-not-found)))
    (asserts! (is-eq (some tx-sender) (get assigned-to request)) err-not-authorized)
    (ok (map-set service-requests request-id 
      (merge request {status: "completed", completed-at: (some stacks-stacks-block-height)})))))

(define-public (rate-provider (provider principal) (rating uint))
  (let ((provider-data (unwrap! (map-get? service-providers provider) err-not-authorized)))
    (ok (map-set service-providers provider 
      (merge provider-data {rating: rating})))))
