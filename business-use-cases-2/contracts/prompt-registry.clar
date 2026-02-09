(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map prompts uint {owner: principal, name: (string-ascii 64), hash: (buff 32), active: bool})
(define-data-var prompt-nonce uint u0)

(define-public (register-prompt (name (string-ascii 64)) (hash (buff 32)))
  (let ((prompt-id (+ (var-get prompt-nonce) u1)))
    (map-set prompts prompt-id {owner: tx-sender, name: name, hash: hash, active: true})
    (var-set prompt-nonce prompt-id)
    (ok prompt-id)))

(define-public (deactivate-prompt (prompt-id uint))
  (let ((prompt (unwrap! (map-get? prompts prompt-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner prompt) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set prompts prompt-id (merge prompt {active: false})))))

(define-read-only (get-prompt (prompt-id uint))
  (ok (map-get? prompts prompt-id)))
