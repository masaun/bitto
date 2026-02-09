(define-map versions {agent: principal, version: uint} {hash: (buff 32), timestamp: uint, active: bool})
(define-map current-version principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-VERSION-EXISTS (err u101))
(define-constant ERR-VERSION-NOT-FOUND (err u102))

(define-public (create-version (version uint) (hash (buff 32)))
  (let ((agent tx-sender))
    (asserts! (is-none (map-get? versions {agent: agent, version: version})) ERR-VERSION-EXISTS)
    (map-set versions {agent: agent, version: version} {hash: hash, timestamp: stacks-block-height, active: true})
    (map-set current-version agent version)
    (ok version)))

(define-public (activate-version (version uint))
  (let ((agent tx-sender))
    (asserts! (is-some (map-get? versions {agent: agent, version: version})) ERR-VERSION-NOT-FOUND)
    (ok (map-set current-version agent version))))

(define-public (deactivate-version (version uint))
  (let ((agent tx-sender)
        (version-data (unwrap! (map-get? versions {agent: agent, version: version}) ERR-VERSION-NOT-FOUND)))
    (ok (map-set versions {agent: agent, version: version} (merge version-data {active: false})))))

(define-read-only (get-version (agent principal) (version uint))
  (map-get? versions {agent: agent, version: version}))

(define-read-only (get-current-version (agent principal))
  (map-get? current-version agent))
