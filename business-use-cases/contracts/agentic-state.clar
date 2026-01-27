(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-service-not-found (err u102))

(define-map government-services uint {
  name: (string-ascii 100),
  provider: principal,
  api-endpoint: (string-ascii 200),
  data-schema: (string-ascii 500),
  active: bool,
  usage-count: uint
})

(define-map service-requests uint {
  service-id: uint,
  requester: principal,
  request-data: (string-ascii 500),
  response-hash: (optional (buff 32)),
  timestamp: uint,
  status: (string-ascii 20)
})

(define-map authorized-consumers principal bool)
(define-data-var service-nonce uint u0)
(define-data-var request-nonce uint u0)

(define-read-only (get-service (service-id uint))
  (ok (map-get? government-services service-id)))

(define-read-only (get-request (request-id uint))
  (ok (map-get? service-requests request-id)))

(define-read-only (is-authorized-consumer (consumer principal))
  (default-to false (map-get? authorized-consumers consumer)))

(define-public (register-service (name (string-ascii 100)) (api-endpoint (string-ascii 200)) (data-schema (string-ascii 500)))
  (let ((service-id (+ (var-get service-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set government-services service-id {
      name: name,
      provider: tx-sender,
      api-endpoint: api-endpoint,
      data-schema: data-schema,
      active: true,
      usage-count: u0
    })
    (var-set service-nonce service-id)
    (ok service-id)))

(define-public (request-service (service-id uint) (request-data (string-ascii 500)))
  (let (
    (service (unwrap! (map-get? government-services service-id) err-service-not-found))
    (request-id (+ (var-get request-nonce) u1))
  )
    (asserts! (is-authorized-consumer tx-sender) err-not-authorized)
    (asserts! (get active service) err-not-authorized)
    (map-set service-requests request-id {
      service-id: service-id,
      requester: tx-sender,
      request-data: request-data,
      response-hash: none,
      timestamp: stacks-stacks-block-height,
      status: "pending"
    })
    (var-set request-nonce request-id)
    (ok (map-set government-services service-id 
      (merge service {usage-count: (+ (get usage-count service) u1)})))))

(define-public (fulfill-request (request-id uint) (response-hash (buff 32)))
  (let ((request (unwrap! (map-get? service-requests request-id) err-not-authorized)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set service-requests request-id 
      (merge request {response-hash: (some response-hash), status: "completed"})))))

(define-public (authorize-consumer (consumer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-consumers consumer true))))

(define-public (revoke-consumer (consumer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete authorized-consumers consumer))))
