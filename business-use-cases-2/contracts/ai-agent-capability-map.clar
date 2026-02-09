(define-map capabilities {agent: principal, capability: (string-ascii 64)} {enabled: bool, level: uint})
(define-map capability-list principal (list 20 (string-ascii 64)))

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-CAPABILITY-NOT-FOUND (err u102))

(define-public (add-capability (capability (string-ascii 64)) (level uint))
  (let ((agent tx-sender))
    (map-set capabilities {agent: agent, capability: capability} {enabled: true, level: level})
    (let ((caps (default-to (list) (map-get? capability-list agent))))
      (ok (map-set capability-list agent (unwrap-panic (as-max-len? (append caps capability) u20)))))))

(define-public (update-capability (capability (string-ascii 64)) (enabled bool) (level uint))
  (let ((agent tx-sender))
    (asserts! (is-some (map-get? capabilities {agent: agent, capability: capability})) ERR-CAPABILITY-NOT-FOUND)
    (ok (map-set capabilities {agent: agent, capability: capability} {enabled: enabled, level: level}))))

(define-public (remove-capability (capability (string-ascii 64)))
  (let ((agent tx-sender))
    (ok (map-delete capabilities {agent: agent, capability: capability}))))

(define-read-only (get-capability (agent principal) (capability (string-ascii 64)))
  (map-get? capabilities {agent: agent, capability: capability}))

(define-read-only (get-capabilities (agent principal))
  (map-get? capability-list agent))
