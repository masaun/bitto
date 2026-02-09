(define-map agents principal {name: (string-ascii 64), status: (string-ascii 16), created-at: uint})
(define-map agent-metadata principal {version: uint, capability-hash: (buff 32)})
(define-data-var agent-count uint u0)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-AGENT-EXISTS (err u101))
(define-constant ERR-AGENT-NOT-FOUND (err u102))

(define-public (register-agent (name (string-ascii 64)) (capability-hash (buff 32)))
  (let ((agent-id tx-sender))
    (asserts! (is-none (map-get? agents agent-id)) ERR-AGENT-EXISTS)
    (map-set agents agent-id {name: name, status: "active", created-at: stacks-block-height})
    (map-set agent-metadata agent-id {version: u1, capability-hash: capability-hash})
    (var-set agent-count (+ (var-get agent-count) u1))
    (ok agent-id)))

(define-public (update-status (agent-id principal) (status (string-ascii 16)))
  (let ((agent-data (unwrap! (map-get? agents agent-id) ERR-AGENT-NOT-FOUND)))
    (asserts! (is-eq tx-sender agent-id) ERR-NOT-AUTHORIZED)
    (ok (map-set agents agent-id (merge agent-data {status: status})))))

(define-public (update-capability (capability-hash (buff 32)))
  (let ((metadata (unwrap! (map-get? agent-metadata tx-sender) ERR-AGENT-NOT-FOUND)))
    (ok (map-set agent-metadata tx-sender (merge metadata {capability-hash: capability-hash})))))

(define-read-only (get-agent (agent-id principal))
  (map-get? agents agent-id))

(define-read-only (get-agent-metadata (agent-id principal))
  (map-get? agent-metadata agent-id))

(define-read-only (get-agent-count)
  (ok (var-get agent-count)))
