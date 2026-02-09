(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map monetization-models uint {agent-id: uint, model: (string-ascii 32), rate: uint})

(define-public (set-monetization (agent-id uint) (model (string-ascii 32)) (rate uint))
  (let ((model-id agent-id))
    (asserts! (> rate u0) ERR-INVALID-PARAMETER)
    (ok (map-set monetization-models model-id {agent-id: agent-id, model: model, rate: rate}))))

(define-read-only (get-monetization (model-id uint))
  (ok (map-get? monetization-models model-id)))
