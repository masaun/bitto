(define-map templates (string-ascii 64) {creator: principal, config: (buff 128), created-at: uint})
(define-map instances {template: (string-ascii 64), instance-id: uint} {owner: principal, created-at: uint})
(define-map instance-count (string-ascii 64) uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TEMPLATE-EXISTS (err u101))
(define-constant ERR-TEMPLATE-NOT-FOUND (err u102))

(define-public (create-template (template-name (string-ascii 64)) (config (buff 128)))
  (begin
    (asserts! (is-none (map-get? templates template-name)) ERR-TEMPLATE-EXISTS)
    (ok (map-set templates template-name {creator: tx-sender, config: config, created-at: stacks-block-height}))))

(define-public (create-instance (template-name (string-ascii 64)))
  (let ((template (unwrap! (map-get? templates template-name) ERR-TEMPLATE-NOT-FOUND))
        (instance-id (default-to u0 (map-get? instance-count template-name))))
    (map-set instances {template: template-name, instance-id: instance-id} {owner: tx-sender, created-at: stacks-block-height})
    (map-set instance-count template-name (+ instance-id u1))
    (ok instance-id)))

(define-read-only (get-template (template-name (string-ascii 64)))
  (map-get? templates template-name))

(define-read-only (get-instance (template-name (string-ascii 64)) (instance-id uint))
  (map-get? instances {template: template-name, instance-id: instance-id}))

(define-read-only (get-instance-count (template-name (string-ascii 64)))
  (map-get? instance-count template-name))
